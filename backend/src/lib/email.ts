/**
 * E-postleverans via Resend
 *
 * Använder Resend's EU-region. Två huvudfall:
 * 1. Transaktionella mejl till administratörer (magic link, fakturapåminnelse m.m.)
 * 2. Leverans av signerade PDF:er till kundens HR-system via mejl
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = process.env.RESEND_FROM ?? 'pact:ed <hej@pacted.se>';

// ============== Magic link ==============

export async function sendMagicLink(opts: {
  to: string;
  name: string;
  url: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Din inloggningslänk till pact:ed',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0f172a;">Hej ${escapeHtml(opts.name)}!</h2>
        <p>Klicka på länken nedan för att logga in på pact:ed.</p>
        <p style="margin: 24px 0;">
          <a href="${opts.url}" style="background: #0d9488; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Logga in
          </a>
        </p>
        <p style="color: #64748b; font-size: 14px;">
          Länken är giltig i 15 minuter och kan bara användas en gång.
          Om du inte begärt denna länk kan du ignorera mejlet.
        </p>
      </div>
    `,
  });
}

// ============== Signerat dokument till HR-system via mejl ==============

export async function deliverSignedDocument(opts: {
  to: string;
  documentTitle: string;
  signerName: string;
  signedAt: Date;
  pdfBytes: Buffer;
  filename: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Signerat dokument: ${opts.documentTitle}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0f172a;">Signerat dokument</h2>
        <p>Ett dokument har signerats och bifogas detta mejl.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #64748b;">Dokument:</td><td><strong>${escapeHtml(opts.documentTitle)}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Signerat av:</td><td>${escapeHtml(opts.signerName)}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Tidpunkt:</td><td>${opts.signedAt.toLocaleString('sv-SE')}</td></tr>
        </table>
        <p style="color: #64748b; font-size: 14px;">
          Detta mejl är genererat automatiskt av pact:ed. Den signerade PDF:en
          innehåller en fullständig audit trail.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: opts.filename,
        content: opts.pdfBytes,
      },
    ],
  });
}

// ============== Påminnelse vid utebliven betalning ==============

export async function sendPaymentFailedReminder(opts: {
  to: string;
  name: string;
  amount: number;
  dueDate: Date;
  updateUrl: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Betalningen kunde inte genomföras — pact:ed',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0f172a;">Hej ${escapeHtml(opts.name)},</h2>
        <p>Vi kunde inte dra månadsavgiften på ${opts.amount} kr från ditt kort.</p>
        <p>Uppdatera betalmetod senast ${opts.dueDate.toLocaleDateString('sv-SE')} för att fortsätta använda pact:ed utan avbrott.</p>
        <p style="margin: 24px 0;">
          <a href="${opts.updateUrl}" style="background: #0d9488; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Uppdatera betalmetod
          </a>
        </p>
      </div>
    `,
  });
}

// ============== Helpers ==============

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}
