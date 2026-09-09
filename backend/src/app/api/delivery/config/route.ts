/**
 * /api/delivery/config
 *
 * GET — hämta nuvarande leveranskonfiguration för kund (utan att avslöja API-nycklar)
 * PUT — uppdatera leveranskonfiguration
 *
 * Endast OWNER eller ADMIN får ändra detta.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';
import { encryptJson } from '@/lib/crypto';
import { testConnection as testCatalystOne } from '@/lib/catalystone';

const EmailConfigSchema = z.object({
  method: z.literal('EMAIL'),
  emailRecipient: z.string().email(),
});

const CatalystOneConfigSchema = z.object({
  method: z.literal('CATALYSTONE'),
  baseUrl: z.string().url().default('https://api.catalystone.com/v1'),
  tenantId: z.string().min(1),
  apiKey: z.string().min(1),
  employeeIdField: z.enum(['employeeNumber', 'externalId', 'email']).default('employeeNumber'),
});

const WebhookConfigSchema = z.object({
  method: z.literal('WEBHOOK'),
  url: z.string().url(),
  secret: z.string().optional(),
});

const ConfigSchema = z.discriminatedUnion('method', [
  EmailConfigSchema,
  CatalystOneConfigSchema,
  WebhookConfigSchema,
]);

export async function GET(req: NextRequest) {
  let session;
  try { session = await requireSession(); }
  catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode });
    throw e;
  }

  const config = await db.deliveryConfig.findUnique({
    where: { customerId: session.customerId },
    select: {
      method: true,
      emailRecipient: true,
      isActive: true,
      lastTestedAt: true,
      lastTestResult: true,
    },
  });

  // Returnera ALDRIG ut krypterade configurationsdetaljer
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  let session;
  try { session = await requireSession(); }
  catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode });
    throw e;
  }

  if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: z.infer<typeof ConfigSchema>;
  try {
    body = ConfigSchema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid input', details: e.errors }, { status: 400 });
  }

  // För CatalystOne — testa anslutningen innan vi sparar
  let testResult = 'not_tested';
  if (body.method === 'CATALYSTONE') {
    const test = await testCatalystOne({
      baseUrl: body.baseUrl,
      tenantId: body.tenantId,
      apiKey: body.apiKey,
      employeeIdField: body.employeeIdField,
    });
    if (!test.success) {
      return NextResponse.json(
        { error: 'CatalystOne-anslutning misslyckades', details: test.errorMessage },
        { status: 400 }
      );
    }
    testResult = 'success';
  }

  const { method, ...rest } = body;
  const emailRecipient = body.method === 'EMAIL' ? body.emailRecipient : null;

  const updated = await db.deliveryConfig.upsert({
    where: { customerId: session.customerId },
    create: {
      customerId: session.customerId,
      method,
      emailRecipient,
      configEncrypted: encryptJson(rest),
      lastTestedAt: new Date(),
      lastTestResult: testResult,
    },
    update: {
      method,
      emailRecipient,
      configEncrypted: encryptJson(rest),
      isActive: true,
      lastTestedAt: new Date(),
      lastTestResult: testResult,
    },
  });

  await db.auditLog.create({
    data: {
      customerId: session.customerId,
      userId: session.userId,
      action: 'delivery.config_updated',
      metadata: { method },
    },
  });

  return NextResponse.json({
    config: {
      method: updated.method,
      isActive: updated.isActive,
      lastTestedAt: updated.lastTestedAt,
      lastTestResult: updated.lastTestResult,
    },
  });
}
