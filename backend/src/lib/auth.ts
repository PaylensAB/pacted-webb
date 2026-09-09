/**
 * Autentisering — magic links + krypterade sessions
 *
 * Flöde:
 * 1. Användaren matar in mejl på /login
 * 2. Backend skapar en MagicLink-rad med en SHA-256-hash av en slumpmässig token
 * 3. Token skickas till mejl (klartext, för engångsbruk)
 * 4. Användaren klickar länken → /api/auth/verify?token=xxx
 * 5. Backend hashar token, slår upp MagicLink, kollar att den inte är konsumerad och inte utgången
 * 6. Markerar konsumerad, skapar krypterad session-cookie via iron-session
 * 7. Användaren är nu inloggad i 12 timmar
 */

import { cookies } from 'next/headers';
import { getIronSession, SessionOptions } from 'iron-session';
import { createHash, randomBytes } from 'crypto';
import { db } from './db';

export type SessionData = {
  userId?: string;
  customerId?: string;
  email?: string;
  role?: 'OWNER' | 'ADMIN' | 'VIEWER';
};

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: process.env.SESSION_COOKIE_NAME ?? 'pacted_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 timmar
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

/**
 * Auth-guard för API-routes. Kasta 401 om ingen giltig session.
 */
export async function requireSession(): Promise<Required<SessionData>> {
  const session = await getSession();
  if (!session.userId || !session.customerId) {
    throw new AuthError('Not authenticated', 401);
  }
  return session as Required<SessionData>;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
  }
}

// ============== Magic links ==============

/**
 * Skapa en magic link för en användare.
 * Returnerar token i klartext (skickas via mejl) + databas-id.
 */
export async function createMagicLink(userId: string, requestIp?: string) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  const record = await db.magicLink.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      requestIp: requestIp ? hashIp(requestIp) : null,
    },
  });

  return { token, id: record.id, expiresAt };
}

/**
 * Validera och konsumera en magic link. Returnerar User vid framgång.
 */
export async function consumeMagicLink(token: string) {
  const tokenHash = hashToken(token);
  const link = await db.magicLink.findUnique({
    where: { tokenHash },
    include: { user: { include: { customer: true } } },
  });

  if (!link) throw new AuthError('Invalid token', 401);
  if (link.consumedAt) throw new AuthError('Token already used', 401);
  if (link.expiresAt < new Date()) throw new AuthError('Token expired', 401);

  await db.magicLink.update({
    where: { id: link.id },
    data: { consumedAt: new Date() },
  });

  // Markera även att användarens e-post är verifierad
  if (!link.user.emailVerifiedAt) {
    await db.user.update({
      where: { id: link.userId },
      data: { emailVerifiedAt: new Date() },
    });
  }

  return link.user;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Hasha IP för audit/abuse-syften — vi vill kunna se att samma IP försöker
 * många gånger utan att lagra själva IP-adressen
 */
export function hashIp(ip: string): string {
  const salt = process.env.SESSION_SECRET ?? '';
  return createHash('sha256').update(ip + salt).digest('hex').slice(0, 16);
}
