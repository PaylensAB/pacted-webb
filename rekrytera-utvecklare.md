# Hitta rätt utvecklare för pact:ed

Eftersom du själv inte är utvecklare behöver du anlita en. Här är hur du
hittar och utvärderar rätt person, med exakt formulering du kan kopiera.

## Vilken typ av utvecklare ska du leta efter?

**Roll:** Full-stack TypeScript-utvecklare med Next.js och Postgres-vana

**Erfarenhet:** Minst 3 år som utvecklare, gärna med tidigare SaaS-projekt

**Specifika kompetenser hen ska kunna pricka av:**
- Next.js 15 (App Router) — det är vad backenden är skriven i
- TypeScript på en bra nivå (inte bara "lite")
- PostgreSQL och en ORM (vi använder Prisma)
- Stripe-integrationer (Subscriptions specifikt)
- Webhook-hantering (vi använder Stripe webhooks)
- DevOps-grunder: Vercel-deployment, GitHub Actions, miljövariabler

**Bonus om hen även har:**
- E-postintegration (Resend, SendGrid eller liknande)
- GDPR-medvetenhet
- Tidigare jobbat mot HR-system eller liknande B2B-system

## Var ska du leta?

**Bra ställen:**
- **LinkedIn** — sök "Next.js consultant Sverige" eller "TypeScript freelancer"
- **Toptal / Lemon.io** — kuraterade frilanstjänster, dyrare men kvalitets­säkrade
- **Cinode / Brainville** — svenska konsultmäklare med tekniska konsulter
- **Twitter/X** — sök "#hireme nextjs sweden" eller posta jobbet
- **GitHub** — leta efter folk med synliga TypeScript/Next.js-projekt, hör av dig direkt
- **Ditt nätverk** — fråga andra grundare/CTOs om rekommendationer (oftast bäst)

**Mindre bra ställen (för det här bygget):**
- Upwork / Fiverr — kvaliteten är generellt för låg för detta
- Stora konsultbolag (Accenture, Sigma m.fl.) — för dyrt och långsamt för en MVP

## Vad ska det kosta?

Realistiska prisintervall i Sverige (2026):

| Erfarenhetsnivå | Timpris | Totalkostnad för bygget |
|---|---|---|
| Juniorkonsult | 600–900 kr/h | ~80–120 000 kr |
| Mellanivå | 900–1 400 kr/h | ~140–200 000 kr |
| Senior | 1 400–2 000 kr/h | ~200–300 000 kr |
| Toptal/Lemon.io | 1 800–2 500 kr/h | ~300–400 000 kr |

**Rekommendation:** Sikta på mellanivå eller en senior på reducerat pris i utbyte mot equity. Detta projekt är inte tekniskt svårt men kräver noggrannhet och produktomdöme.

**Alternativ till konsult:** Hitta en utvecklare som vill bli **medgrundare** mot equity. Kräver att du är beredd att ge bort 10–30 % av bolaget, men du får någon som är investerad i framgången. Annonsera på founderbeta.se eller AngelList.

## Annonstext du kan kopiera

```
TITLE: Senior Next.js-utvecklare för SaaS-bygge (4–6 veckor projekt)

Jag bygger pact:ed — en enkel digital signaturtjänst för svenska företag.
Allt designarbete och kodskeletten är klara. Jag behöver dig som tar det
sista steget — från prototyp till lanserad SaaS.

VAD DU GÖR
- Sätter upp infrastruktur (Vercel, Supabase, Stripe, Resend)
- Tar mitt fullständiga Next.js-projekt och får det produktion-klart
- Kopplar mot CatalystOne (HR-system) för första kunden
- Hjälper mig lansera till första betalande kund

VAD DU FÅR
- Komplett startpaket: arkitektur, kod, juridik, design (klart)
- Tydligt scope — inga vaga krav
- En grundare som vet vad hen vill men inte är utvecklare
- Möjlighet till långsiktigt samarbete vid framgång

DU HAR
- 3+ års erfarenhet av Next.js + TypeScript
- Byggt produktionsfärdiga SaaS-tjänster förut
- Tagit hand om Stripe Subscriptions tidigare
- Pratar svenska (eller engelska, men svenska föredras)

DETALJER
- Plats: distansarbete OK, baserat i Sverige
- Tidsåtgång: 4–6 veckor heltid eller 8–10 veckor halvtid
- Budget: timpris eller fast pris — säg vad du vill
- Start: så snart som möjligt

KONTAKT
Mejla leffe.dimitriou@gmail.com med:
- Senaste 2 SaaS-projekt du arbetat med
- Förslag på pris och tidplan
- Eventuella frågor

Jag svarar inom dagen.
```

## Hur du intervjuar

Tre frågor som avslöjar om hen är rätt person:

**1. "Hur skulle du hantera transient lagring i en SaaS där vi inte vill spara dokument långsiktigt, men måste behålla möjlighet till retry vid leveransfel?"**

Bra svar: Pratar om TTL-baserade rader i databasen, cron-jobs för rensning, idempotenta retries, separat persistent metadata-tabell för fakturering. Förstår spänningen mellan resiliens och datadiskretion.

Dåligt svar: Säger "kan vi inte bara spara allt och radera efteråt?". Visar att hen inte förstår positioneringen.

**2. "Vad är skillnaden mellan Stripe Checkout, Payment Intents och Subscriptions, och vilken hade du valt för en B2B-SaaS med månadsabonnemang?"**

Bra svar: Förklarar att Checkout = hostad page för engångsbetalningar eller subscriptions, Payment Intents = lägre nivå för custom UX, Subscriptions = recurring billing model. Valde Subscriptions med Checkout för enklast integration. Nämner webhook-hantering.

Dåligt svar: Vag eller behöver googla. Indikerar att Stripe-arbete blir tidsslukande.

**3. "Vi har skrivit allt API i Next.js App Router. Vad är de viktigaste sakerna att tänka på för säkerhet och prestanda i en multi-tenant SaaS?"**

Bra svar: Pratar om row-level filtering på databas-nivå, sessions vs API keys, rate limiting, query-optimering med rätt index, Edge runtime vs Node runtime, webhook signature verification. 

Dåligt svar: Generella security platitudes utan konkreta exempel.

## Kontrakt och samarbetsform

**För konsult (oftast bäst):**
- Skriv ett enkelt konsultavtal (Cinode har bra mallar, eller fråga grundar-jurist)
- Fast pris för "Phase 1: backend och deployment" — t.ex. 150 000 kr
- Timpris för efterarbete / nya features — t.ex. 1 200 kr/h
- 30-dagars betalningsvillkor, fakturering månadsvis

**För medgrundare:**
- Term sheet med equity vesting (1 år cliff, 3 år total typiskt)
- Aktieägaravtal (du behöver jurist för detta — räkna 20–40 000 kr)
- Tydlig rollfördelning: vem bestämmer vad

**Säg INTE:**
- "Vi bygger det helt på equity, du får 50 %" — låter dåligt och attraherar fel folk
- "Det blir lite jobb, kanske några veckor" — sätt realistiska förväntningar
- "Det är jätteenkelt" — det är inte direkt enkelt även om allt är förberett

## Vad du gör medan utvecklaren bygger

Parallella spår där du fokuserar:

1. **Juridik:** Skicka utkasten i `juridik/`-mappen till affärsjurist. Räkna 2–3 veckor för granskning och korrigeringar.

2. **Namnet:** Sök "pact:ed" och "Pacted AB" i [varumarken.prv.se](https://varumarken.prv.se). Köp `pacted.se` (Loopia). Lämna in PRV-ansökan.

3. **Första kund:** Använd `kundguide-onboarding.md` som säljmaterial. Boka 3–5 säljmöten med HR-chefer i ditt nätverk. Erbjud gratis 3 månader mot referensavtal.

4. **Stripe-konto:** Påbörja Stripe-registrering tidigt — det tar några dagar att godkännas och du vill ha det klart innan utvecklaren behöver det.

5. **Bankgiro:** Säkerställ att Pacted AB har ett bankkonto. Stripe behöver IBAN för utbetalningar.

## Tre signaler att utvecklaren är bra

Efter första veckan, kolla:

- ✓ Hen har installerat och fått backenden att kompilera. Säger "Jag hittade tre småfel i koden, lätta att fixa, här är pull request."
- ✓ Hen har frågor om affärs­beslut, inte tekniska beslut. Frågar t.ex. "Vill ni att leveranskonfigurationen sparas globalt eller per dokument?"
- ✓ Hen pushar tidiga screenshots och frågar om feedback. Visar att hen vill förstå det rätta, inte bara koda.

Tre röda flaggor:

- ✗ "Jag har börjat skriva om allt från scratch" — hen ignorerar arbetet som redan är gjort
- ✗ "Det finns bättre sätt att göra detta" + börjar omdesigna utan att fråga — hen prioriterar sin egen kreativitet över att leverera
- ✗ Tappar takten efter vecka 2, dåliga uppdateringar, undviker konkreta deadlines

Ha mod att avsluta samarbetet vid röda flaggor — det är dyrare att fortsätta.

## Lycka till

Det här är den mest värdesänkande aktiviteten just nu — att hitta rätt person.
Räkna 2–3 veckor från annons till anställd. Investera tiden här istället för
att försöka göra det själv.
