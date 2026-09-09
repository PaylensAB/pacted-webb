/**
 * GET /api/auth/verify?token=...
 *
 * Användaren kommer hit från klicket i magic link-mejlet.
 * Vi validerar token, sätter session-cookie och redirectar till admin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { consumeMagicLink, getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', req.url));
  }

  try {
    const user = await consumeMagicLink(token);

    const session = await getSession();
    session.userId = user.id;
    session.customerId = user.customerId;
    session.email = user.email;
    session.role = user.role as 'OWNER' | 'ADMIN' | 'VIEWER';
    await session.save();

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await db.auditLog.create({
      data: {
        customerId: user.customerId,
        userId: user.id,
        action: 'auth.login_succeeded',
      },
    });

    return NextResponse.redirect(new URL('/admin', req.url));
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message ?? 'invalid_token')}`, req.url)
    );
  }
}
