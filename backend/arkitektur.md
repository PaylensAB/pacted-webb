# Arkitektur — pact:ed backend

## Översikt

Pacted är en SaaS för digital signering med två produkter i samma kod­bas:

1. **B2B-tjänsten** — företag betalar månadsabonnemang för att skapa dokument som anställda signerar via QR-kod. Signerade PDF:er levereras till HR-system och raderas omedelbart hos oss.

2. **B2C-tjänsten** — privatpersoner skapar gratis köpekvitton. PDF genereras helt klient-sida; backenden är inte inblandad.

Backenden hanterar enbart B2B-flödet. B2C-tjänsten är statiska HTML-filer som inte talar med servern.

## Tekniska val och motivering

| Val | Vad | Varför |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Frontend och API i samma kod­bas, deployar direkt till Vercel, server-side rendering |
| **Språk** | TypeScript | Säkerhet via typer, mindre buggar |
| **Databas** | PostgreSQL (Supabase) | Pålitlig, JSON-stöd, row-level security, billig på Supabase |
| **ORM** | Prisma | Typsäkra queries, migrationshantering, bra DX |
| **Validering** | Zod | Runtime-typsäkerhet på API-gränser |
| **Auth** | Magic link (egenutvecklat) via Resend | Inga lösenord = mindre attackyta; vanligt i moderna SaaS |
| **Sessions** | iron-session (krypterade JWT i cookies) | Enkel, säker, ingen extra DB-tabell behövs |
| **Betalningar** | Stripe Subscriptions | De facto-standard; hostad checkout (inga PCI-krav på oss) |
| **E-post** | Resend | Enkel API, bra leveranskvalitet, EU-region tillgänglig |
| **PDF** | pdf-lib (server-side) | Samma bibliotek som frontend; ingen Chrome-headless behövs |
| **Hosting** | Vercel | Optimerat för Next.js, billigt, EU-regioner |
| **Filhantering** | S3-kompatibel storage (Supabase Storage eller R2) | För tillfälliga PDF:er innan leverans |

## Datamodell — den centrala bilden

```
Customer (företaget)
  ├── User[] (administratörer)
  ├── Subscription (Stripe-koppling)
  ├── DeliveryConfig (CatalystOne/email/SFTP)
  └── Document[]
        └── SignatureEvent[] (anonym metadata efter radering)
```

Vid signering uppstår tillfälligt:

```
PendingSignature (radera efter leverans)
  ├── signatureImageUrl (S3 — radera efter PDF-generering)
  └── signedPdfUrl (S3 — radera efter leverans)
```

Allt detta beskrivs detaljerat i `prisma/schema.prisma`.

## Flöden

### 1. Företag skapar konto

```
Användare              Backend                  Stripe              Resend
   │                      │                       │                    │
   │── signup form ──────▶│                       │                    │
   │                      │── create checkout ───▶│                    │
   │                      │◀── checkout URL ──────│                    │
   │◀─── redirect ────────│                       │                    │
   │── kort på Stripe ───────────────────────────▶│                    │
   │                      │◀── webhook event ─────│                    │
   │                      │   (customer.created,                       │
   │                      │   subscription.created)                    │
   │                      │── send magic link ────────────────────────▶│
   │◀─────────────────────│   välkommen-mejl + login-länk              │
```

### 2. Företag skapar dokument + QR-kod

```
Admin webb            Backend
   │                     │
   │── POST /documents ─▶│
   │                     │── validate (Zod)
   │                     │── insert Document (customerId)
   │                     │── generate QR PNG
   │◀── document + qr ───│
```

### 3. Anställd signerar (det viktigaste flödet)

```
Anställd telefon     Backend                 S3                  HR-system
   │                    │                      │                    │
   │── GET /sign?id=X ─▶│                      │                    │
   │                    │── läs Document       │                    │
   │◀── dokument-info ──│                      │                    │
   │── POST /signatures ▶│                      │                    │
   │   (data + bild)    │                      │                    │
   │                    │── store sig image ──▶│                    │
   │                    │◀── url ──────────────│                    │
   │                    │── generate signed PDF                      │
   │                    │── store PDF ────────▶│                    │
   │                    │◀── url ──────────────│                    │
   │                    │── deliver to HR ───────────────────────────▶│
   │                    │◀── ack ─────────────────────────────────────│
   │                    │── delete signature image + PDF + pending row│
   │                    │── insert SignatureEvent (anonym metadata)   │
   │◀── confirmation ───│                                              │
```

Den anställda får också den signerade PDF:en levererad till sin enhet. Notera att backenden raderar all PII *omedelbart* efter att HR-systemet bekräftat mottagandet. Backup-policy är 48h max (vid leveransfel).

### 4. Stripe-webhook (idempotent)

```
Stripe ──▶ POST /api/stripe/webhook
            │── verifyStripeSignature
            │── findOrInsert WebhookEvent (idempotency)
            │── switch (event.type):
            │     customer.subscription.created   → set status active
            │     customer.subscription.updated   → update status
            │     customer.subscription.deleted   → mark canceled
            │     invoice.payment_failed         → email admin, set past_due
            │     invoice.paid                   → store invoice metadata
            └── ack 200
```

## Säkerhetsmodell

**Autentisering.** Magic link via mejl, krypterad session-cookie (iron-session, 12h TTL, refresh on activity). 2FA är på roadmap men inte i V1.

**Auktorisering.** Alla API-routes kontrollerar att `session.user.customerId` matchar resursens `customerId`. Detta är implementerat i en `requireSession()`-helper som alla routes använder.

**Multi-tenancy.** Strikt isolering via `customerId` i varje query. Inga "globala" queries utan tenant-filter. Kompletteras lämpligen med row-level security (RLS) på Postgres-nivån.

**Data-minimering.** PII (namn, anställningsnr, signaturbild) finns bara i `PendingSignature`-tabellen och tillhörande S3-objekt. Båda raderas vid leveransbekräftelse. `SignatureEvent` håller endast anonym metadata för fakturering: `customerId, documentId, signedAt, deliveryStatus`.

**Hemligheter.** Alla API-nycklar (Stripe, Resend, CatalystOne) lagras i Vercel Environment Variables. Aldrig i kod, aldrig i loggar.

**Loggning.** Vi loggar event-typer och resource-IDs, aldrig PII. Loggretention: 30 dagar för applikationsloggar, 12 mån för säkerhetsloggar.

## Skalningsmodell

**Förväntad belastning V1:** 50 kunder × 1000 signaturer/mån = 50 000 signaturer/mån ≈ 70/timme i topp. Detta är trivialt för Next.js + Postgres.

**Flaskhalsar att övervaka när du skalar:**
- PDF-generering är CPU-bunden — bra om signing-endpoint kör på dedicerat funktion
- HR-system-leverans kan vara långsam — gör asynkront via en queue
- Stripe-webhooks kan komma i burst — webhook handlern måste returnera snabbt

**När du behöver skala:** Lägg till en lättviktskö (Upstash Redis eller Vercel Queue) för asynkron leverans. Migrera PDF-generering till en dedicerad Vercel Edge Function eller en separat Node.js-service.

## Beslut som väntar

Saker vi medvetet lämnar för senare:

- **2FA för administratörer** — börja med magic links, lägg till TOTP när första storkunden ber om det
- **SSO (SAML/OIDC) för Stor-plan** — bygg vid första intresse
- **Webhook-mottagare för kunder** — kunder kan vilja få notiser när dokument signeras
- **Internationalisering (i18n)** — Sverige först, engelska som nästa
- **Audit log export** — kunder kan vilja exportera audit data för revision
- **Mobil-app för admin** — onödigt i V1, webbappen är responsiv

## Frågor och svar

**Varför inte använda en BaaS som Clerk eller Auth0?**
Magic links är så enkla att bygga själv att tredjepartsberoende inte är värt det. Plus undviker GDPR-frågor om var användarsessions lagras.

**Varför Prisma och inte Drizzle eller Kysely?**
Prisma har bästa DX och bredaste community. Migrations bara fungerar. Drizzle är vassare men kräver mer manuell typhantering.

**Varför Resend och inte SendGrid?**
Resend har EU-region, modernt API, och är billigare för vår volym. SendGrid är tunga företagsplattformen vi inte behöver.

**Varför inte CDN för signed PDF?**
Vi vill INTE att signed PDF:er ska vara åtkomliga via offentlig URL. De ligger på presigned S3 URLs med 15-minuters TTL, och raderas vid leveransbekräftelse.
