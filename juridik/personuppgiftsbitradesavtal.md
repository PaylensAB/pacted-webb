# Personuppgiftsbiträdesavtal (DPA)

**Mellan:** [Kundens företagsnamn], org.nr [ORG.NR] ("**Personuppgiftsansvarig**")
**Och:** Pacted AB, org.nr [ORG.NR] ("**Personuppgiftsbiträde**" eller "**pact:ed**")

**Detta avtal träder i kraft samtidigt som huvudavtalet mellan parterna och gäller så länge huvudavtalet är aktivt eller så länge personuppgifter behandlas, beroende på vilket som inträffar sist.**

> **VIKTIGT:** Detta är ett första utkast till personuppgiftsbiträdesavtal.
> GDPR-compliance är komplex och DPA:n bör granskas av jurist. Vissa
> formuleringar kan behöva justeras utifrån faktisk drift och underleverantörer.

## 1. Bakgrund och ändamål

Personuppgiftsansvarig (Kunden) använder pact:eds tjänst för digital signering
av dokument. För att kunna leverera Tjänsten behandlar pact:ed
personuppgifter för Kundens räkning. Detta avtal reglerar pact:eds roll som
personuppgiftsbiträde och säkerställer att behandlingen sker enligt
Dataskyddsförordningen (GDPR).

## 2. Föremål för behandlingen

| | |
|---|---|
| **Föremål** | Behandling av personuppgifter i samband med leverans av Tjänsten |
| **Varaktighet** | Under huvudavtalets löptid + tid som krävs för leverans/radering |
| **Syfte** | Möjliggöra signering av dokument och leverans till Kundens HR-system |
| **Typ av behandling** | Insamling, mellanlagring under signeringsprocessen, leverans till mottagarsystem, automatisk radering efter leverans |

## 3. Kategorier av personuppgifter

pact:ed behandlar följande personuppgifter för Kundens räkning:

| Kategori | Exempel |
|---|---|
| Identifieringsuppgifter | Namn, anställningsnummer |
| Kontaktuppgifter | (om Kunden valt att inkludera) e-post, telefon |
| Underskriftsdata | Ritad signatur (bild), tidsstämpel |
| Tekniska uppgifter | IP-adress, user agent, språkpreferens |

pact:ed behandlar inte särskilda kategorier av personuppgifter (känsliga
personuppgifter enligt GDPR art. 9) inom ramen för Tjänsten.

## 4. Kategorier av registrerade

- Anställda hos Personuppgiftsansvarig
- Konsulter eller andra personer som signerar dokument hos Personuppgiftsansvarig

## 5. Behandlingens art

**Mellanlagring och vidarebefordran** ("relay-behandling"). pact:eds arkitektur
är utformad så att signerade dokument inte lagras långsiktigt. Specifikt:

- När en signering startar lagras dokumentdata kortvarigt i pact:eds system.
- När signeringen slutförts genereras en signerad PDF.
- PDF:en levereras till Personuppgiftsansvarigs mottagarsystem (HR-system,
  e-postadress, SFTP m.fl.) enligt Personuppgiftsansvarigs anvisning.
- Efter bekräftad leverans raderas alla personuppgifter automatiskt från
  pact:eds produktionsmiljö.
- Endast anonymiserad metadata (dokument-id, kund-id, tidsstämpel) behålls för
  fakturering.

**Maximal lagringstid** för personuppgifter i pact:eds system är **48 timmar**
från signering. Vid leveransfel kan tiden förlängas tills Personuppgiftsansvarig
informerats och åtgärd vidtagits, dock maximalt **30 dagar**.

## 6. Personuppgiftsbiträdets skyldigheter

pact:ed förbinder sig att:

(a) endast behandla personuppgifter enligt Personuppgiftsansvarigs dokumenterade
instruktioner, vilka i normalfallet utgörs av detta avtal och pact:eds Tjänst;

(b) säkerställa att personer med åtkomst till personuppgifter har förbundit sig
att iaktta tystnadsplikt;

(c) vidta lämpliga tekniska och organisatoriska säkerhetsåtgärder enligt art.
32 GDPR (se avsnitt 9 nedan);

(d) inte anlita ett underbiträde utan skriftligt medgivande (allmänt eller
specifikt) från Personuppgiftsansvarig (se avsnitt 7 nedan);

(e) bistå Personuppgiftsansvarig med lämpliga åtgärder för att uppfylla
skyldigheterna i art. 32–36 GDPR (säkerhet, anmälan av personuppgiftsincident,
konsekvensbedömning, förhandssamråd);

(f) bistå Personuppgiftsansvarig vid begäran från registrerad om utövande av
sina rättigheter enligt kap. III GDPR;

(g) på Personuppgiftsansvarigs val antingen radera eller återlämna alla
personuppgifter efter avslutad behandling och radera befintliga kopior, om inte
unionsrätt eller medlemsstatsrätt kräver fortsatt lagring;

(h) ge Personuppgiftsansvarig tillgång till all information som behövs för att
visa att skyldigheterna i art. 28 GDPR efterlevs, samt möjliggöra och bidra
till revisioner.

## 7. Underbiträden

Personuppgiftsansvarig medger att pact:ed anlitar nedanstående underbiträden:

| Underbiträde | Tjänst | Behandling | Plats |
|---|---|---|---|
| [HOSTING] | Hosting | Kortvarig lagring av signaturdata | EU |
| [E-POST] | E-postleverans | Skickar signerade PDF:er till mottagare | EU |
| Stripe Inc. | Betalning | Hantering av faktura och betalning | EU/USA (SCC) |
| [BOKFÖRING] | Bokföring | Fakturahistorik | EU |

pact:ed kommer att informera Personuppgiftsansvarig om planerade ändringar
gällande tillägg eller utbyte av underbiträden minst **30 dagar** i förväg.
Personuppgiftsansvarig har rätt att invända mot ändringen. Om sådan invändning
inte kan lösas i godo har Personuppgiftsansvarig rätt att säga upp huvudavtalet
med rimligt varsel.

## 8. Överföring till tredje land

Behandlingen sker primärt inom EU/EES. Vid överföring till tredje land utan
adekvat skyddsnivå sker överföringen med stöd av EU-kommissionens
standardavtalsklausuler 2021/914 och, vid behov, kompletterande skyddsåtgärder.

## 9. Säkerhetsåtgärder

pact:ed tillämpar följande säkerhetsåtgärder:

**Tekniska åtgärder:**
- TLS 1.2 eller högre för all dataöverföring
- Kryptering av lagrade personuppgifter (AES-256)
- Tvåfaktorsautentisering för administratörsåtkomst
- Brandvägg och DDoS-skydd via hosting-leverantör
- Säkerhetsuppdateringar inom 72 timmar efter publicering
- Loggning av alla åtkomst- och ändringshändelser, lagringstid 12 mån
- Automatisk radering enligt definierad retentionpolicy

**Organisatoriska åtgärder:**
- Skriftlig informationssäkerhetspolicy
- Tystnadspliktsförklaring för all personal med åtkomst till personuppgifter
- Behörighetsstyrning (least privilege)
- Säkerhetsutbildning för personal årligen
- Incidentrutin med rapportering till Personuppgiftsansvarig inom 24 timmar
- Regelbundna penetrationstester (årligen)

## 10. Personuppgiftsincident

Vid en personuppgiftsincident som påverkar Personuppgiftsansvarigs uppgifter
ska pact:ed:

- informera Personuppgiftsansvarig **utan onödigt dröjsmål, senast inom 24 timmar** efter att pact:ed fått kännedom om incidenten,
- beskriva incidentens art, kategorier av personuppgifter och berörda registrerade, sannolika konsekvenser och vidtagna eller planerade åtgärder,
- bistå Personuppgiftsansvarig med information som behövs för anmälan till tillsynsmyndighet och eventuell information till registrerade.

## 11. Revision

Personuppgiftsansvarig har rätt att, mot rimlig kostnad och med **30 dagars
varsel**, genomföra revision av pact:eds efterlevnad av detta avtal en gång per
år. pact:ed kan istället för platsbesök erbjuda Personuppgiftsansvarig en
oberoende tredjepartsrevisionsrapport (t.ex. SOC 2 eller ISO 27001).

## 12. Avtalets upphörande

När huvudavtalet upphör ska pact:ed — på Personuppgiftsansvarigs val — antingen
radera alla personuppgifter eller återlämna dem inom 30 dagar. Avseende
back-up som inte kan raderas omedelbart, raderas dessa enligt pact:eds normala
retentionrutin (max 90 dagar) och får under tiden inte användas för andra
ändamål.

## 13. Tvistlösning och tillämplig lag

Detta avtal regleras av svensk lag. Tvister avgörs i samma forum som anges i
huvudavtalet.

## 14. Underskrifter

| Personuppgiftsansvarig | Personuppgiftsbiträde |
|---|---|
| Företagsnamn: [KUND] | Pacted AB |
| Org.nr: [ORG.NR] | Org.nr: [ORG.NR] |
| Underskrift: ______________ | Underskrift: ______________ |
| Namn: | Namn: |
| Datum: | Datum: |
