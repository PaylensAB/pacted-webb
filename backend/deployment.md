# Deployment-guide — pact:ed backend

Komplett steg-för-steg från noll till produktion. Räkna 2–4 timmar för
första gångens uppsättning.

## Förutsättningar

- Node.js 20+ installerat
- Git installerat
- Konton skapade (gratis tier räcker i början) hos:
  - **Vercel** ([vercel.com](https://vercel.com)) — hosting
  - **Supabase** ([supabase.com](https://supabase.com)) — Postgres + storage
  - **Stripe** ([stripe.com](https://stripe.com)) — betalningar
  - **Resend** ([resend.com](https://resend.com)) — e-post

## 1. Lokal utvecklingsmiljö (15 min)

```bash
# Klona projektet
git clone <din-repo-url> pacted-backend
cd pacted-backend

# Installera beroenden
npm install

# Skapa lokal .env-fil
cp .env.example .env
```

Fyll i `.env` med utvecklingsvärden (testnycklar, lokal databas). Se nästa
sektioner för var nycklarna kommer ifrån.

## 2. Databas — Supabase (20 min)

1. Skapa nytt projekt på [supabase.com/dashboard](https://supabase.com/dashboard)
   - Region: **Frankfurt (eu-central-1)** eller **Stockholm (eu-north-1)**
   - Plan: Free tier räcker för utveckling och första kunder
2. När projektet är klart, gå till **Settings → Database** och kopiera:
   - Connection string (pooled, port 6543) → `DATABASE_URL` i `.env`
   - Direct connection (port 5432) → `DIRECT_URL` i `.env`
3. Kör migrationer:

```bash
npx prisma migrate deploy
```

Detta skapar alla tabeller. Verifiera med:

```bash
npx prisma studio
```

Öppnar en webbgränssnitt på localhost:5555 där du kan inspektera databasen.

### Storage (för tillfälliga PDF:er)

I Supabase: **Storage → Create bucket**
- Namn: `pacted-transient`
- Public: **NEJ** (åtkomst endast via signerade URLs)
- File size limit: 5 MB räcker

Kopiera Storage credentials till `.env`:
- S3 endpoint: `https://<projekt>.supabase.co/storage/v1/s3`
- Access key: från **Settings → API → S3 API**

## 3. Stripe (30 min)

### Skapa konto och produkter

1. Skapa konto på [stripe.com/se](https://stripe.com/se)
2. Aktivera **Test mode** (toggle uppe till höger i Dashboard)
3. Gå till **Products → Add product** och skapa tre:

| Namn | Pris | Period | Beskrivning |
|---|---|---|---|
| pact:ed Liten | 299 kr | Återkommande **årligen** | Upp till 500 signaturer/år |
| pact:ed Mellan | 699 kr | Återkommande årligen | Upp till 2 000 signaturer/år |
| pact:ed Stor | 999 kr | Återkommande årligen | Upp till 5 000 signaturer/år |

(Gratis-tier behöver inte skapas i Stripe — den hanteras helt internt med 10 signaturer/år som tak.)

För varje produkt, kopiera **price_id** (`price_1Nx...`) till `.env`:
- `STRIPE_PRICE_ID_SMALL=price_xxx`
- `STRIPE_PRICE_ID_MEDIUM=price_xxx`
- `STRIPE_PRICE_ID_LARGE=price_xxx`

### Sätt upp Webhook

1. **Developers → Webhooks → Add endpoint**
2. URL: `https://din-app.vercel.app/api/stripe/webhook` (eller localhost för test)
3. Events att lyssna på:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.paid`
4. Kopiera **Signing secret** → `STRIPE_WEBHOOK_SECRET` i `.env`

### API-nycklar

**Developers → API keys** — kopiera Secret key (testmiljö först) → `STRIPE_SECRET_KEY`

### Lokala webhook-tester

För att testa webhooks mot din localhost:

```bash
# Installera Stripe CLI
brew install stripe/stripe-cli/stripe   # mac
# eller ladda ner från stripe.com/docs/stripe-cli

stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Stripe-CLI ger dig ett tillfälligt `whsec_xxx` att använda i `STRIPE_WEBHOOK_SECRET` under utveckling.

## 4. Resend (10 min)

1. Skapa konto på [resend.com](https://resend.com)
2. Verifiera din domän (pacted.se) — kräver att du lägger till DNS-poster
   hos din domänregistrar (Loopia/one.com)
3. **API Keys → Create API key** → `RESEND_API_KEY`
4. Skicka ett test-mejl för att verifiera att leverans funkar

## 5. Säkerhetsnycklar (5 min)

Generera slumpmässiga säkerhetsnycklar:

```bash
# SESSION_SECRET (för iron-session)
openssl rand -base64 32

# ENCRYPTION_KEY (för krypterade kundkonfigurationer)
openssl rand -base64 32

# CRON_SECRET (för Vercel Cron-jobs)
openssl rand -hex 32
```

Lägg in alla tre i `.env`.

## 6. Lokal smoke test (10 min)

```bash
npm run dev
```

Öppna http://localhost:3000 och testa:

1. Gå till `/signup` och skapa ett testkonto (använd Stripe testkort: `4242 4242 4242 4242`, valfritt datum + cvv)
2. Verifiera att webhook tas emot (kolla `stripe listen` terminalfönstret)
3. Verifiera att Customer + User + Subscription skapats i databasen (Prisma Studio)
4. Logga in via magic link (kolla Resend dashboard för testmejlet)
5. Skapa ett dokument och en QR-kod
6. Öppna `/sign?token=...` och signera
7. Verifiera att signaturen levereras till din konfigurerade kanal (e-post default)
8. Vänta 1 minut och verifiera att PendingSignature raderats automatiskt
9. Verifiera att SignatureEvent finns kvar (anonym metadata)

Om alla steg funkar → redo för produktion.

## 7. Deploy till Vercel (15 min)

```bash
# Installera Vercel CLI (engångsåtgärd)
npm i -g vercel

# Logga in
vercel login

# Deploya
vercel
```

Första gången frågar Vercel om projektnamn, mapp m.m. Svara default på allt utom:
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

När projektet finns på Vercel:

1. Gå till **Settings → Environment Variables**
2. Lägg in ALLA värden från din `.env` (produktion — använd LIVE Stripe keys, riktig domain m.m.)
3. **Settings → Domains** → koppla `pacted.se` (Vercel ger DNS-instruktioner)
4. **Deploy → Redeploy** så miljövariabler tillämpas

### Aktivera Vercel Cron

Cron-konfigurationen ligger i `vercel.json`. Vid första deploy aktiveras
`/api/cron/purge-expired` att köras varje timme. Verifiera under
**Settings → Cron Jobs** att den körs.

## 8. Produktionssäkring (30 min)

- Byt Stripe från **Test mode** till **Live mode**. Återgenerera alla nycklar.
- Lägg in **CRON_SECRET** i Vercel Environment (Vercel skickar Bearer-header)
- Aktivera **Sentry** (eller annan errortracking) för felmeddelanden i prod
- Lägg upp en `robots.txt` som tillåter alla, plus `sitemap.xml` för SEO
- Konfigurera DNS för `pacted.se` att peka mot Vercel (Vercel ger A/CNAME poster)
- Verifiera HTTPS funkar (Vercel sätter upp Let's Encrypt automatiskt)
- Sätt upp uptime-monitoring (UptimeRobot eller liknande, gratis)

## 9. Backups och återställning

Supabase tar dagliga backups på Pro-plan (uppgradera när du har första betalande kund). På free tier rekommenderas att du själv exporterar dumps en gång i veckan:

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

Testa återställning regelbundet på en separat databas så du vet att backuperna funkar.

## 10. Övervaka

| Vad | Var |
|---|---|
| App-fel (5xx) | Vercel Logs eller Sentry |
| Stripe-events | Stripe Dashboard → Events |
| E-postleverans | Resend Dashboard |
| Databasen | Supabase Dashboard → Logs |
| Uppetid | UptimeRobot eller liknande |
| Säkerhet | Loggar i AuditLog-tabellen |

## Vanliga fel under uppsättning

**Prisma migrate hänger sig.** Använd `DIRECT_URL` (port 5432, inte poolad 6543) för migrationer. För queries använder du den poolade.

**Stripe webhook returnerar 400.** Säkerställ att `STRIPE_WEBHOOK_SECRET` matchar den endpoint du faktiskt använder (test eller live, lokal eller prod).

**Magic link landar i spam.** Lägg till SPF + DKIM + DMARC i din DNS hos Loopia. Resend visar exakta DNS-poster.

**S3-uppladdning får 403.** Kontrollera att bucket-namnet matchar `S3_BUCKET` och att Access key har skrivrättighet.

**"Failed to fetch Stripe"-fel i webhook.** Stripe blockerar utgående requests från Vercel Edge runtime. Säkerställ att webhook-route har `export const runtime = 'nodejs'`.

## Nästa steg efter lyckad deploy

- Skapa första testkund (din arbetsgivare eller någon i ditt nätverk)
- Bjud in en CatalystOne-kontakt för integrationstest
- Sätt upp en statussida (status.pacted.se via [betterstack.com](https://betterstack.com))
- Förbered handlingsplan för incidentanmälan till IMY (max 72h vid breach)
