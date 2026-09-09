/**
 * Användningsräkning och soft tier-överskridning
 *
 * Hela poängen med pact:ed är att vara billig + förlåtande. Vi blockerar
 * aldrig signaturer mitt i en utlämning. Istället:
 *
 * - < 80 % av kvot: tyst
 * - 80–99 %: en e-postnotis (en gång per år)
 * - 100–119 %: notis + banner i admin, fortsatt drift
 * - 120 %+ efter 30 dagar: automatisk uppgradering till nästa tier
 *
 * Räkningen sker per **kalenderår** baserat på SignatureEvent.signedAt.
 */

import { db } from './db';
import { PLAN_LIMITS, PRICE_IDS, type PlanKey } from './stripe';
import { stripe } from './stripe';

export type UsageTier = 'FREE' | PlanKey;

export interface UsageInfo {
  used: number;
  limit: number;
  pct: number;
  tier: UsageTier;
  state: 'normal' | 'approaching' | 'over' | 'critical';
  yearStart: Date;
  yearEnd: Date;
}

/**
 * Räkna antalet signaturer för kund under aktuellt kalenderår.
 */
export async function countSignaturesThisYear(customerId: string): Promise<number> {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

  return db.signatureEvent.count({
    where: {
      customerId,
      signedAt: { gte: yearStart, lt: yearEnd },
    },
  });
}

/**
 * Hämta aktuell tier för kund (FREE om ingen aktiv prenumeration).
 */
export async function getCurrentTier(customerId: string): Promise<UsageTier> {
  const sub = await db.subscription.findUnique({
    where: { customerId },
    select: { plan: true, status: true },
  });
  if (!sub) return 'FREE';
  if (!['ACTIVE', 'TRIALING'].includes(sub.status)) return 'FREE';
  return sub.plan as PlanKey;
}

/**
 * Få komplett användningsbild för en kund.
 */
export async function getUsageInfo(customerId: string): Promise<UsageInfo> {
  const [used, tier] = await Promise.all([
    countSignaturesThisYear(customerId),
    getCurrentTier(customerId),
  ]);

  const limit = PLAN_LIMITS[tier];
  const pct = limit > 0 ? used / limit : 0;
  const now = new Date();

  let state: UsageInfo['state'] = 'normal';
  if (pct >= 1.2) state = 'critical';
  else if (pct >= 1.0) state = 'over';
  else if (pct >= 0.8) state = 'approaching';

  return {
    used,
    limit,
    pct,
    tier,
    state,
    yearStart: new Date(now.getFullYear(), 0, 1),
    yearEnd: new Date(now.getFullYear() + 1, 0, 1),
  };
}

/**
 * Nästa tier för auto-uppgradering.
 */
function nextTier(current: UsageTier): PlanKey | null {
  switch (current) {
    case 'FREE':   return 'SMALL';
    case 'SMALL':  return 'MEDIUM';
    case 'MEDIUM': return 'LARGE';
    case 'LARGE':  return null; // Skicka till Enterprise-konversation
  }
}

/**
 * Aktiverar automatisk uppgradering om kund varit över sin kvot i 30+ dagar.
 * Körs av cron-jobbet varje natt.
 */
export async function autoUpgradeIfWarranted(customerId: string): Promise<{
  upgraded: boolean;
  fromTier: UsageTier;
  toTier?: PlanKey;
  reason?: string;
}> {
  const usage = await getUsageInfo(customerId);
  if (usage.state !== 'critical') {
    return { upgraded: false, fromTier: usage.tier, reason: 'Not in critical state' };
  }

  // Kolla om kund varit över i 30+ dagar
  const firstOverage = await db.auditLog.findFirst({
    where: { customerId, action: 'usage.over_limit' },
    orderBy: { createdAt: 'asc' },
  });
  if (!firstOverage) {
    // Logga första överskridningen och vänta 30 dagar
    await db.auditLog.create({
      data: { customerId, action: 'usage.over_limit', metadata: { usage: usage.used, limit: usage.limit } },
    });
    return { upgraded: false, fromTier: usage.tier, reason: 'First overage logged, waiting 30 days' };
  }

  const daysSinceFirstOverage = (Date.now() - firstOverage.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceFirstOverage < 30) {
    return { upgraded: false, fromTier: usage.tier, reason: `${Math.round(30 - daysSinceFirstOverage)} dagar kvar innan auto-uppgradering` };
  }

  // Genomför uppgraderingen
  const newTier = nextTier(usage.tier);
  if (!newTier) {
    // Stor-kund som överskridit — manuellt Enterprise-samtal krävs
    await db.auditLog.create({
      data: { customerId, action: 'usage.enterprise_needed', metadata: { usage: usage.used } },
    });
    return { upgraded: false, fromTier: usage.tier, reason: 'Behöver Enterprise-avtal' };
  }

  // Hitta kundens Stripe-subscription och uppgradera
  const sub = await db.subscription.findUnique({ where: { customerId } });
  if (sub?.stripeSubscriptionId) {
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      items: [{
        id: stripeSub.items.data[0].id,
        price: PRICE_IDS[newTier],
      }],
      proration_behavior: 'create_prorations',
    });
  }

  await db.subscription.update({
    where: { customerId },
    data: { plan: newTier },
  });

  await db.auditLog.create({
    data: { customerId, action: 'usage.auto_upgraded', metadata: { from: usage.tier, to: newTier } },
  });

  return { upgraded: true, fromTier: usage.tier, toTier: newTier };
}

/**
 * Skicka notis till kunden om de närmar sig eller passerat sin kvot.
 * Notiser skickas max en gång per kvartal för samma trösklar.
 */
export async function notifyOverageIfNeeded(customerId: string): Promise<void> {
  const usage = await getUsageInfo(customerId);
  if (usage.state === 'normal') return;

  const action = `usage.notified_${usage.state}`;

  // Har vi redan notiserat på denna nivå nyligen?
  const recent = await db.auditLog.findFirst({
    where: {
      customerId,
      action,
      createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
  });
  if (recent) return;

  // Hämta admin-mejl
  const owner = await db.user.findFirst({
    where: { customerId, role: 'OWNER' },
    select: { email: true, name: true },
  });
  if (!owner) return;

  // TODO: Implementera mejl-mallar i email.ts: sendUsageApproaching, sendUsageOver, sendUsageCritical
  // För nu: bara logga
  await db.auditLog.create({
    data: {
      customerId,
      action,
      metadata: { used: usage.used, limit: usage.limit, pct: Math.round(usage.pct * 100) },
    },
  });
}
