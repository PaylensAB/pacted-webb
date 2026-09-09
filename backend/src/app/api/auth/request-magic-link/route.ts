/**
 * POST /api/auth/request-magic-link
 *
 * Begär en inloggningslänk för en existerande användare.
 * Hastighetsbegränsad: max 3 förfrågningar per IP per 15 min.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createMagicLink, hashIp } from '@/lib/auth';
import { sendMagicLink } from '@/lib/email';

const BodySchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Säkerhetsmedveten respons: vi avslöjar INTE om mejl finns eller inte
  // (förhindrar enumeration). Vi returnerar alltid 200 även om vi inte gör något.

  const user = await db.user.findUnique({
    where: { email: body.email },
    select: { id: true, name: true, deletedAt: true },
  });

  if (user && !user.deletedAt) {
    const requestIp = req.headers.get('x-forwarded-for')?.split(',')[0] ?? undefined;
    const { token } = await createMagicLink(user.id, requestIp);
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

    await sendMagicLink({
      to: body.email,
      name: user.name,
      url,
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'auth.magic_link_requested',
        ipHash: requestIp ? hashIp(requestIp) : null,
      },
    });
  }

  // Alltid samma svar oavsett om mejl fanns
  return NextResponse.json({ ok: true, message: 'Om mejl finns i vårt system har vi skickat en länk dit.' });
}
