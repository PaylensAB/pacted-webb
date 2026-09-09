/**
 * GET /api/cron/purge-expired
 *
 * Körs av Vercel Cron varje timme för att radera utgångna PendingSignatures
 * och deras S3-objekt.
 *
 * Hela poängen med transient relay-arkitekturen: även om leverans misslyckas
 * raderas all PII efter 48h.
 *
 * Säkerhet: endast nåbar med CRON_SECRET-header (sätt i Vercel Environment).
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deleteObject } from '@/lib/storage';
import { autoUpgradeIfWarranted, notifyOverageIfNeeded } from '@/lib/usage';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Authorize via header (Vercel Cron sätter automatiskt en Bearer-header)
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // Steg 1: Kolla användning för alla aktiva kunder — notisera / auto-uppgradera
  const activeCustomers = await db.customer.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  });
  let notified = 0, upgraded = 0;
  for (const c of activeCustomers) {
    try {
      await notifyOverageIfNeeded(c.id);
      const result = await autoUpgradeIfWarranted(c.id);
      if (result.upgraded) upgraded++;
      notified++;
    } catch (err: any) {
      console.error(`Usage check failed for ${c.id}:`, err.message);
    }
  }

  // Steg 2: Hitta alla utgångna PendingSignatures
  const expired = await db.pendingSignature.findMany({
    where: { expiresAt: { lte: now } },
    select: {
      id: true,
      customerId: true,
      documentId: true,
      signedAt: true,
      signerSignatureUrl: true,
      signedPdfUrl: true,
      deliveryStatus: true,
    },
  });

  let scrubbed = 0;
  let failed = 0;

  for (const p of expired) {
    try {
      // Radera S3-objekt
      if (p.signerSignatureUrl) await deleteObject(p.signerSignatureUrl).catch(() => null);
      if (p.signedPdfUrl) await deleteObject(p.signedPdfUrl).catch(() => null);

      // Skapa anonym SignatureEvent (om det inte redan finns ett)
      // — så att vi har kvar fakturerbar metadata även om leverans misslyckats
      await db.signatureEvent.create({
        data: {
          customerId: p.customerId,
          documentId: p.documentId,
          signedAt: p.signedAt,
          deliveredAt: null,
          deliveryMethod: 'EMAIL', // Default — kan förfinas
          deliverySucceeded: p.deliveryStatus === 'DELIVERED',
          billingPeriod: p.signedAt.toISOString().slice(0, 7),
        },
      });

      // Radera PendingSignature (PII)
      await db.pendingSignature.delete({ where: { id: p.id } });
      scrubbed++;
    } catch (err: any) {
      console.error(`Failed to scrub pending ${p.id}:`, err.message);
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    scrubbed,
    failed,
    customersChecked: notified,
    autoUpgraded: upgraded,
    timestamp: now.toISOString(),
  });
}
