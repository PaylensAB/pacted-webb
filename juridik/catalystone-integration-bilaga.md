# Teknisk bilaga — CatalystOne-integration

**Bilaga till huvudavtalet mellan Kunden och Pacted AB**

Detta dokument reglerar den tekniska integrationen mellan Kundens
CatalystOne-instans och pact:ed-tjänsten. Bilagan ska undertecknas av båda
parter innan integration aktiveras.

> **VIKTIGT:** Detta är ett första utkast. Granska med jurist innan
> publicering. Formuleringar bör spegla faktiska tekniska detaljer i
> CatalystOnes API.

## 1. Syfte

Integration möjliggör att signerade dokument från pact:ed automatiskt laddas
upp till respektive anställds dokumentarkiv i CatalystOne, utan manuell
hantering.

## 2. Teknisk omfattning

Pacted gör följande API-anrop mot Kundens CatalystOne-instans:

| Endpoint | Metod | Syfte |
|---|---|---|
| `/api/v1/whoami` | GET | Verifiera credentials vid uppsättning och periodiskt |
| `/api/v1/employees?<field>=<value>` | GET | Slå upp employee record baserat på matchningsfält |
| `/api/v1/employees/{id}/documents` | POST | Ladda upp signerad PDF |

Inga andra anrop görs. Vi läser inte ut anställdas personuppgifter, vi
skriver bara dokument till befintliga records.

## 3. Behörigheter som krävs

Den API-användare som Kunden skapar i CatalystOne för pact:ed behöver:

- **Read** på `employees`-endpointen (för att hitta record baserat på matchningsfält)
- **Write** på `employees/{id}/documents`-endpointen (för att ladda upp dokument)
- **Inget annat**

Vi rekommenderar att Kunden skapar en dedikerad API-användare ("pact:ed
integration") snarare än använder en personlig administratörsanvändare.
Det gör det enkelt att återkalla åtkomst om relationen avslutas.

## 4. Matchningsregel

Kunden anger ett av följande matchningsfält vid uppsättning:

| Värde | Beskrivning |
|---|---|
| `employeeNumber` | Anställningsnummer enligt CatalystOne (vanligast) |
| `externalId` | Externt ID-fält enligt CatalystOne |
| `email` | Anställdas e-postadress |

Den anställda matar in detta värde vid signering på pact:ed. Vi matchar mot
CatalystOne via det valda fältet och laddar upp dokumentet till matchande record.

**Vid mismatch:**
- Om ingen matchning hittas markeras leveransen som misslyckad
- Kundens admin får automatiskt en notis via e-post
- PDF:en lagras max 48h hos pact:ed (transient retention) och kan
  vidarebefordras manuellt eller signeras om

## 5. Dokumentkategorisering

Pacted mappar dokumenttyper till CatalystOnes kategori-system enligt:

| Pact:ed-typ | CatalystOne-kategori |
|---|---|
| Utlämning av utrustning | EQUIPMENT_RECEIPT |
| Policybekräftelse | POLICY_ACKNOWLEDGMENT |
| Mottagningsbevis | HR_DOCUMENT |
| Kontroll (körkort m.fl.) | COMPLIANCE_CHECK |
| Övrigt | OTHER |

Om Kunden använder anpassade kategorier i CatalystOne kan vi konfigurera
mappningen — anges i bilagans bilaga A nedan eller via separat
överenskommelse.

## 6. Säkerhet

**API-nycklar:**
- Kundens CatalystOne API-nyckel lagras krypterat i pact:ed-databasen
  (AES-256-GCM, master key i Vercel Secret Manager)
- Nyckeln transmitteras alltid över TLS 1.2+
- Nyckeln återanvänds aldrig till andra ändamål än CatalystOne-integration

**Loggning:**
- Vi loggar API-anrop med Kundens tenant-id, employee-id, status och
  tidsstämpel
- Vi loggar **aldrig** API-nyckeln eller dokument­innehåll
- Loggar lagras i 12 månader för felsökning, sedan anonymiseras

## 7. Felhantering och retry-logik

| Fel | Hantering |
|---|---|
| Anställd hittas inte | Markera misslyckad, notisera admin, behåll PDF i 48h |
| API returnerar 401 (auth) | Stoppa alla anrop, notisera admin om förnyad nyckel |
| API returnerar 5xx (server) | Retry med exponentiell backoff: 1s, 5s, 30s, 5m, 30m, 4h |
| API timeout (>30s) | Räknas som 5xx |
| Nätverksfel | Räknas som 5xx |
| API returnerar 4xx (klient­fel utöver auth) | Notisera admin, ingen retry |

Maximalt 12 retry-försök över 48 timmar. Efter det raderas PDF:en hos oss.

## 8. Hastighetsbegränsning

För att inte överbelasta Kundens CatalystOne-instans:

- Max 10 samtidiga API-anrop per Kund
- Max 100 anrop per minut per Kund
- Vid kö-uppbyggnad försenas övrig leverans men ingenting tappas bort

Vid normal användning märks ingen begränsning.

## 9. Tester och övervakning

**Vid uppsättning:**
- Vi gör ett test-anrop mot `/whoami` och verifierar att svaret innehåller
  förväntad tenant-information
- Vi visar resultatet i pact:ed admin-panel innan Kunden sparar
- Kunden uppmanas att sedan göra ett test-signering med en känd anställd

**Löpande:**
- Vi gör en hälsokontroll mot `/whoami` en gång per dygn för aktiva
  CatalystOne-integrationer
- Vid misslyckanden notiseras Kundens admin
- Statussidan (status.pacted.se) visar aggregerad integrationsstatus

## 10. Kundens ansvar

Kunden förbinder sig att:

(a) säkerställa att API-användaren i CatalystOne har de minsta behörigheter
som krävs (sektion 3) och inte mer;

(b) rotera API-nyckeln årligen och uppdatera den i pact:ed admin-panel;

(c) omedelbart återkalla nyckeln om misstanke om kompromettering uppstår;

(d) säkerställa att anställningsnummer-fältet (eller annat matchningsfält)
är korrekt ifyllt i CatalystOne för alla anställda som ska kunna signera;

(e) underrätta pact:ed minst 30 dagar i förväg vid uppgradering eller
migration av CatalystOne-instansen som påverkar API:et.

## 11. Pact:ed ansvar

Pacted förbinder sig att:

(a) lagra Kundens API-nyckel krypterat och inte använda den till annat än
överenskommen integration;

(b) följa CatalystOnes hastighets­begränsningar och API-villkor;

(c) underrätta Kunden inom 24 timmar vid säkerhetsincident som kan ha
påverkat integrationen;

(d) anpassa pact:ed-integrationen vid mindre brytande förändringar i
CatalystOnes API (inom 30 dagar);

(e) erbjuda manuell vidarebefordran av icke-levererade dokument vid behov.

## 12. Avtalets upphörande

Vid uppsägning av huvudavtalet:

- Pacted slutar göra anrop mot CatalystOne omedelbart vid avtalets slut
- Pacted raderar API-nyckeln från sin databas inom 7 dagar
- Eventuella icke-levererade dokument vidarebefordras till Kundens admin-mejl
- Pacted skickar en bekräftelse på radering till Kunden

## 13. Bilaga A — Kundspecifik konfiguration

(Fylls i vid uppsättning)

```
CatalystOne base URL:    _________________________________
Kundens tenant-id:       _________________________________
Matchningsfält:          [ ] employeeNumber  [ ] externalId  [ ] email
Anpassade kategorier:    _________________________________
                         _________________________________
Kontaktperson hos kund:  _________________________________
Kontaktperson hos pact:ed: ______________________________
Aktiverat datum:         _________________________________
```

## 14. Underskrifter

| Kunden | Pacted AB |
|---|---|
| Underskrift: ______________ | Underskrift: ______________ |
| Namn: | Namn: |
| Roll: | Roll: |
| Datum: | Datum: |
