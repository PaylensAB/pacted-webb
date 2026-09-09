# Komma igång med pact:ed — kundguide

Den här guiden beskriver hur ni som företagskund sätter upp pact:ed och börjar
använda tjänsten. Räkna 15–30 minuter beroende på hur ni vill leverera signerade
dokument till ert HR-system.

> Denna guide är skriven för en HR-chef, kontorschef eller IT-ansvarig som
> ska sätta upp tjänsten. Inga utvecklarkunskaper krävs.

## Innan ni börjar

Säkerställ att ni har:

- En e-postadress som ska vara administratör (rekommenderas: hr@erforetag.se eller en delad inkorg)
- Företagsuppgifter klara: namn, organisationsnummer, fakturaadress
- Ett kreditkort eller företagskort för månadsfakturering
- För integration mot HR-system: API-nyckel och tenant-id från CatalystOne (eller motsvarande), se sektion 4

## 1. Skapa konto (5 minuter)

Besök [pacted.se](https://pacted.se) och klicka på **"Prova nu"**. Ni går
igenom fem steg:

1. **Konto** — ange namn och e-postadress. Vi loggar in med engångslänkar via
   mejl, inga lösenord att hålla reda på.
2. **Företag** — företagsnamn, organisationsnummer, antal anställda, eventuellt
   HR-system. Antalet anställda avgör vilken prisplan vi föreslår.
3. **Plan** — välj Gratis (0 kr/år, 10 signaturer), Liten (299 kr/år, 500 signaturer), Mellan (699 kr/år, 2 000 signaturer) eller Stor (999 kr/år, 5 000 signaturer). Alla betalplaner inkluderar 14 dagars gratis testperiod.
4. **Betalning** — kortuppgifter sparas via Stripe. Ingen avgift dras under
   testperioden; ni får påminnelse innan första fakturan.
5. **Klart** — ett välkomstmejl med inloggningslänk skickas till er
   administratör.

När ni klickat klart får ni en **inloggningslänk** i mejlen. Klicka på den för
att aktivera kontot.

## 2. Skapa ert första dokument (2 minuter)

I admin-panelen klickar ni på **"Skapa nytt dokument"**.

1. **Välj en mall** ur listan — ni har 20 färdiga mallar för vanliga
   HR-situationer (utlämning av arbetskläder, IT-utrustning, sekretessavtal,
   GDPR-policy, personalhandbok m.fl.). Mallen fyller automatiskt i titel,
   typ och beskrivning. Ni kan redigera fritt om något behöver justeras.

2. Klicka **"Skapa dokument & QR-kod"**. En unik QR-kod genereras direkt.

3. **Ladda ner QR-koden** som PNG och skriv ut den. Sätt upp den på den plats
   där dokumentet ska signeras — vid receptionen, i omklädningsrummet, vid
   utlämningsdisken, eller hos respektive avdelningschef.

4. Den anställda scannar QR-koden med kameran på sin telefon (ingen app krävs),
   fyller i namn och anställningsnummer, ritar sin signatur, och bekräftar.

5. Den signerade PDF:en levereras automatiskt enligt er leveranskonfiguration
   (sektion 3 nedan). Den anställda får också en kopia till sin enhet.

Ni kan skapa hur många dokument som helst — det är ingen extra avgift per
dokument eller signatur. Alla planer inkluderar **obegränsat antal**.

## 3. Konfigurera leverans (10 minuter)

Det viktigaste valet i uppsättningen: **hur signerade dokument levereras till
er arkiveringslösning**. Vi sparar ingenting hos oss — så snart signering är
klar och leverans bekräftad raderas allt från våra servrar.

Vi erbjuder fyra leveransmetoder:

### Alternativ A: E-postleverans (enklast)

Lämpligt för: små och medelstora företag, eller företag vars HR-system inte
har API.

1. I admin-panelen, gå till **Inställningar → Leverans**.
2. Välj **"E-post"**.
3. Ange den e-postadress som ska ta emot alla signerade PDF:er. Vanliga val:
   - En generisk HR-inkorg (hr@erforetag.se)
   - Direkt till en personalakts-mailbox i ert HR-system
   - En arkivtjänst (t.ex. Adobe Document Cloud, Box, Sharepoint via mejl)
4. Klicka **"Testa leverans"** — vi skickar ett test-PDF så ni kan verifiera
   att det landar rätt.
5. Spara.

**Klar.** Alla framtida signaturer kommer att mejlas till denna adress.

### Alternativ B: CatalystOne direktintegration (rekommenderas för storkunder)

Lämpligt för: kunder som redan använder CatalystOne och vill att dokument ska
hamna direkt i respektive anställds dokumentarkiv.

**Förberedelser ni gör i CatalystOne:**

1. Logga in i ert CatalystOne med en användare som har administratörsrättigheter.
2. Gå till **Settings → Integrations → API access**.
3. Skapa en ny **API-nyckel** för pact:ed. Ge den behörigheten "Upload documents to employee records".
4. Notera följande tre värden:
   - **API base URL** (oftast `https://<er-tenant>.catalystone.com/api/v1`)
   - **Tenant ID** (er CatalystOne-instans-id, t.ex. `acme-corp`)
   - **API-nyckel** (en lång hemlig sträng — behandla som ett lösenord)

**Konfigurera i pact:ed:**

1. I admin-panelen, **Inställningar → Leverans → CatalystOne**.
2. Klistra in de tre värdena ovan.
3. **Matchningsregel:** välj vilket fält i CatalystOne som matchar mot
   "anställningsnummer" som den anställda skriver in när hen signerar:
   - **Anställningsnummer** (vanligast — om ni använder samma nummer i
     CatalystOne som i lönesystemet)
   - **Externt ID** (om ni har ett separat ID-system)
   - **E-post** (om ni låter anställda fylla i e-post istället för
     anställningsnummer — kräver att vi konfigurerar fältet i pact:ed)
4. Klicka **"Testa anslutning"** — vi gör ett test-API-anrop mot CatalystOne
   för att verifiera att credentials funkar.
5. Spara.

**Vad händer vid varje signering:** pact:ed slår upp den anställdas record i
CatalystOne via det valda fältet, laddar upp PDF:en till hens
dokumentarkiv med rätt kategori, och raderar sedan dokumentet hos oss.

### Alternativ C: Webhook till egen mottagare

Lämpligt för: kunder som vill ta emot signerade dokument i ett eget system
eller automatisera vidare.

1. Sätt upp en HTTPS-endpoint hos er som accepterar `POST` med
   `multipart/form-data`.
2. I pact:ed, välj **"Webhook"** som leveransmetod.
3. Ange er URL och ett **delat hemligt värde** (för verifiering — vi skickar
   det i `X-Pacted-Secret`-headern).
4. Testa.

**Format vi skickar:**
```
signerName: "Anna Andersson"
signerEmpno: "12345"
signedAt: "2026-05-11T14:32:00.000Z"
documentTitle: "Kvittens — IT-utrustning"
pdf: <binary PDF file>
```

### Alternativ D: SFTP (kommer i Q3 2026)

Vi planerar SFTP-leverans för kunder som föredrar fildrop. Hör av er om ni
behöver detta tidigare — vi kan prioritera baserat på efterfrågan.

### Vilka HR-system fungerar med pact:ed?

- **CatalystOne** — direktintegration (Alternativ B)
- **Visma Lön, Hogia, Fortnox, Personalkollen** — använd e-postleverans (Alternativ A)
  till respektive systems dokumentinbox, eller webhook (Alternativ C) om
  ni har en automation
- **Egen lösning** — använd webhook (Alternativ C) eller e-post (Alternativ A)

Vi bygger ut direktintegrationer mot fler system löpande baserat på vad våra
kunder ber om.

## 4. Personifiera dokumenten med er logotyp (5 minuter)

Endast tillgängligt på **Mellan**-planen eller högre.

1. **Inställningar → Branding**.
2. Ladda upp er logotyp (PNG eller SVG, transparent bakgrund rekommenderas).
3. Välj en primärfärg (HEX-kod, t.ex. `#0d7077`).
4. Förhandsgranska hur de signerade PDF:erna kommer se ut.
5. Spara.

Framtida dokument kommer att genereras med er branding i toppen och en
"Genererat av pact:ed för [Företaget]" i fotsidan. Audit trail-sidan är
oförändrad.

## 5. Bjud in fler administratörer (2 minuter)

Endast tillgängligt på **Mellan**-planen eller högre. Liten-planen har en
administratör.

1. **Inställningar → Användare → Bjud in administratör**.
2. Ange e-postadress.
3. Välj roll:
   - **OWNER** — kan hantera fakturering, ändra plan, avsluta prenumeration.
     Bara en owner per konto.
   - **ADMIN** — kan skapa dokument, se signaturer, ändra leveranskonfig.
   - **VIEWER** — kan bara läsa signatur­historik, inte ändra något.
4. Spara. Vi skickar inloggningslänk till den nya administratören.

## 6. Test-rulle ut för era anställda

Innan ni rullar ut brett rekommenderar vi:

1. **Pilottest med 3–5 anställda.** Skapa ett dokument, sätt upp QR-koden,
   låt fem kollegor scanna och signera. Verifiera att leveransen kommer
   rätt och att de signerade PDF:erna ser bra ut.
2. **Använd en specifik dokumenttyp först.** Säg "utlämning av arbetskläder"
   — det är konkret, alla förstår, och ni har en tydlig kontroll på flödet.
3. **Skicka korta instruktioner till de anställda:** "Scanna QR-koden vid X,
   fyll i namn och anställningsnummer, rita din signatur." Det är allt.

När pilottestet känns bra, rulla ut bredare.

## 7. Vad de anställda upplever

För den anställda är pact:ed osynligt — det finns ingen app, inget konto,
inget krångel. Hen:

1. Scannar QR-koden med kameran på sin telefon
2. Får upp en webbsida på sin telefon med dokumentinformation
3. Fyller i namn och anställningsnummer
4. Ritar sin signatur med fingret
5. Klickar "Signera och skicka"
6. Får en bekräftelse + sin egen kopia som PDF nedladdad

Hela flödet tar 30–60 sekunder.

## 8. Säkerhet och GDPR

pact:ed är byggt på en **transient relay-arkitektur**. Det betyder:

- **Vi sparar inga signerade dokument långsiktigt.** Maximal lagringstid hos
  oss är 48 timmar (för att hantera tillfälliga fel i HR-systemet).
- **Vi sparar inga personuppgifter efter leverans.** Endast anonym metadata
  (dokument-id, tidsstämpel, kund-id) sparas för fakturering.
- **Vi är personuppgiftsbiträde**, ni är personuppgiftsansvarig. Vid
  registrering signerar ni vårt **DPA (personuppgiftsbiträdesavtal)**.
- **Säkerhet:** TLS 1.2+, AES-256-kryptering i vila, tvåfaktorsautentisering
  för administratörer, audit trail per åtkomst.

Detaljerad teknisk säkerhetsbeskrivning finns på [pacted.se/sakerhet](https://pacted.se/sakerhet).

## 9. Fakturering och betalning

- **Månadsvis i förskott** via det kort ni angav vid signup.
- **14 dagar gratis** vid första registreringen, sedan årsvis löpande.
- Faktura skickas via e-post varje månad med specificerade uppgifter (kan
  bokföras direkt i Bokio, Fortnox, Visma m.fl.).
- **Säg upp** närsomhelst via **Konto → Avsluta prenumeration**.
  Pengarna återbetalas inte men ni har tillgång till slutet av perioden.
- Frågor om fakturor: **billing@pacted.se** (svar inom en arbetsdag).

## 10. Support

- **Allmänna frågor:** hej@pacted.se
- **Tekniska frågor:** support@pacted.se
- **Säkerhet/incidenter:** security@pacted.se (kryptering med PGP rekommenderas — nyckel på pacted.se/security)
- **Försäljning:** sales@pacted.se

**Svarstider:** pact:ed har medvetet **ingen SLA eller garanterad svarstid** — det är en del av vad som gör tjänsten så billig. Vi svarar oftast inom 1–3 arbetsdagar oavsett vilken plan ni har. Säkerhetsincidenter behandlas snabbare (inom 24 h). Om garanterade svarstider är kritiska för er rekommenderar vi DocuSign eller Scrive istället. Se [supportpolicy](juridik/supportpolicy.md) för detaljer.

## 11. Vad ni inte ska använda pact:ed för

Tjänsten är medvetet smal i sitt scope. Vi är **bra** för:

- Kvittenser och mottagningsbevis
- Policybekräftelser
- Genomgångar (brandsäkerhet, IT-säkerhet, GDPR m.fl.)
- Enklare överenskommelser där en signatur räcker

Vi är **inte** rätt verktyg för:

- Anställningsavtal (kräver oftast BankID-signering)
- Hyreskontrakt, försäljningsavtal med högt värde
- Avtal som kräver vittnen
- Dokument där lag specifikt kräver kvalificerad elektronisk signatur (QES)

För sådana dokument rekommenderar vi DocuSign, Scrive eller en annan tjänst
som stöder BankID.

## 12. Avancerat: API och egen integration

Roadmap (Q3 2026): vi planerar att öppna ett **publikt API** så att kunder
kan integrera pact:ed med egna system:

- Skapa dokument programmatiskt
- Hämta signatur-events (anonym metadata) via webhook
- Bulk-skapa anställdregister för automatisk fält-matchning

Hör av er till hej@pacted.se om ni har specifika behov nu — vi kan ta era
användarfall i beaktande när vi designar API:et.

## Frågor och svar

**Vad händer om en anställd skriver fel anställningsnummer?**
PDF:en signeras ändå med det inmatade värdet. Vid CatalystOne-integration
försöker vi slå upp anställningsrecord; om vi inte hittar matchning markeras
leveransen som misslyckad och ni får en notis till admin-mejlen. Ni kan
manuellt vidarebefordra PDF:en eller be den anställda signera igen.

**Kan en QR-kod missbrukas av någon utomstående?**
Tekniskt sett ja — vem som helst med koden kan signera. Det är därför vi
rekommenderar att ni sätter upp QR-koden vid en kontrollerad plats (t.ex.
mottagningsdisken). För högre säkerhet kan ni i framtiden begränsa till
SMS-OTP eller integrera med ert HR-systems anställdsregister.

**Vad händer vid leveransproblem?**
Om CatalystOne är nere eller mejl studsar, behåller vi dokumentet i max 48
timmar och försöker leverera regelbundet. Efter 48 timmar raderas allt.
Misslyckas leverans helt får er admin en notis och kan agera (t.ex. be om
omsignering).

**Kan vi exportera all signatur­historik?**
Ja. Under **Inställningar → Export** kan ni ladda ner all anonym metadata
för era signaturer i CSV- eller JSON-format. Detta är användbart vid revision.

**Vad sker om vi avslutar prenumerationen?**
Era dokument (mall-definitionerna) sparas i 30 dagar för att enkelt
återaktivera om ni ångrar er. Sedan raderas allt utom anonym
fakturerings­metadata (som krävs av bokföringslagen i 7 år).
