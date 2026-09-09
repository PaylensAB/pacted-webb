# CLAUDE.md — pact:ed

> Syntetiserad projektkontext från sessionen 7–17 maj 2026. Ersätter ev. tidigare
> auto-memory. Kopiera den här filen till projektrot (`pacted-backend/`) så läses
> den av Claude Code oavsett vilket minnessystem som är aktivt.

## Projektet i en mening

**pact:ed** är en svensk SaaS för enkla digitala signaturer — anställda scannar
en QR-kod på arbetsplatsen och signerar direkt på telefonen utan app, utan
BankID, utan konto. Designad för kvittenser och policybekräftelser, inte avtal.

## Branding

- **Visuellt namn:** `pact:ed` (med kolon)
- **Legalentitet:** Pacted AB
- **Domän:** `pacted.se`
- **E-postdomän:** `@pacted.se` (hej@, security@, billing@, dpo@)
- **Logo:** liten "p" i teal box (`bg-teal-600`)
- **Typografi:** Fraunces (rubriker) + Inter (text)
- **Accentfärg:** teal-600 (`#0d9488`)

Tidigare namnförslag som avvisats: Signa (tagen), Sajnat (tagen), Sajna (tagen),
Inkd (avvisad till förmån för pact:ed), pac:t (Pact.se var tagen, så blev
pact:ed istället eftersom det går att kombinera med grundarens initialer ED).

## Strategiska beslut

### Arkitektur: Transient relay

**Kritisk princip — får aldrig kompromissas.** pact:ed sparar inga signerade
dokument långsiktigt. Maximal lagringstid 48 timmar, automatisk radering via
cron. Endast anonym metadata (dokument-id, kund-id, tidsstämpel) behålls för
fakturering. Hela värdesläget bygger på detta — det är säljpunkt, GDPR-fördel
och konkurrensdifferentiering på samma gång.

### Prismodell

**Årspris med volymtiers, inte månadspris med användarantal.**

**B2B (företag):**

| Plan | Pris/år | Kvot/år |
|---|---|---|
| Gratis | 0 kr | 10 signaturer |
| Liten | 299 kr | 500 signaturer |
| Mellan | 699 kr | 2 000 signaturer |
| Stor | 999 kr | 5 000 signaturer |
| Enterprise | Kontakta | 5 000+ |

**B2C (privatpersoner):**

| Plan | Pris/år | Kvot |
|---|---|---|
| Gratis | 0 kr | 5 kvitton per webbläsare |
| Privat | 29 kr/år | Obegränsat |

### Soft tier-överskridning

Vi blockerar **aldrig** signaturer mitt i en utlämning. Vid 80 % notisera, vid
100 % notisera + banner, vid 120 % efter 30 dagar auto-uppgradera till nästa
tier. Det är en del av positioneringen.

### Support: ingen SLA

E-post-only till `hej@pacted.se`. Svar inom 1–3 arbetsdagar. Säkerhetsincidenter
inom 24 h (DPA-åtagande). Ingen garanterad svarstid för annat. Behöver kund SLA
rekommenderar vi DocuSign/Scrive.

### Affärsstrategi

**Volym före marginal.** Mål 2 000–3 000 kunder vid 24 månader → 1M ARR.
Två utfallsvägar:
1. Lifestyle business (1M ARR ≈ 7-siffrig vinst som tas ut som lön + utdelning)
2. Förvärv av Bokio/Visma/Hogia/Fortnox-liknande aktör (3–8x ARR-multipel
   plus premie för kvalitet på kundbas)

Båda vägarna kräver samma operativa modell: lågt pris, hög volym, ultralågt
support­behov.

## Teknik

### Stack

| Lager | Val | Varför |
|---|---|---|
| Framework | Next.js 15 (App Router) | Frontend + API i samma kodbas |
| Språk | TypeScript | Säkerhet via typer |
| Databas | PostgreSQL (Supabase) | Billig, pålitlig, RLS-stöd |
| ORM | Prisma | Typsäkra queries, bra DX |
| Validering | Zod | Runtime-typsäkerhet |
| Auth | Magic link (egen impl) + iron-session | Inga lösenord = mindre attackyta |
| Betalningar | Stripe Subscriptions + Stripe Checkout | De facto standard |
| E-post | Resend | EU-region, modernt API |
| PDF | pdf-lib (server-side) | Samma bibliotek som frontend |
| Hosting | Vercel | Optimerat för Next.js, EU-regioner |
| Filer | S3-kompatibel (Supabase Storage) | Tillfälliga PDF:er innan leverans |

### Filstruktur

```
projekt/
├── backend/                    ← komplett Next.js + Prisma-projekt
│   ├── prisma/schema.prisma   ← 10 modeller, 7 enums
│   ├── src/
│   │   ├── lib/               ← db, auth, stripe, email, pdf, storage, crypto, catalystone, delivery, usage
│   │   └── app/api/           ← auth, documents, signatures, stripe (checkout+webhook), delivery, cron
│   └── deployment.md
├── juridik/                    ← TOS B2B/B2C, integritetspolicy, DPA, cookies, säkerhet, GDPR-checklista, support-policy, CatalystOne-bilaga
├── landing.html                ← marknadsföringssida
├── signup.html                 ← signup-flöde (steg 1-5)
├── account.html                ← prenumerationsförvaltning
├── index.html                  ← admin-dashboard (prototyp)
├── sign.html                   ← signeringssida (mobil)
├── kvitto.html                 ← B2C-flöde med paywall efter 5 kvitton
├── affarsmodell.md
├── kundguide-onboarding.md
├── namnanalys.md
├── HANDOVER.md
├── rekrytera-utvecklare.md
└── STATUS.md                   ← läs först för aktuell status
```

### Stripe-produkter att skapa

| Produkt | Pris | Trial |
|---|---|---|
| pact:ed Privat | 29 kr/år | Ingen (5 gratis kvitton istället) |
| pact:ed Liten | 299 kr/år | 14 dagar |
| pact:ed Mellan | 699 kr/år | 14 dagar |
| pact:ed Stor | 999 kr/år | 14 dagar |

Gratis B2B-tier (10 sign/år) hanteras helt internt, ingen Stripe-produkt.

## Designprinciper för koden

1. **Transient relay är heligt.** Lägg aldrig till långtidslagring av PDF:er.
2. **Multi-tenancy via row-level filtering.** Alla queries filtrerar på `customerId` från sessionen.
3. **Idempotenta webhooks.** Stripe-events kollas mot event-ID innan tillämpning.
4. **Inga PII i loggar.** Logga IDs och status, inte namn eller anställningsnummer.
5. **Defense in depth.** Zod-validering + DB-constraints + ev. Postgres RLS.
6. **Hemligheter via vault, aldrig i kod.** ENCRYPTION_KEY krypterar CatalystOne API-nycklar i databasen.

## Backend-status

- ✅ Komplett databasschema (Prisma + raw SQL)
- ✅ Multi-tenant struktur med customerId på alla rader
- ✅ Magic link-autentisering
- ✅ Documents CRUD
- ✅ Signature-flöde (transient relay, automatisk radering)
- ✅ Stripe Subscriptions med webhook (idempotent)
- ✅ CatalystOne-adapter (lookupEmployee + uploadSignedDocument)
- ✅ Soft tier-överskridning (`src/lib/usage.ts`)
- ✅ Cron purge-expired (varje timme, raderar PII + räknar usage)
- ⏳ Inte körd `npm install` (sandlåda saknar npm-åtkomst)
- ⏳ Inte deployad — kräver utvecklare + Stripe-konto + BankID

## Juridik-status

Sju utkast i `juridik/` för affärsjurist (granskning räknas 8–15 000 kr):

1. `anvandarvillkor.md` — B2B TOS (årsfakturering, 12-månadersavtal, ingen SLA)
2. `anvandarvillkor-privat.md` — B2C TOS (freemium-modell med premium 29 kr/år)
3. `integritetspolicy.md` — GDPR (inkl. B2C premium-aktivering)
4. `personuppgiftsbitradesavtal.md` — DPA för B2B-kunder
5. `cookiepolicy.md`
6. `sakerhetsbeskrivning.md` — säljmaterial för IT-chefer
7. `supportpolicy.md` — ingen SLA, e-post-only (ersatte tidigare sla.md)
8. `GDPR-checklista.md` — intern arbetslista
9. `catalystone-integration-bilaga.md` — teknisk integrations­överenskommelse

## Saker att INTE göra

- **Inte lägga till BankID** — vi gör SES, BankID är överdrivet för vårt scope
- **Inte lägga till långtidslagring av signerade dokument** — bryter hela vår positionering
- **Inte erbjuda SLA eller telefonsupport** — bryter prismodellen
- **Inte ändra brandingen** (pact:ed visuellt, Pacted AB legal, pacted.se domän)
- **Inte använda DocuSigns API eller liknande** — vi konkurrerar med dem

## Externa konton som behöver sättas upp

| Tjänst | Vem | Krav |
|---|---|---|
| Stripe | Grundare | BankID, bankgiro, F-skatt, moms |
| Domän pacted.se | Grundare | Kreditkort |
| PRV (varumärke) | Grundare | Personnummer + 2 400 kr/klass |
| Supabase | Utvecklare/grundare | E-post räcker |
| Vercel | Utvecklare/grundare | E-post + GitHub |
| Resend | Utvecklare/grundare | E-post + DNS-konfig |

## Användare

- **Grundare:** Leffe Dimitriou (`leffe.dimitriou@gmail.com`)
- **Bolagsform:** Aktiebolag (Pacted AB, redan registrerat)
- **Initialer "ED" i pact:ed:** del av varumärkets stylization

## Vanliga frågor som dyker upp

**Varför så billigt?** Volym före marginal. 2 000–3 000 kunder är mer värdefullt
än 200 högbetalande, både för lifestyle-utfall och för förvärv.

**Varför ingen support?** Stödet hålls medvetet enkelt eftersom modellen
kräver låg support­belastning för att fungera. Det är en feature, inte en bugg.

**Varför CatalystOne specifikt?** Första kunden förväntas ha CatalystOne;
första integrationen byggs mot det. Visma/Hogia/Fortnox kommer senare via
e-postleverans eller utbyggd integration.

**Varför inte BankID?** Vårt scope är enkla kvittenser där bevisvärdet är
"har personen sett dokumentet?" — SES räcker. BankID är för kontrakt som ska
hålla i rätten.

## Kontakt och nästa steg

Nästa konkreta steg är att hitta en utvecklare (se `rekrytera-utvecklare.md`)
som tar `backend/`-mappen till lanserad tjänst. Räkna 4–6 veckor och 100–200
000 kr.

Parallellt: skicka juridiska utkasten till affärsjurist, säkra domänen och
varumärket, börja säljkonversationer med första 2–3 potentiella pilotkunder.
