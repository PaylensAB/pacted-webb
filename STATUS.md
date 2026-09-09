# Var vi är just nu — pact:ed

**Senast uppdaterat:** 12 maj 2026

## Vad som hänt i senaste sessionen

- **Support-modell ändrad:** ingen SLA, ingen garanterad svarstid. E-post-only via hej@pacted.se. Ny `supportpolicy.md` ersätter `sla.md`.
- **B2C-prismodell införd:** 5 gratis kvitton per webbläsare, sedan 29 kr/år för obegränsat. Paywall-modal i kvitto.html. Stripe-produkt "pact:ed Privat" 29 kr/år tillagd.
- Plan-funktioner uppdaterade i landing/signup/account — borttagna "Prioriterad support" och "SLA + dedikerad kontaktperson".
- Användarvillkor uppdaterade: årsfakturering, 12-månadersavtal, ingen SLA-klausul.
- Integritetspolicy uppdaterad med premium-aktivering för B2C-kvitto.

**Aktuell prismodell:**

| Plan | Pris/år | Kvot | Användare |
|---|---|---|---|
| B2C Gratis | 0 kr | 5 kvitton (per webbläsare) | Privatpersoner |
| B2C Privat | 29 kr/år | Obegränsat | Privatpersoner |
| Gratis | 0 kr | 10 signaturer/år | Företag (test) |
| Liten | 299 kr/år | 500 signaturer/år | Småföretag |
| Mellan | 699 kr/år | 2 000 signaturer/år | Mellanstora |
| Stor | 999 kr/år | 5 000 signaturer/år | Större org. |

**Tidigare i projektet:** komplett backend i `backend/`, alla juridiska utkast, prototyp-frontend, branding pact:ed, förvärvsstrategi i affärsmodellen.

## Komplett filöversikt

```
outputs/
├── STATUS.md                                  ← den här filen
├── README.md                                  ← översikt och roadmap
├── namnanalys.md                              ← namnval & varumärkesstrategi
├── affarsmodell.md                            ← prisstrategi & Stripe-plan
├── kundguide-onboarding.md                    ← guide för företagskunder
│
├── landing.html                               ← marknadsföringssidan
├── signup.html                                ← signup med checkout
├── account.html                               ← prenumerationsförvaltning
├── index.html                                 ← admin-dashboard (prototyp)
├── sign.html                                  ← signeringssida (mobil)
├── kvitto.html                                ← gratis köpekvitto (B2C)
│
├── juridik/
│   ├── anvandarvillkor.md                     ← TOS B2B
│   ├── anvandarvillkor-privat.md              ← TOS B2C
│   ├── integritetspolicy.md                   ← GDPR
│   ├── personuppgiftsbitradesavtal.md         ← DPA
│   ├── cookiepolicy.md                        ← Cookies
│   ├── sakerhetsbeskrivning.md                ← Säljmaterial till IT-chefer
│   ├── GDPR-checklista.md                     ← Intern arbetslista
│   ├── sla.md                                 ← SLA Mellan/Stor (NY)
│   └── catalystone-integration-bilaga.md      ← Teknisk bilaga (NY)
│
└── backend/                                   ← (NY) Komplett Next.js-projekt
    ├── README.md
    ├── arkitektur.md
    ├── deployment.md
    ├── package.json, tsconfig.json, next.config.js
    ├── .env.example, .gitignore, vercel.json
    ├── prisma/
    │   └── schema.prisma                      ← Komplett databasschema
    └── src/
        ├── lib/                               ← db, auth, stripe, email, pdf, storage, crypto, catalystone, delivery
        └── app/api/
            ├── auth/{request-magic-link, verify}
            ├── documents/
            ├── signatures/                    ← Transient relay-flödet
            ├── stripe/{checkout, webhook}
            ├── delivery/config/
            └── cron/purge-expired             ← Schemalagd radering varje timme
```

## Vad utvecklaren ska göra för att gå live

Räkna 2–4 timmar för första uppsättning, 4–6 veckor för fullt fungerande
produkt med första kund.

### Vecka 1: Uppsättning (utvecklare gör)

1. Klona `backend/`-mappen som ett nytt Next.js-projekt
2. Skapa konton: Supabase (databas), Resend (e-post), Stripe (betalning)
3. Kör `npm install`, kopiera `.env.example` till `.env`, fyll i nycklar
4. Kör databasmigrationer: `npx prisma migrate deploy`
5. Lokala smoke-tests enligt deployment.md
6. Deploy till Vercel

### Vecka 2: Frontend-integration

7. Anpassa de befintliga HTML-filerna (signup.html, account.html, index.html,
   sign.html, kvitto.html) att anropa backend-API:t istället för localStorage
8. Verifiera hela flödet end-to-end

### Vecka 3: Polish och första kund

9. Skicka juridiska dokumenten till affärsjurist för granskning
10. Hitta första testkund (din arbetsgivare eller kontakt)
11. Onboarding av testkund med kundguiden som referens

### Vecka 4: Produktion

12. Aktivera Stripe Live mode (efter att Stripe godkänt företaget)
13. Skicka jurist-granskade dokument till första kund för signering av DPA
14. Lansera publikt på pacted.se

## Status — fyra spår framåt

### Spår 1: Namn och varumärke

Innan ni går vidare:

1. Sök på "Pacted" och "pact:ed" i [varumarken.prv.se](https://varumarken.prv.se)
2. Kolla att `pacted.se` är ledig hos Loopia eller one.com
3. Köp domän + lämna in PRV-ansökan (klass 9 + 42)

### Spår 2: Juridik

Skicka utkasten i `juridik/`-mappen till affärsjurist:
- anvandarvillkor.md (B2B)
- anvandarvillkor-privat.md (B2C)
- integritetspolicy.md
- personuppgiftsbitradesavtal.md
- cookiepolicy.md
- sla.md (NY)
- catalystone-integration-bilaga.md (NY)

Räkna 8–15 000 kr för första granskning.

### Spår 3: Backend till produktion

Backend-projektet i `backend/`-mappen är **redo att deployas**. Hand över
till en utvecklare (eller dig själv om du har den kompetensen). Se
`backend/deployment.md` för steg-för-steg.

### Spår 4: Första kund

Mest värdefulla aktiviteten just nu:

- LinkedIn-utskick till HR-chefer
- Din arbetsgivare som pilotkund
- Erbjud gratis testperiod mot referensavtal

## Testflödet just nu

**Som prototyp i webbläsaren (utan backend):**

1. landing.html — kunden landar, ser priser, klickar "Prova nu"
2. signup.html — fyller i konto, företag, väljer plan, mockad betalning
3. index.html — adminvyn där hen skapar dokument + QR-koder
4. sign.html — den anställda scannar och signerar
5. account.html — administratören hanterar prenumeration

**Som backend (när utvecklaren deployar):**

1. Frontend-filerna anropar API-endpoints istället för localStorage
2. Stripe Checkout används istället för mockad betalning
3. Magic link via Resend istället för direkt inloggning
4. Riktig CatalystOne-leverans istället för bara nedladdning
5. Automatisk radering efter leverans via cron-job

## Vad jag levererat i denna session

- 13 nya filer i `backend/` (TypeScript-projekt)
- Databasschema med multi-tenant + transient relay-design
- Magic link-auth, dokuments-CRUD, signaturflöde, Stripe-integration
- CatalystOne-adapter med felhantering och retry-logik
- Cron-job för automatisk PII-radering varje timme
- Kundguide (15 sektioner) för företagskunder
- SLA + CatalystOne-bilaga
- Allt rebrandat till pact:ed konsekvent

Vill du fortsätta med att skapa de specifika onboarding-skärmarna i
admin-panelen (för CatalystOne-uppsättning t.ex.), bygga publika API:et,
eller sätta upp Stripe-kontot tillsammans — säg till.
