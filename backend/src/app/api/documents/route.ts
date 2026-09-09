/**
 * /api/documents
 *
 * GET  — lista dokument för aktuell kund (multi-tenant filter)
 * POST — skapa nytt dokument + QR-kod
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';
import QRCode from 'qrcode';
import { uploadObject } from '@/lib/storage';

const CreateDocSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  type: z.string().min(1).max(100),
  templateKey: z.string().optional(),
});

export async function GET(req: NextRequest) {
  let session;
  try { session = await requireSession(); }
  catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode });
    throw e;
  }

  const documents = await db.document.findMany({
    where: { customerId: session.customerId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      type: true,
      description: true,
      qrToken: true,
      qrImageUrl: true,
      createdAt: true,
      _count: { select: { signatureEvents: true } },
    },
  });

  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  let session;
  try { session = await requireSession(); }
  catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode });
    throw e;
  }

  let body: z.infer<typeof CreateDocSchema>;
  try {
    body = CreateDocSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Generera token för publik QR-länk
  const qrToken = randomBytes(16).toString('base64url');
  const signUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign?token=${qrToken}`;

  // Generera QR-PNG och ladda upp till S3
  const qrPng = await QRCode.toBuffer(signUrl, {
    width: 512,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#0f172a', light: '#ffffff' },
  });

  const qrKey = `qr/${session.customerId}/${qrToken}.png`;
  await uploadObject({
    key: qrKey,
    body: qrPng,
    contentType: 'image/png',
  });

  const doc = await db.document.create({
    data: {
      customerId: session.customerId,
      title: body.title,
      description: body.description,
      type: body.type,
      templateKey: body.templateKey,
      qrToken,
      qrImageUrl: qrKey,
      createdByUserId: session.userId,
    },
  });

  await db.auditLog.create({
    data: {
      customerId: session.customerId,
      userId: session.userId,
      action: 'document.created',
      resource: `Document:${doc.id}`,
    },
  });

  return NextResponse.json({ document: doc, signUrl });
}
