# Integritetspolicy för pact:ed

**Senast uppdaterade:** [DATUM]
**Version:** 1.0

> **VIKTIGT:** Detta är ett första utkast. Granska med jurist innan
> publicering. GDPR är komplex och formuleringar bör spegla din faktiska
> drift och datahantering.

## 1. Vem ansvarar för behandlingen?

Personuppgiftsansvarig är **Pacted AB**, organisationsnummer **[ORG.NR]**, med
säte i **[ORT]** ("**vi**", "**oss**" eller "**pact:ed**").

Kontakt: **hej@pacted.se**

För alla personuppgiftsfrågor kan du också kontakta vår dataskyddsfunktion på
**dpo@pacted.se**.

## 2. När gäller denna policy?

Denna integritetspolicy beskriver hur vi behandlar personuppgifter när du:

- besöker vår webbplats pacted.se,
- registrerar ett administratörskonto eller använder Tjänsten i egenskap av kundrepresentant,
- skapar eller signerar ett gratis köpekvitto i egenskap av privatperson,
- kontaktar oss via e-post eller telefon.

Anställda hos våra företagskunder vars uppgifter behandlas i samband med
signering omfattas av sin arbetsgivares (kundens) integritetspolicy. pact:ed
agerar då som personuppgiftsbiträde åt arbetsgivaren och hanteringen regleras
av ett separat personuppgiftsbiträdesavtal (DPA).

## 3. Vilka personuppgifter behandlar vi och varför?

### 3.1 När du registrerar ett administratörskonto

| Uppgift | Ändamål | Rättslig grund | Lagringstid |
|---|---|---|---|
| Namn, e-postadress, telefonnummer | Skapa och administrera konto, kommunikation om Tjänsten | Avtal (art. 6.1.b GDPR) | Under avtalstiden + 36 mån för bokföring |
| Företagsnamn, organisationsnummer, fakturaadress | Fakturering | Avtal | 7 år (bokföringslagen) |
| Inloggningsuppgifter (lösenordshash) | Säker inloggning | Avtal | Under avtalstiden |
| IP-adress vid inloggning | Säkerhet, missbruksprevention | Berättigat intresse | 90 dagar |

### 3.2 När du använder Tjänsten som administratör

| Uppgift | Ändamål | Rättslig grund | Lagringstid |
|---|---|---|---|
| Användarmönster (vilka funktioner du använder) | Förbättra Tjänsten, support | Berättigat intresse | 24 mån, anonymiseras därefter |
| Supportärenden och korrespondens | Kundsupport | Avtal | 36 mån |

### 3.3 När du skapar ett privat köpekvitto

För privata köpekvitton mellan privatpersoner använder pact:ed **transient
behandling** — uppgifter behandlas tillfälligt under sessionen och **lagras
inte hos oss** efter att kvittot genererats. PDF-filen genereras lokalt i
användarens webbläsare och laddas ner direkt till användarens enhet utan att
passera våra servrar.

Vad vi tillfälligt behandlar:

- Namn, eventuellt personnummer och kontaktuppgifter för säljare och köpare
- Beskrivning av varan och pris
- Signaturer (ritade som bild)
- Datum och plats för affären

Detta sparas inte efter att sessionen avslutats. Vi har ingen möjlighet att
återskapa eller hämta tillbaka kvittot åt dig.

**Vid premium-aktivering (29 kr/år):** vi sparar dessutom din e-postadress, en
referens till din Stripe-prenumeration och tidpunkten för aktivering. Ändamål:
fakturering, automatisk förnyelse, möjlighet för dig att säga upp. Rättslig
grund: avtal. Lagringstid: under prenumerationens löptid + 7 år för bokföring.

### 3.4 När en anställd signerar via QR-kod

När en anställd signerar ett dokument hos en av våra företagskunder, behandlar
vi följande uppgifter **kortvarigt** under signeringsprocessen:

- Namn (inmatat manuellt)
- Anställningsnummer (inmatat manuellt)
- Signaturbild (ritad)
- Tidsstämpel
- IP-adress
- User agent (enhetstyp)

Så snart dokumentet är signerat skickas det till arbetsgivarens HR-system
eller e-postadress, varefter det raderas från pact:eds system. Endast
**anonymiserad metadata** (dokument-id, kund-id, tidpunkt) sparas för
fakturering. Vi sparar **inga personuppgifter om den anställda** efter att
signering slutförts.

För denna behandling agerar pact:ed som **personuppgiftsbiträde** åt
arbetsgivaren. Personuppgiftsansvarig är arbetsgivaren.

### 3.5 När du besöker vår webbplats

Vi använder ett minimalt antal cookies för funktionalitet och säkerhet, samt —
med ditt samtycke — för anonym besöksstatistik. Detaljer finns i vår
**[cookiepolicy](cookiepolicy.md)**.

## 4. Mottagare av personuppgifter

Vi delar personuppgifter med:

- **Hostingleverantör**: [HOSTING-LEVERANTÖR, t.ex. Vercel/Fly.io] — för att driva Tjänsten. Underbiträde enligt DPA.
- **E-postleverantör**: [E-POST-LEVERANTÖR, t.ex. Resend] — för att skicka e-postmeddelanden. Underbiträde enligt DPA.
- **Betaltjänstleverantör**: Stripe — för att hantera fakturering. Mottagare är personuppgiftsansvarig.
- **Bokföringssystem**: [BOKFÖRINGSSYSTEM] — för fakturering och bokslut.
- **Myndigheter**: vid lagkrav (skattemyndighet, polis, domstol).

Vi säljer aldrig personuppgifter och delar dem aldrig för marknadsföring av
tredje part.

## 5. Överföring till tredje land

Vi strävar efter att hålla all behandling inom EU/EES. I de fall en
underleverantör behandlar uppgifter utanför EU/EES, sker det med stöd av:

- EU-kommissionens beslut om adekvat skyddsnivå (där sådant finns), eller
- Standardavtalsklausuler enligt EU-kommissionens beslut 2021/914.

Aktuella underleverantörer och eventuella överföringar listas i vår DPA samt
på begäran via **dpo@pacted.se**.

## 6. Säkerhet

Vi skyddar personuppgifter genom tekniska och organisatoriska åtgärder,
inklusive:

- TLS-kryptering i transport
- Kryptering vid lagring av känsliga uppgifter
- Tvåfaktorsautentisering för administratörsåtkomst
- Loggning och övervakning av säkerhetshändelser
- Begränsad åtkomst (need-to-know)
- Regelbundna säkerhetsuppdateringar och revisioner

## 7. Dina rättigheter

Du har följande rättigheter enligt GDPR:

- **Rätt till information** — om vilka uppgifter vi behandlar och hur.
- **Rätt till rättelse** — att få felaktiga uppgifter korrigerade.
- **Rätt till radering** ("rätten att bli bortglömd") — under vissa förutsättningar.
- **Rätt till begränsning** — av behandlingen.
- **Rätt till dataportabilitet** — att få dina uppgifter i ett vanligt format.
- **Rätt att invända** mot behandling som sker med stöd av berättigat intresse.
- **Rätt att återkalla samtycke** där behandlingen baseras på samtycke.

För att utöva dina rättigheter, kontakta **dpo@pacted.se**. Vi svarar inom 30
dagar.

Du har även rätt att lämna klagomål till **Integritetsskyddsmyndigheten (IMY)**
om du anser att vi behandlar dina uppgifter felaktigt: imy.se eller
**imy@imy.se**.

## 8. Ändringar av policyn

Vi kan komma att uppdatera denna policy. Den senaste versionen finns alltid
på pacted.se/integritetspolicy. Vid väsentliga ändringar informerar vi dig via
e-post om du har ett aktivt konto.

## 9. Kontakt

Pacted AB
**[POSTADRESS]**
**hej@pacted.se**
**dpo@pacted.se**
