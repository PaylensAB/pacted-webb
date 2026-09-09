# pact:ed backend

Komplett backend-projekt för Pacted AB. Bygger på **Next.js 15** (App Router + API routes), **PostgreSQL** via **Prisma ORM**, **Stripe Subscriptions** för fakturering, **Resend** för e-post och **pdf-lib** för server-side PDF-generering.

> Detta är ett startklart skelett. Filer som finns här innehåller produktionsklar arkitektur, validering och felhantering — du eller en utvecklare kan ta det vidare till en lanserad tjänst på 4–6 veckor.

## Snabböversikt

```
backend/
├── README.md                       ← den här filen
├── arkitektur.md                   ← teknisk översikt
├── deployment.md                   ← Vercel + Supabase steg-för-steg
├── catalystone-integration.md      ← teknisk integration mot CatalystOne
├── package.json                    ← npm-beroenden
├── tsconfig.json                   ← TypeScript-konfig
├── next.config.js                  ← Next-konfig
├── .env.example                    ← miljövariabler
├── .gitignore
├── prisma/
│   └── schema.prisma               ← databasschema (källan till sanningen)
└── src/
    ├── lib/
    │   ├── db.ts                   ← Prisma-klient (singleton)
    │   ├── auth.ts                 ← sessions + magic links
    │   ├── stripe.ts               ← Stripe-klient + helpers
    │   ├── email.ts                ← Resend-wrapper
    │   ├── pdf.ts                  ← server-side PDF
    │   └── catalystone.ts          ← HR-system-adapter
    └── app/
        └── api/
            ├── auth/
            │   ├── request-magic-link/route.ts
            │   └── verify/route.ts
            ├── documents/
            │   ├── route.ts        ← POST skapa, GET lista
            │   └── [id]/route.ts   ← GET, DELETE
            ├── signatures/
            │   └── route.ts        ← POST submit (transient relay)
            ├── stripe/
            │   ├── checkout/route.ts
            │   └── webhook/route.ts
            └── delivery/
                ├── email/route.ts
                └── catalystone/route.ts
```

## Vad är klart

- Komplett databasschema (Prisma + raw SQL alternativ)
- Multi-tenant struktur med `customerId` på alla relevanta rader
- Magic link-autentisering
- Documents CRUD med multi-tenancy
- Signature-flödet (transient relay-arkitektur, automatisk radering)
- Stripe Subscriptions-integration med webhook
- Plug-and-play CatalystOne-adapter
- Generisk e-postleverans via Resend
- Server-side PDF-generering med audit trail

## Vad utvecklaren ska göra för att gå live

1. `npm install` — hämta beroenden
2. Sätt upp Postgres (Supabase rekommenderas — gratis tier räcker länge)
3. Sätt upp Resend-konto och hämta API-nyckel
4. Sätt upp Stripe-konto, skapa tre Products (Liten/Mellan/Stor)
5. Kopiera `.env.example` till `.env` och fyll i nycklar
6. `npx prisma migrate deploy` — kör databasmigrationerna
7. `npm run dev` — starta lokalt
8. Verifiera flöden (signup → signera → leverans → faktura)
9. Deploy till Vercel — se `deployment.md`

## Designprinciper

**Transient relay.** Vi sparar inga signerade dokument långsiktigt. Maximal lagringstid är 48 timmar för PDF, sedan automatisk radering. Endast anonym metadata sparas för fakturering. Detta är hela vår positionering — koden måste återspegla det.

**Multi-tenancy via row-level filtering.** Varje rad i databasen har `customerId`. Alla queries filtrerar på den aktuella användarens customer. Inga delade tabeller utan kundkoppling.

**Defense in depth.** Tre lager: API validering med Zod, databas-constraints, och row-level security på Postgres-nivå (rekommenderas i Supabase).

**Idempotent webhooks.** Stripe-webhooks måste vara idempotenta — vi kollar mot Stripes event-ID innan vi tillämpar ändringar.

**Inga personuppgifter i loggar.** Loggar innehåller endast IDs och status, aldrig namn eller anställningsnummer.

## Kontakt

Vid frågor om backend-koden — kontakta din utvecklare, eller följ pekare i `arkitektur.md` och `deployment.md`.
