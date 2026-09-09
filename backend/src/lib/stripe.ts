/**
 * Stripe-integration
 *
 * Använder Stripe Checkout för signup (ingen PCI-belastning på oss)
 * och webhook för att hålla vår databas i synk.
 */

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
  typescript: true,
});

// Årsprenumeration: 299 / 699 / 999 kr/år för B2B + 29 kr/år för privatpersoner
// "Free" plan finns ingen Stripe-produkt — hanteras helt internt (max 10 signaturer/år)
export const PRICE_IDS = {
  PRIVATE: process.env.STRIPE_PRICE_ID_PRIVATE!, // 29 kr/år — B2C
  SMALL: process.env.STRIPE_PRICE_ID_SMALL!,     // 299 kr/år
  MEDIUM: process.env.STRIPE_PRICE_ID_MEDIUM!,   // 699 kr/år
  LARGE: process.env.STRIPE_PRICE_ID_LARGE!,     // 999 kr/år
} as const;

export type PlanKey = keyof typeof PRICE_IDS;

// Signatur-tak per plan (per kalenderår)
export const PLAN_LIMITS = {
  FREE:   10,
  SMALL:  500,
  MEDIUM: 2000,
  LARGE:  5000,
} as const;

// Effektivt månadspris (för UI-display, inte fakturering)
export const PLAN_DISPLAY = {
  FREE:   { yearly: 0,   monthlyEq: 0,  limit: 10 },
  SMALL:  { yearly: 299, monthlyEq: 25, limit: 500 },
  MEDIUM: { yearly: 699, monthlyEq: 58, limit: 2000 },
  LARGE:  { yearly: 999, monthlyEq: 83, limit: 5000 },
} as const;

/**
 * Skapa en Stripe Checkout Session för en ny prenumeration.
 * Returnerar URL där användaren betalar.
 */
export async function createCheckoutSession(opts: {
  plan: PlanKey;
  email: string;
  companyName: string;
  orgnr: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: PRICE_IDS[opts.plan], quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        companyName: opts.companyName,
        orgnr: opts.orgnr,
      },
    },
    customer_email: opts.email,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    locale: 'sv',
    // Sätt fakturafält
    invoice_creation: { enabled: true },
    tax_id_collection: { enabled: true },
    billing_address_collection: 'required',
  });
}

/**
 * Skapa en Customer Portal-session — använder Stripe's hostade
 * portal där kunden kan uppdatera kort, ladda ner fakturor m.m.
 */
export async function createCustomerPortalSession(opts: {
  stripeCustomerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: opts.stripeCustomerId,
    return_url: opts.returnUrl,
  });
}

/**
 * Mappa Stripe-prisid till vår interna plan-enum
 */
export function planFromPriceId(priceId: string): PlanKey | null {
  if (priceId === PRICE_IDS.SMALL) return 'SMALL';
  if (priceId === PRICE_IDS.MEDIUM) return 'MEDIUM';
  if (priceId === PRICE_IDS.LARGE) return 'LARGE';
  return null;
}

/**
 * Verifiera Stripe-webhook-signatur. Kastar vid invaliditet.
 */
export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
