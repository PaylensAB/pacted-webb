/**
 * CatalystOne HR-system-integration
 *
 * CatalystOne erbjuder en REST API där dokument kan laddas upp till en
 * specifik anställds dokumentarkiv. Vi använder denna för att leverera
 * signerade PDF:er direkt utan att gå via mejl.
 *
 * Förutsättning: kunden har skapat en API-användare i sin CatalystOne-instans
 * och delar API-nyckel + tenantId med oss. Dessa lagras krypterat i
 * DeliveryConfig.configEncrypted.
 *
 * KÄLLDOKUMENTATION: https://docs.catalystone.com/api (placeholder URL)
 *
 * Notera: Denna kod är skriven mot CatalystOnes generella mönster.
 * Exakta endpoint-paths och fältnamn kan behöva justeras när du fått
 * tillgång till deras developer documentation. Hör med din kundkontakt.
 */

import { z } from 'zod';

const CatalystOneConfigSchema = z.object({
  baseUrl: z.string().url().default('https://api.catalystone.com/v1'),
  tenantId: z.string().min(1),
  apiKey: z.string().min(1),
  // Hur en anställds ID i CatalystOne mappas till anställningsnummer
  // i Pacted (oftast direkt 1:1)
  employeeIdField: z.enum(['employeeNumber', 'externalId', 'email']).default('employeeNumber'),
});

export type CatalystOneConfig = z.infer<typeof CatalystOneConfigSchema>;

export interface DeliveryResult {
  success: boolean;
  externalId?: string;     // ID från CatalystOne för det uppladdade dokumentet
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Ladda upp en signerad PDF till en anställds dokumentarkiv i CatalystOne.
 */
export async function uploadSignedDocument(opts: {
  config: CatalystOneConfig;
  signerIdentifier: string;   // Det som matchar mot CatalystOnes employee record
  documentTitle: string;
  documentType: string;       // T.ex. "Utlämning av utrustning"
  pdfBytes: Buffer;
  signedAt: Date;
}): Promise<DeliveryResult> {
  const cfg = CatalystOneConfigSchema.parse(opts.config);

  try {
    // Steg 1: Hitta employee record-id i CatalystOne
    const employeeId = await lookupEmployee(cfg, opts.signerIdentifier);
    if (!employeeId) {
      return {
        success: false,
        errorCode: 'EMPLOYEE_NOT_FOUND',
        errorMessage: `Kunde inte hitta anställd med ${cfg.employeeIdField}=${opts.signerIdentifier} i CatalystOne`,
      };
    }

    // Steg 2: Ladda upp dokumentet
    const uploadUrl = `${cfg.baseUrl}/employees/${employeeId}/documents`;
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([opts.pdfBytes], { type: 'application/pdf' }),
      sanitizeFilename(opts.documentTitle) + '.pdf'
    );
    formData.append('title', opts.documentTitle);
    formData.append('category', mapDocumentCategory(opts.documentType));
    formData.append('signedAt', opts.signedAt.toISOString());
    formData.append('source', 'pacted');

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'X-Tenant-Id': cfg.tenantId,
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        success: false,
        errorCode: `HTTP_${res.status}`,
        errorMessage: `CatalystOne returnerade ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    const result = await res.json() as { id: string };
    return { success: true, externalId: result.id };
  } catch (err: any) {
    return {
      success: false,
      errorCode: 'NETWORK_ERROR',
      errorMessage: err.message ?? 'Okänt nätverksfel mot CatalystOne',
    };
  }
}

/**
 * Testa anslutningen mot CatalystOne med givna credentials.
 * Används när kund konfigurerar integrationen.
 */
export async function testConnection(config: CatalystOneConfig): Promise<DeliveryResult> {
  const cfg = CatalystOneConfigSchema.parse(config);
  try {
    const res = await fetch(`${cfg.baseUrl}/whoami`, {
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'X-Tenant-Id': cfg.tenantId,
      },
    });
    if (!res.ok) {
      return { success: false, errorCode: `HTTP_${res.status}`, errorMessage: 'Authentisering misslyckades' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, errorCode: 'NETWORK_ERROR', errorMessage: err.message };
  }
}

// ============== Privata helpers ==============

async function lookupEmployee(cfg: CatalystOneConfig, identifier: string): Promise<string | null> {
  const searchUrl = `${cfg.baseUrl}/employees?${cfg.employeeIdField}=${encodeURIComponent(identifier)}`;
  const res = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      'X-Tenant-Id': cfg.tenantId,
    },
  });
  if (!res.ok) return null;
  const data = await res.json() as { employees?: Array<{ id: string }> };
  return data.employees?.[0]?.id ?? null;
}

/**
 * Mappa vår dokumenttyp till CatalystOnes kategori-system.
 * Detta är preliminärt; justeras när vi har tillgång till kundens
 * faktiska kategoriträd.
 */
function mapDocumentCategory(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('utrustning') || lower.includes('utlämning')) return 'EQUIPMENT_RECEIPT';
  if (lower.includes('policy')) return 'POLICY_ACKNOWLEDGMENT';
  if (lower.includes('handbok') || lower.includes('avtal')) return 'HR_DOCUMENT';
  if (lower.includes('kontroll') || lower.includes('körkort')) return 'COMPLIANCE_CHECK';
  return 'OTHER';
}

function sanitizeFilename(s: string): string {
  return s.replace(/[^\w\-åäöÅÄÖ]+/g, '_').slice(0, 60);
}
