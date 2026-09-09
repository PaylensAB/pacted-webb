# Utvecklar-handover för pact:ed

**Till:** Utvecklaren som ska deploya pact:ed
**Från:** Leffe Dimitriou (grundare, Pacted AB)
**Tid att läsa:** 10 minuter

## Vad du tar emot

Ett komplett, designat och dokumenterat startpaket för en SaaS-tjänst:

- **Frontend-prototyp** (HTML/Tailwind) som visar hela kundresan: landing → signup → admin → signering → kvitto
- **Backend-projekt** (Next.js 15 + TypeScript + Prisma + PostgreSQL) — färdig kod i `backend/`
- **Juridiska dokument** klara för jurist­granskning
- **Komplett dokumentation:** arkitektur, deployment, kundguide, affärsmodell

## Vad du ska bygga

Förvandla prototypen till en lanserad SaaS. Konkret:

1. Klona `backend/` som ett nytt Next.js-projekt i ett Git-repo
2. Sätt upp infrastruktur — se `backend/deployment.md` för steg-för-steg
3. Koppla prototypens HTML-sidor mot backend-API:t (ersätt localStorage-anrop med fetch mot riktig API)
4. Testa hela kedjan end-to-end
5. Deploya till Vercel

**Realistisk tidsuppskattning:** 4–6 veckor fokuserad utvecklingstid. 2–3 veckor om du jobbar deltid vid sidan om annat.

## Vad som redan är gjort åt dig

Skippa följande tidsslukande steg — jag har redan gjort dem:

- **Arkitekturdesign** (transient relay-modell, multi-tenancy, Stripe-integration)
- **Databasschema** (Prisma, 10 modeller, 7 enums)
- **API-endpoints**: auth (magic link), documents CRUD, signatures-submission, Stripe checkout + webhook, CatalystOne-leverans, delivery config, cron purge
- **Säkerhetsmodell**: krypterade sessions, encrypted secrets, multi-tenant filtering, audit logs
- **PDF-generering** server-side (samma layout som prototypens klientversion)
- **CatalystOne-adapter** med felhantering och retry-logik
- **Cron-job** för automatisk PII-radering varje timme
- **Frontend-design** (Tailwind, responsiv, mobil-först)
- **Juridiska utkast** för affärsjurist (TOS, integritetspolicy, DPA, SLA m.fl.)
- **Kundguide** som du kan skicka till första kunder

Du behöver alltså inte tänka *vad* — bara *hur*.

## Mitt status­meddelande till dig

Koden har granskats statiskt men inte byggts (jag har inte haft tillgång till npm-registret i min utvecklingsmiljö). Du bör räkna med att:

- **Beroenden installeras rent** med `npm install`
- **Prisma-schemat genererar** med `npx prisma generate`
- **TypeScript-kompilering** kan visa några små type-errors att fixa (jag har skrivit utan att kunna köra `tsc` mot bibliotekens egna typer)

Räkna en halv arbetsdag för "smoke test"-fasen där du installerar, kompilerar och fixar småfel. Om något ser konstigt ut — fråga grundaren, det är förmodligen ett designval värt att diskutera.

## Konton du behöver skapa

Grundaren (Leffe) behöver hjälpa dig med dessa eftersom de kräver identitets­verifiering:

| Tjänst | Vem skapar | Vad krävs |
|---|---|---|
| Stripe | Leffe | BankID, organisations­nummer, bankgiro |
| Domän (pacted.se) | Leffe | Kreditkort, identitets­uppgifter |
| Bolagsverket (firma­ändringar) | Leffe | BankID |
| PRV (varumärke) | Leffe | Personnummer, betalning |
| Supabase | Antingen | E-post räcker |
| Vercel | Antingen | E-post + GitHub-auth |
| Resend | Antingen | E-post + DNS-konfiguration |

Diskutera med Leffe vem som ska äga vad. Rekommenderat: Leffe äger alla konton (han är ju ägaren), du får IAM-roller / collaborator-access.

## Tekniska beslut jag förväntar mig att du tar

Frihetsgrader där jag har en uppfattning men du har sista ordet:

- **Tester:** Lägg gärna till Vitest/Playwright. Jag har inte skrivit tester — det är medvetet för att hålla tiden nere på paket­byggandet.
- **Logging/observability:** Föreslår Sentry (gratis tier). Sätt upp tidigt.
- **CI/CD:** GitHub Actions för PR-validation, Vercel handles deploy automatiskt.
- **Branch-strategi:** main → produktion, develop → staging (om Vercel branch deploys används).
- **Code style:** Prettier + ESLint enligt Next.js standardkonfig.

## Vad du ska INTE göra

Saker som verkar rimliga men som är fel för pact:ed:

- **Inte ändra branding** — pact:ed (visuell) / Pacted AB (legal) / pacted.se (domän) är bestämt
- **Inte lägga till långtidslagring av signerade dokument** — hela poängen är transient relay (max 48h)
- **Inte använda BankID** — vi gör SES-signaturer, BankID är överdrivet för vårt scope
- **Inte bygga mobilapp** — webb-först, mobil-responsiv är tillräckligt
- **Inte exponera API:t publikt** — bara administratörsanvändning i V1

## Kontaktvägar

- **Leffe (grundare):** leffe.dimitriou@gmail.com — för affärs- och produktbeslut
- **Affärsjurist:** [kommer], granskar juridiska dokumenten
- **CatalystOne kontakt:** [kommer], hjälper med API-detaljer för första kund

## Början på vecka 1

```bash
# Steg 1: Klona till nytt Git-repo
git clone <pacted-backend-template> pacted-backend
cd pacted-backend

# Steg 2: Installera
npm install

# Steg 3: Konfigurera lokalt
cp .env.example .env
# (fyll i med test-credentials från Stripe Test mode, lokal Postgres,
#  Supabase eller Resend testkonto)

# Steg 4: Databas
npx prisma migrate deploy
npx prisma generate

# Steg 5: Smoke test
npm run dev
# öppna http://localhost:3000

# Steg 6: Status check
# - skapa testkonto via signup
# - skapa dokument
# - signera via QR-länk
# - verifiera leverans till test-mejl

# Steg 7: Rapportera tillbaka — vad funkade, vad fixade du?
```

## Tre principer att hålla i åtanke

1. **Enkelhet före funktioner.** Om en feature inte direkt hjälper en HR-chef
   bli av med pappersarbete — skippa den.

2. **Transient relay är heliga.** Vi sparar aldrig signerade dokument efter
   leverans. Det är vår positionering och säljpunkt.

3. **Snabb feedback-loop.** Bygg-mät-lär. Få första kund så fort som möjligt,
   även om V1 är mer manuell än automatiserad.

Lycka till. Jag finns tillgänglig (Leffe) för frågor och beslut.

— Leffe
