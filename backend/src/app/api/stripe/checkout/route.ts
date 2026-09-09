/**
 * POST /api/stripe/checkout
 *
 * Skapar en Stripe Checkout Session och returnerar URL.
 * Frontend redirectar användaren dit för att betala.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession, type PlanKey } from '@/lib/stripe';

const BodySchema = z.object({
  plan: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
  email: z.string().email(),
  companyName: z.string().min(1),
  orgnr: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await createCheckoutSession({
    plan: body.plan as PlanKey,
    email: body.email,
    companyName: body.companyName,
    orgnr: body.orgnr,
    successUrl: `${baseUrl}/welcome?session={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/signup?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
