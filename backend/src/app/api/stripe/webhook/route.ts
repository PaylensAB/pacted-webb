/**
 * POST /api/stripe/webhook
 *
 * Stripe-events kommer hit. Vi måste:
 * 1. Verifiera signaturen (annars kan vem som helst förfalska events)
 * 2. Idempotency-check (samma event kan komma flera gånger)
 * 3. Uppdatera vår databas baserat på event-typ
 * 4. Returnera 200 så snart vi tagit emot — annars retryar Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, verifyWebhookSignature, planFromPriceId } from '@/lib/stripe';
import { db } from '@/lib/db';
import { sendPaymentFailedReminder } from '@/lib/email';

// Viktigt för Stripe: vi behöver raw body för signaturverifiering
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(body, signature);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  // Idempotency — kolla att vi inte redan bearbetat detta event
  const existing = await db.webhookEvent.findUnique({ where: { stripeId: event.id } });
  if (existing?.processedAt) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  await db.webhookEvent.upsert({
    where: { stripeId: event.id },
    create: { stripeId: event.id, type: event.type },
    update: {},
  });

  try {
    await handleEvent(event);
    await db.webhookEvent.update({
      where: { stripeId: event.id },
      data: { processedAt: new Date() },
    });
  } catch (err: any) {
    // Logga felet men returnera 500 så Stripe retryar
    console.error('Webhook handler failed:', event.type, err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    case 'invoice.paid':
      // Bara loggning — fakturadetaljer hämtas via Stripe Customer Portal
      break;
    default:
      // Övriga events ignoreras
      break;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.customer || !session.subscription) return;

  // Hämta subscription för att få plan-info
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const priceId = subscription.items.data[0]?.price.id;
  const plan = planFromPriceId(priceId ?? '');
  if (!plan) {
    console.error('Unknown price id:', priceId);
    return;
  }

  // Hitta eller skapa Customer baserat på Stripe-customer
  const stripeCustomer = await stripe.customers.retrieve(session.customer as string);
  if (stripeCustomer.deleted) return;

  const email = stripeCustomer.email!;
  const companyName = (subscription.metadata?.companyName as string) ?? stripeCustomer.name ?? 'Okänt företag';
  const orgnr = (subscription.metadata?.orgnr as string) ?? 'N/A';

  const customer = await db.customer.upsert({
    where: { orgnr },
    create: {
      name: companyName,
      orgnr,
      contactEmail: email,
    },
    update: { contactEmail: email },
  });

  // Skapa initial User
  await db.user.upsert({
    where: { email },
    create: {
      email,
      name: stripeCustomer.name ?? email.split('@')[0],
      customerId: customer.id,
      role: 'OWNER',
    },
    update: { customerId: customer.id },
  });

  // Skapa Subscription
  await db.subscription.upsert({
    where: { customerId: customer.id },
    create: {
      customerId: customer.id,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      plan,
      status: stripeStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
    update: {
      stripeSubscriptionId: subscription.id,
      plan,
      status: stripeStatus(subscription.status),
    },
  });

  // Skicka välkomstmejl + magic link (i finalbygget)
  // sendWelcomeWithMagicLink(email, ...) — se email.ts
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: {
      status: stripeStatus(sub.status),
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
    },
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: { status: 'CANCELED', canceledAt: new Date() },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.customer) return;
  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
    include: { customer: { include: { users: { where: { role: 'OWNER' } } } } },
  });
  if (!sub) return;

  const owner = sub.customer.users[0];
  if (owner) {
    await sendPaymentFailedReminder({
      to: owner.email,
      name: owner.name,
      amount: (invoice.amount_due ?? 0) / 100,
      dueDate: new Date((invoice.due_date ?? Date.now() / 1000) * 1000),
      updateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/payment-method`,
    });
  }

  await db.subscription.update({
    where: { id: sub.id },
    data: { status: 'PAST_DUE' },
  });
}

function stripeStatus(s: Stripe.Subscription.Status):
  | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' {
  if (s === 'trialing') return 'TRIALING';
  if (s === 'active') return 'ACTIVE';
  if (s === 'past_due') return 'PAST_DUE';
  if (s === 'canceled' || s === 'incomplete_expired') return 'CANCELED';
  return 'UNPAID';
}
