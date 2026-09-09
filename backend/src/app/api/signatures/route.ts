/**
 * POST /api/signatures
 *
 * Detta är hjärtat i hela tjänsten — när en anställd skickar in en signatur.
 *
 * Flöde (transient relay):
 * 1. Validera dokument-token (publik QR-token, ingen auth krävs)
 * 2. Skapa PendingSignature med PII (namn, anställningsnr, signaturbild)
 * 3. Generera signed PDF
 * 4. Försök leverera till HR-system enligt DeliveryConfig
 * 5. Vid framgång: radera all PII, behåll endast anonym SignatureEvent
 * 6. Vid fel: behåll PendingSignature för retry, men max 48h
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashIp } from '@/lib/auth';
import { generateSignedPdf } from '@/lib/pdf';
import { uploadObject, deleteObject } from '@/lib/storage';
import { deliverSignature } from '@/lib/delivery';

const SignatureSchema = z.object({
  documentToken: z.string().min(10),
  signerName: z.string().min(1).max(200),
  signerEmpno: z.string().min(1).max(100),
  // Base64-encoded PNG
  signatureDataUrl: z.string().startsWith('data:image/png;base64,'),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof SignatureSchema>;
  try {
    body = SignatureSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // 1. Hitta dokumentet via QR-token
  const document = await db.document.findUnique({
    where: { qrToken: body.documentToken },
    include: {
      customer: {
        include: { deliveryConfig: true, subscription: true },
      },
    },
  });

  if (!document || document.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Document not found or inactive' }, { status: 404 });
  }

  // Kunden måste ha aktiv prenumeration
  if (!document.customer.subscription || !['ACTIVE', 'TRIALING'].includes(document.customer.subscription.status)) {
    return NextResponse.json({ error: 'Customer subscription is not active' }, { status: 402 });
  }

  const requestIp = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const userAgent = req.headers.get('user-agent') ?? undefined;

  // 2. Ladda upp signaturbild till S3
  const sigBuffer = Buffer.from(body.signatureDataUrl.split(',')[1], 'base64');
  const sigKey = `signatures/${document.customerId}/${document.id}/${Date.now()}.png`;
  await uploadObject({ key: sigKey, body: sigBuffer, contentType: 'image/png' });

  // 3. Skapa PendingSignature med 48h TTL
  const signedAt = new Date();
  const expiresAt = new Date(signedAt.getTime() + 48 * 60 * 60 * 1000);

  const pending = await db.pendingSignature.create({
    data: {
      customerId: document.customerId,
      documentId: document.id,
      signerName: body.signerName,
      signerEmpno: body.signerEmpno,
      signerSignatureUrl: sigKey,
      signedAt,
      ipHash: hashIp(requestIp),
      userAgent,
      expiresAt,
    },
  });

  // 4. Generera signed PDF
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generateSignedPdf({
      document: {
        id: document.id,
        title: document.title,
        type: document.type,
        description: document.description,
        createdAt: document.createdAt,
        customerName: document.customer.name,
      },
      signature: {
        id: pending.id,
        name: body.signerName,
        empno: body.signerEmpno,
        signedAt,
        signaturePngBytes: sigBuffer,
        userAgent,
      },
    });
  } catch (err: any) {
    await db.pendingSignature.update({
      where: { id: pending.id },
      data: { deliveryStatus: 'FAILED', lastDeliveryError: `PDF gen: ${err.message}` },
    });
    return NextResponse.json({ error: 'Could not generate PDF' }, { status: 500 });
  }

  // Ladda upp PDF till S3 (temporärt)
  const pdfKey = `pdfs/${document.customerId}/${document.id}/${pending.id}.pdf`;
  await uploadObject({ key: pdfKey, body: Buffer.from(pdfBytes), contentType: 'application/pdf' });
  await db.pendingSignature.update({
    where: { id: pending.id },
    data: { signedPdfUrl: pdfKey },
  });

  // 5. Leverera till HR-system asynkront
  // I produktion: lägg i kö (Upstash Queue eller Vercel Queue) för retry
  // För nu: synkron leverans
  const deliveryResult = await deliverSignature({
    pendingSignatureId: pending.id,
    pdfBytes: Buffer.from(pdfBytes),
  });

  // 6. Om leverans lyckades, radera all PII och behåll endast anonym SignatureEvent
  if (deliveryResult.success) {
    await finalizeAndScrub(pending.id);
  }

  return NextResponse.json({
    success: true,
    signatureId: pending.id,
    delivered: deliveryResult.success,
    // Returnera PDF som base64 så signeraren kan ladda ner sin kopia
    pdfBase64: Buffer.from(pdfBytes).toString('base64'),
  });
}

/**
 * Slutför signaturen genom att radera all PII och spara endast
 * anonym metadata för fakturering.
 */
async function finalizeAndScrub(pendingId: string) {
  const pending = await db.pendingSignature.findUnique({ where: { id: pendingId } });
  if (!pending) return;

  // Radera bilder från S3
  if (pending.signerSignatureUrl) {
    await deleteObject(pending.signerSignatureUrl).catch(() => null);
  }
  if (pending.signedPdfUrl) {
    await deleteObject(pending.signedPdfUrl).catch(() => null);
  }

  // Skapa anonym SignatureEvent
  await db.signatureEvent.create({
    data: {
      customerId: pending.customerId,
      documentId: pending.documentId,
      signedAt: pending.signedAt,
      deliveredAt: new Date(),
      deliveryMethod: 'EMAIL', // Sätt baserat på faktisk metod
      deliverySucceeded: true,
      billingPeriod: pending.signedAt.toISOString().slice(0, 7), // YYYY-MM
    },
  });

  // Radera PendingSignature (PII)
  await db.pendingSignature.delete({ where: { id: pendingId } });
}
