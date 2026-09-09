/**
 * Generisk leverans av signerade dokument till kundens valda mottagar­system.
 *
 * Routerar baserat på DeliveryConfig.method till rätt adapter:
 * - EMAIL → email.ts → Resend
 * - CATALYSTONE → catalystone.ts → CatalystOne API
 * - VISMA / HOGIA / FORTNOX → roadmap
 * - SFTP → roadmap
 * - WEBHOOK → POST till kundens egen endpoint
 */

import { db } from './db';
import { decryptJson } from './crypto';
import { deliverSignedDocument } from './email';
import * as catalystone from './catalystone';
import type { CatalystOneConfig } from './catalystone';

export interface DeliveryResult {
  success: boolean;
  externalId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export async function deliverSignature(opts: {
  pendingSignatureId: string;
  pdfBytes: Buffer;
}): Promise<DeliveryResult> {
  const pending = await db.pendingSignature.findUnique({
    where: { id: opts.pendingSignatureId },
    include: {
      document: true,
      customer: { include: { deliveryConfig: true } },
    },
  });
  if (!pending) {
    return { success: false, errorCode: 'NOT_FOUND', errorMessage: 'PendingSignature saknas' };
  }

  await db.pendingSignature.update({
    where: { id: pending.id },
    data: { deliveryStatus: 'DELIVERING', deliveryAttempts: { increment: 1 } },
  });

  const config = pending.customer.deliveryConfig;
  if (!config || !config.isActive) {
    return await recordDeliveryFailure(pending.id, 'NO_CONFIG', 'Ingen aktiv leveranskonfiguration');
  }

  let result: DeliveryResult;

  try {
    switch (config.method) {
      case 'EMAIL': {
        if (!config.emailRecipient) {
          result = { success: false, errorCode: 'MISSING_RECIPIENT', errorMessage: 'E-postadress saknas' };
        } else {
          await deliverSignedDocument({
            to: config.emailRecipient,
            documentTitle: pending.document.title,
            signerName: pending.signerName,
            signedAt: pending.signedAt,
            pdfBytes: opts.pdfBytes,
            filename: `${sanitize(pending.document.title)}_${pending.signerEmpno}.pdf`,
          });
          result = { success: true };
        }
        break;
      }

      case 'CATALYSTONE': {
        const cfg = decryptJson<CatalystOneConfig>(config.configEncrypted);
        result = await catalystone.uploadSignedDocument({
          config: cfg,
          signerIdentifier: pending.signerEmpno,
          documentTitle: pending.document.title,
          documentType: pending.document.type,
          pdfBytes: opts.pdfBytes,
          signedAt: pending.signedAt,
        });
        break;
      }

      case 'WEBHOOK': {
        const cfg = decryptJson<{ url: string; secret?: string }>(config.configEncrypted);
        result = await deliverWebhook(cfg, pending, opts.pdfBytes);
        break;
      }

      default:
        result = { success: false, errorCode: 'NOT_IMPLEMENTED', errorMessage: `Metoden ${config.method} är inte implementerad än` };
    }
  } catch (err: any) {
    result = { success: false, errorCode: 'EXCEPTION', errorMessage: err.message ?? 'Okänt fel' };
  }

  if (result.success) {
    await db.pendingSignature.update({
      where: { id: pending.id },
      data: { deliveryStatus: 'DELIVERED', deliveredAt: new Date() },
    });
  } else {
    await recordDeliveryFailure(pending.id, result.errorCode ?? 'UNKNOWN', result.errorMessage ?? 'Okänt fel');
  }

  return result;
}

async function recordDeliveryFailure(pendingId: string, code: string, message: string): Promise<DeliveryResult> {
  await db.pendingSignature.update({
    where: { id: pendingId },
    data: {
      deliveryStatus: 'FAILED',
      lastDeliveryError: `${code}: ${message}`,
    },
  });
  return { success: false, errorCode: code, errorMessage: message };
}

async function deliverWebhook(
  cfg: { url: string; secret?: string },
  pending: any,
  pdfBytes: Buffer
): Promise<DeliveryResult> {
  const formData = new FormData();
  formData.append('signerName', pending.signerName);
  formData.append('signerEmpno', pending.signerEmpno);
  formData.append('signedAt', pending.signedAt.toISOString());
  formData.append('documentTitle', pending.document.title);
  formData.append('pdf', new Blob([pdfBytes], { type: 'application/pdf' }), 'signed.pdf');

  const headers: Record<string, string> = {};
  if (cfg.secret) headers['X-Pacted-Secret'] = cfg.secret;

  const res = await fetch(cfg.url, { method: 'POST', body: formData, headers });
  if (!res.ok) {
    return { success: false, errorCode: `HTTP_${res.status}`, errorMessage: await res.text().catch(() => 'Webhook returnerade felkod') };
  }
  return { success: true };
}

function sanitize(s: string): string {
  return s.replace(/[^\w\-åäöÅÄÖ]+/g, '_').slice(0, 60);
}
