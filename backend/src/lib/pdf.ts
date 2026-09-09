/**
 * Server-side PDF-generering med pdf-lib
 *
 * Använder samma layoutkod som frontend-prototypen för konsistens.
 * Producerar en A4 PDF med:
 * - Brandbar (pact:ed med teal-färg)
 * - Dokumenttitel + beskrivning
 * - Signerardata (namn, anställningsnummer)
 * - Signaturbild
 * - Audit trail (timestamps, dokument-id, signature-id, bevistyp)
 */

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';

export interface PdfInput {
  document: {
    id: string;
    title: string;
    type: string;
    description?: string | null;
    createdAt: Date;
    customerName?: string;
  };
  signature: {
    id: string;
    name: string;
    empno: string;
    signedAt: Date;
    signaturePngBytes: Uint8Array;
    userAgent?: string;
  };
  branding?: {
    logoPngBytes?: Uint8Array;
    primaryColor?: { r: number; g: number; b: number };
  };
}

export async function generateSignedPdf(input: PdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const teal = input.branding?.primaryColor
    ? rgb(input.branding.primaryColor.r, input.branding.primaryColor.g, input.branding.primaryColor.b)
    : rgb(0.06, 0.46, 0.42);
  const slate900 = rgb(0.05, 0.09, 0.16);
  const slate600 = rgb(0.30, 0.36, 0.44);
  const slate300 = rgb(0.80, 0.83, 0.88);

  // Brandbar (eller egen logotyp om uppladdad)
  page.drawRectangle({ x: 0, y: 820, width: 595.28, height: 22, color: teal });
  page.drawText('pact:ed  ·  Signerad kvittens', {
    x: margin, y: 826, size: 11, font: bold, color: rgb(1, 1, 1),
  });

  let y = 790;

  // Doc type
  page.drawText((input.document.type || 'DOKUMENT').toUpperCase(), {
    x: margin, y, size: 9, font: bold, color: teal,
  });

  // Title
  y -= 22;
  const titleLines = wrapText(input.document.title, 495, bold, 20);
  for (const line of titleLines) {
    page.drawText(line, { x: margin, y, size: 20, font: bold, color: slate900 });
    y -= 24;
  }

  // Description
  if (input.document.description) {
    y -= 6;
    const descLines = wrapText(input.document.description, 495, font, 11);
    for (const line of descLines) {
      page.drawText(line, { x: margin, y, size: 11, font, color: slate600 });
      y -= 15;
    }
  }

  // Divider
  y -= 14;
  page.drawLine({ start: { x: margin, y }, end: { x: 545, y }, thickness: 0.5, color: slate300 });
  y -= 22;

  // Signature heading
  page.drawText('Signatur', { x: margin, y, size: 11, font: bold, color: slate900 });
  y -= 18;

  // Signer details
  const details: [string, string][] = [
    ['Namn', input.signature.name],
    ['Anställningsnummer', input.signature.empno],
    ['Signerad', input.signature.signedAt.toLocaleString('sv-SE')],
    ['Signatur-id', input.signature.id],
  ];
  for (const [k, v] of details) {
    page.drawText(k, { x: margin, y, size: 9, font, color: slate600 });
    page.drawText(v, { x: margin + 130, y, size: 10, font: bold, color: slate900 });
    y -= 16;
  }

  // Signature image
  y -= 10;
  page.drawText('Ritad signatur', { x: margin, y, size: 9, font, color: slate600 });
  y -= 6;

  const sigImage = await pdf.embedPng(input.signature.signaturePngBytes);
  const sigW = 240;
  const sigH = (sigImage.height / sigImage.width) * sigW;
  const sigBoxH = Math.max(sigH, 80);
  const sigBoxY = y - sigBoxH;
  page.drawRectangle({
    x: margin, y: sigBoxY, width: sigW + 10, height: sigBoxH + 6,
    borderColor: slate300, borderWidth: 0.5,
  });
  page.drawImage(sigImage, {
    x: margin + 5,
    y: sigBoxY + (sigBoxH - sigH) / 2,
    width: sigW, height: sigH,
  });
  y = sigBoxY - 18;

  // Audit trail
  page.drawLine({ start: { x: margin, y }, end: { x: 545, y }, thickness: 0.5, color: slate300 });
  y -= 16;
  page.drawText('Spårbarhet (audit trail)', { x: margin, y, size: 11, font: bold, color: slate900 });
  y -= 16;

  const audit: [string, string][] = [
    ['Dokument-id', input.document.id],
    ['Skapat', input.document.createdAt.toLocaleString('sv-SE')],
    ['Arbetsgivare', input.document.customerName ?? 'Ej angivet'],
    ['Enhet (user agent)', input.signature.userAgent ?? 'Ej registrerad'],
    ['Bevistyp', 'Enkel elektronisk signatur (SES) enligt eIDAS art. 3(10)'],
  ];
  for (const [k, v] of audit) {
    page.drawText(k, { x: margin, y, size: 9, font, color: slate600 });
    const lines = wrapText(v, 365, font, 9);
    for (let i = 0; i < lines.length; i++) {
      page.drawText(lines[i], { x: margin + 130, y: y - i * 12, size: 9, font, color: slate900 });
    }
    y -= Math.max(lines.length * 12, 14);
  }

  // Footer
  page.drawLine({ start: { x: margin, y: 52 }, end: { x: 545, y: 52 }, thickness: 0.5, color: slate300 });
  page.drawText('Genererad av pact:ed  ·  pacted.se  ·  Detta är en signerad kvittens av enklare typ.', {
    x: margin, y: 36, size: 8, font, color: slate600,
  });

  return pdf.save();
}

// ============== Text wrapping helper ==============

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = String(text).split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.flatMap((l) => l.split('\n'));
}
