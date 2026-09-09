# Affärsmodell och prisstrategi — pact:ed

Detta dokument beskriver hur pact:ed tjänar pengar, vilka strategiska val
som styr modellen, och hur betalningsinfrastrukturen ska sättas upp.

## Sammanfattning på 60 sekunder

pact:ed är en **lågpris-SaaS med årsabonnemang och volymtiers**. Strategin är
medvetet **volym före marginal** — vi siktar på 2 000–3 000 kunder snarare än
hundratals. Den stora intäkten kommer inte från enskilda kunder utan från
kundbasen som helhet.

**Tre prisplaner + gratis:**

| Plan | Pris/år | Signaturer/år | Effektiv månadskostnad |
|---|---|---|---|
| Gratis | 0 kr | 10 | 0 kr/mån |
| Liten | 299 kr | 500 | 25 kr/mån |
| Mellan | 699 kr | 2 000 | 58 kr/mån |
| Stor | 999 kr | 5 000 | 83 kr/mån |
| Enterprise | Kontakta | 5 000+ | varierar |

**B2C kvitto-tjänsten:** 5 gratis kvitton, sedan 29 kr/år för obegränsat.

## Två sätt att vinna

Den här prismodellen är inte slumpmässigt lågprissatt — den är optimerad för
två parallella utfallsvägar:

**Väg 1: Lifestyle-business.** Vid 2 000 kunder med snittpris 500 kr/år får du
1 miljon kr i återkommande intäkt. Drift kostar ~50 000 kr/år. Resterande är
vinst som kan tas ut som lön + utdelning. Det är inte ett enhörnings-bolag men
det är en **stabil 7-siffrig årsinkomst** som driver sig själv. Stort utfall
för låg insats.

**Väg 2: Förvärv.** En kundbas på 2 000–3 000 svenska SMB-kunder är ett
**värdefullt asset** för någon som vill in i den marknaden. Bokio, Visma, Hogia,
Fortnox, Personalkollen — alla skulle gärna betala för att få access till din
kundbas och cross-sell sina egna produkter. Förvärvsmultiplar i sektorn är
typiskt 3–8x ARR plus en premie för kundkvalitet. Vid 1M ARR = potentiellt
3–15M kr i exit-värde, ovanpå löpande intäkter under uppbyggnaden.

Båda vägarna kräver samma operativa modell: lågt pris, hög volym, ultralågt
support­behov. Bygg för (1), behåll optionalitet för (2).

## Värdeerbjudandet

Konkurrenter (DocuSign, Scrive, Oneflow, Penneo m.fl.) tar 100–500 kr per
användare per månad och fokuserar på avtalshantering och e-signering med
BankID. De är dyra, komplicerade, byggda för stora team.

Vad pact:ed erbjuder istället:

1. **Pris** — så lågt att invändningen "är det värt det?" försvinner. 299 kr/år är ett impulsköp utan attestkrav.
2. **Enkelhet** — anställd behöver inget konto, ingen app, ingen utbildning. Scanna QR, signera, klart.
3. **Användningsfall** — fokuserat på enkla kvittenser och bekräftelser, inte komplexa avtal.
4. **Gratis startsteg** — 10 signaturer per år utan kort eller registrering. Inga ursäkter att inte testa.
5. **Transient relay-arkitektur** — vi sparar inga dokument. GDPR-fördel + säljpunkt.

Den här positioneringen är **medvetet smal**. Vi tar inte upp kampen om avtal
som kräver BankID — vi äger det utrymmet där BankID är överdrivet.

## Varför årspris och inte månadspris?

Tre skäl till att vi väljer årsfakturering:

**Kassaflöde.** 299 kr × 12 i månadsfakturor är logistiskt jobbigt för
småföretag att hantera. En enda årsfaktura på 299 kr är trivialt att
bokföra. Du får dessutom hela årets intäkt direkt vid signup.

**Lägre churn.** En kund som har betalat 299 kr för ett år struntar i att säga
upp av lathet. När fakturan kommer nästa år har de redan glömt att de inte
använder tjänsten — men de förnyar i alla fall, eftersom det är så billigt.
Detta är "låsneffekten" i lågpris-SaaS — sjukbra för LTV.

**Annonsering.** "Från 299 kr/år" är dramatiskt mer attraktivt i annonser och
sökresultat än "från 25 kr/mån". Det första låter som en engångskostnad, det
andra som en pågående utgift.

## Hur många kunder behöver du?

Olika utfall för olika antal kunder:

| Antal kunder | Snittintäkt/kund | Total ARR | Drift | Vinst före skatt |
|---|---|---|---|---|
| 100 | 500 kr | 50 000 | 30 000 | 20 000 kr |
| 500 | 500 kr | 250 000 | 50 000 | 200 000 kr |
| 1 000 | 500 kr | 500 000 | 70 000 | 430 000 kr |
| 2 000 | 500 kr | 1 000 000 | 100 000 | 900 000 kr |
| 3 000 | 500 kr | 1 500 000 | 150 000 | 1 350 000 kr |
| 5 000 | 500 kr | 2 500 000 | 250 000 | 2 250 000 kr |

Vid 500 kunder börjar det vara värt det. Vid 1 000 kunder är det en
**lägenhet i Stockholm per år i vinst**. Vid 2 000 kunder är du i territoriet
där förvärv blir intressant — och tills någon vill köpa, tjänar du bra
ändå.

## Free tier som tillväxtmotor

Gratis upp till 10 signaturer per år är medvetet lågt. Det är **inte ett
fullvärdigt erbjudande** — det är ett smakprov.

**Logiken:** 10 signaturer räcker för en HR-chef att testa flödet (skapa
dokument, sätta upp QR, scanna med telefonen, se PDF:en, leverera till
HR-systemet). När de bekräftat att "ja, det här löser ett verkligt problem"
är 299 kr/år en triviall summa att betala för att låsa upp tjänsten på riktigt.

Konverteringen blir snabb: kunder som passerar 10-gränsen ser ett pop-up
("Du har använt din gratis-kvot — uppgradera för 299 kr/år och fortsätt
direkt"). Friktionen är minimal eftersom priset är trivialt.

## Soft tier-överskridning

När en kund närmar sig sin tier-gräns, så här hanterar vi det (mjuk uppgradering):

| Användning | Vad händer |
|---|---|
| < 80 % av kvot | Inget — kunden ser bara aktuell användning i admin-panelen |
| 80–99 % | E-postnotis: "Du har använt 80 % av din årskvot. Tänkbart att uppgradera." |
| 100–119 % | E-postnotis + banner i admin: "Du har passerat din kvot. Tjänsten fortsätter fungera men vi rekommenderar uppgradering inom 30 dagar." |
| 120 %+ efter 30 dagar | Automatisk uppgradering till nästa tier. Kunden notiseras innan: "Vi uppgraderar dig till Mellan i morgon om du inte väljer själv." |
| Aldrig | Vi blockerar **aldrig** signaturer mitt i en utlämning |

Detta är centralt för vår positionering. Att vara hjälpsam när kunden växer är
hela skillnaden mot konkurrenter som spärrar funktionaliteten.

## B2C kvitto-tjänsten — både intäkt och distribution

B2C-flödet (privat köpekvitto) fungerar nu **dubbelt**: dels som inkomstkälla i sig
(29 kr/år efter 5 gratis kvitton), dels som distribution mot B2B-kunder.

**Pris- och friktions­modell:**
- 5 första kvittona är gratis (per webbläsare) — räcker för att uppleva värdet
- Efter det: 29 kr/år ger obegränsat antal kvitton
- Bara mejladress krävs vid uppgradering — ingen registrering innan
- Pengarna tillbaka 30 dagar om man inte är nöjd

**Förväntat intäktsutfall vid skala:**

| Antal aktiva B2C-användare | Konverteringsgrad till premium | Intäkt B2C/år |
|---|---|---|
| 10 000 | 5 % = 500 betalande | 14 500 kr |
| 50 000 | 5 % = 2 500 betalande | 72 500 kr |
| 100 000 | 5 % = 5 000 betalande | 145 000 kr |

Inte stort i absoluta tal, men på rätt skala — och **det är värdet av kundbasen som
betyder mest**. En förvärvspartner ser inte bara MRR — de ser antal abonnenter.
5 000 B2C-betalande + 2 000 B2B-kunder = 7 000 verifierade prenumeranter, vilket
är mer attraktivt än enbart 2 000 B2B.

**Förvärvsattraktionen:**

- Av 10 000 B2C-användare/månad kommer kanske 50–100 att nämna pact:ed på sin arbetsplats
- 5–10 leder till företagskund per månad — gratis kundförvärv
- Premium-abonnenter (29 kr/år) är dessutom verifierade emails — ger en marknadsföringsbas

**Kostnad:** Marginalkostnad nära noll. PDF genereras helt i webbläsaren. Stripe-avgift för 29 kr-transaktion: ~2,20 kr. Nettokostnad per premium-aktivering: 2,20 kr. Nettomarginal: ~92 %.

**Implementation:**
- Stripe Product "pact:ed Privat" på 29 kr/år
- Localstorage räknar 5 gratis kvitton per webbläsare
- Vid kvotgräns: modal med Stripe Payment Link (ingen backend-account behövs)
- Premium-status sparas i localstorage med 365-dagars TTL
- Vid förnyelse: Stripe skickar e-post och kunden klickar för att fortsätta

## Marknadsföringsstrategi givet lågpris

Med 500 kr genomsnitt-ARR per kund är **betalda annonser nästan omöjliga**.
LTV på 1 500 kr (3 år) ger en max-CAC på ~300 kr om vi vill ha 5:1-ratio.
LinkedIn-annonser kostar 200–500 kr per klick. Annonsering går inte ihop.

Istället förlitar vi oss på:

**SEO via B2C-flödet.** Köpekvitto-sidan attraherar 1 000-tals månatliga sökningar utan kostnad. Denna trafik konverterar till B2B via mun-till-mun.

**Mun-till-mun.** Med ett pris under 1 000 kr/år är pact:ed något folk tipsar varandra om över lunchen. "Vi använder en grej som heter pact:ed för utlämningar. 299 kr om året, sjukt smidigt."

**Produktledd tillväxt.** Att skapa ett gratis konto, testa, och uppgradera ska ta totalt 5 minuter. Ingen demosession, inget säljmöte, ingen offert.

**Branschkanaler.** Förvaltarbloggar (Driftnära, HR-Today), HR-konsulter, branschorganisationer som FAR och Almega. De flesta av dessa är gratis att placera i.

**Innehållsmarknadsföring.** Skriv 10–20 blogginlägg som rankar på sökord
HR-folk googlar: "Hur dokumenterar man utlämning av arbetskläder?", "GDPR och
personalhandbok", "Mall för uniformkvittens". Investera i SEO över 12 månader.

## Pricing-experiment att överväga (senare)

Saker vi kan lägga till när tjänsten är etablerad:

1. **Engångs-paket** — 50 extra signaturer för 99 kr om man tillfälligt går över
2. **Branding-tillägg** — 199 kr/år för egen logotyp i PDF:er. Lågt motstånd, hög marginal.
3. **Multipla administratörer** — gratis upp till 3, sedan 99 kr/extra/år.
4. **API-access** — 499 kr/år extra för kunder som vill integrera mot egna system.
5. ~~Premium support~~ — Vi erbjuder medvetet ingen premium-support. Modellen kräver låg support­belastning för att kunna leverera till lågpris.

Alla dessa är **tillägg ovanpå basplanen**, inte tier-uppgraderingar. Det gör att kunder kan välja exakt vad de behöver.

## Vad du som grundare ska bygga mot

Mätbara mål för ett "förvärvs-attraktivt" bolag efter 24 månader:

| Mätetal | Mål |
|---|---|
| Antal betalande kunder | 2 000+ |
| Årsåterkommande intäkt (ARR) | 1 000 000 kr+ |
| Månadskhurn | < 3 % |
| Genomsnittlig kundlivslängd | 30+ månader |
| Genomsnittlig signatur/kund/år | 200+ (visar engagemang) |
| Geografisk spridning | Hela Sverige, inte bara Stockholm |
| Branschdiversifiering | Max 30 % i en enskild bransch |
| Kundnöjdhet (NPS) | > 40 |
| Drift­kostnad / intäkt | < 10 % |

Detta är vad en förvärvspartner kommer att granska. Designa
verksamheten så att dessa siffror blir starka.

## Stripe-uppsättning för produktion

### 1. Stripe-konto

Registrera ett **Stripe-konto** på [stripe.com/se](https://stripe.com/se) med
företagets uppgifter. Aktivera Sverige som land. Du behöver:

- Bankgiro eller IBAN för utbetalningar
- BankID-verifiering
- Affärsbeskrivning som matchar pact:ed
- F-skatt och momsregistrering

### 2. Produkter och priser i Stripe

Skapa **tre Products** i Stripe Dashboard:

| Product | Pris | Period | Trial |
|---|---|---|---|
| pact:ed Privat | 29 kr | per year | Ingen (5 gratis kvitton istället) |
| pact:ed Liten | 299 kr | per year | 14 dagar |
| pact:ed Mellan | 699 kr | per year | 14 dagar |
| pact:ed Stor | 999 kr | per year | 14 dagar |

Notera: **kortare trial** (14 dagar istället för 30) — för 299 kr/år är 14 dagar
mer än tillräckligt att testa och konvertera är ett impulsbeslut.

För gratis-tier behöver du **ingen Stripe-produkt** — vi hanterar det helt i
vår egen databas (max 10 signaturer/år, inget kort behövs).

### 3. Stripe Checkout

Användaren klickar "Aktivera prenumeration" → vår backend skapar en Stripe
Checkout Session → kunden betalar direkt eller startar 14-dagars trial.

```js
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: 'price_liten_aar', quantity: 1 }],
  subscription_data: {
    trial_period_days: 14,
    billing_cycle_anchor_config: { day_of_month: 1 }, // valfritt — anchor till månadens 1:a
  },
  customer_email: email,
  success_url, cancel_url,
});
```

### 4. Webhook och usage tracking

Stripe-webhooks vi lyssnar på:

- `customer.subscription.created` — sätt status, börja räkna signaturer
- `customer.subscription.updated` — uppdatera plan vid uppgradering
- `customer.subscription.deleted` — sätt status canceled (men behåll kund i 30 dagar)
- `invoice.payment_failed` — påminn admin, mjuk eskalering
- `invoice.paid` — bokföra

### 5. Tier-överskridningslogik (vår egen backend)

```typescript
// I src/lib/usage.ts
export async function countSignaturesThisYear(customerId: string): Promise<number> {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  return db.signatureEvent.count({
    where: { customerId, signedAt: { gte: yearStart } },
  });
}

export async function checkAndNotifyOverage(customerId: string) {
  const used = await countSignaturesThisYear(customerId);
  const limit = await getTierLimit(customerId);
  const pct = used / limit;
  if (pct >= 1.2 && daysSinceFirstOverage(customerId) > 30) {
    return autoUpgradeToNextTier(customerId);
  } else if (pct >= 1.0) {
    return sendOverageNotice(customerId, 'over');
  } else if (pct >= 0.8) {
    return sendOverageNotice(customerId, 'approaching');
  }
}
```

Detta körs som en del av cron-jobbet som ändå finns för PII-radering — adding
en användnings­kontroll varje natt kostar nästan ingenting.

### 6. Kostnad för Stripe

| Tjänst | Avgift |
|---|---|
| Svenska kort | 1,4 % + 1,80 kr per transaktion |
| Europeiska kort | 1,4 % + 1,80 kr |
| Icke-europeiska kort | 2,9 % + 1,80 kr |

För 299 kr/år blir avgiften: 4,19 + 1,80 = 5,99 kr per kund per år. Total
Stripe-andel: ~2 % av intäkt. Försumbart.

## Sammanfattning av strategiska val

| Val | Beslut |
|---|---|
| Pris­modell | Årsabonnemang med volymtiers |
| Priser | Gratis (10), 299 (500), 699 (2000), 999 (5000) kr/år |
| Trial | 14 dagar |
| Gratis | Permanent tier, inte begränsad till X dagar |
| Tier­överskridning | Mjuk — notisera, tillåt fortsatt användning, auto-uppgradera vid 120 % efter 30 dagar |
| Distribution | SEO via B2C + mun-till-mun + branschkanaler |
| Lönsamhets­mål | 1M ARR vid 24 månader, 2M vid 36 |
| Exit-mål | Förvärv av Bokio/Visma/Hogia/Fortnox-liknande aktör vid 2 000+ kunder |

## Vad du behöver göra

1. Bestäm namn (sista chansen — Pact / pact:ed verkar fungera)
2. Sätt upp Stripe i test-mode och skapa tre års-produkter
3. Anlita utvecklare som tar `backend/`-mappen till lanserad tjänst
4. Skicka juridik till affärsjurist för granskning
5. Sätt upp första testkund — be om referensavtal istället för betalning under första 6 månader
6. Skriv 10 SEO-blogginlägg och påbörja organisk tillväxt
