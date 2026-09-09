# Säkerhetsbeskrivning — pact:ed

Detta dokument beskriver pact:eds tekniska och organisatoriska säkerhets­åtgärder. Tänkt som referens vid kundens säkerhets­granskning, för upphandling och som komplement till DPA:n.

> **Status:** Detta är en målbild för en lanserad tjänst. Markera tydligt i externa versioner vilka åtgärder som är på plats idag och vilka som är på roadmap.

## Snabb översikt

| Aspekt | Status |
|---|---|
| Hosting inom EU | Ja |
| TLS 1.2+ för all trafik | Ja |
| Kryptering i vila (AES-256) | Ja |
| Tvåfaktorsautentisering för admins | Ja |
| Loggning och övervakning | Ja |
| Automatisk radering efter leverans | Ja |
| ISO 27001 / SOC 2 | Roadmap |
| Penetrationstest | Årligen |

## 1. Arkitektur

pact:ed är byggt på en transient relay-modell:

1. Dokumentet skapas i pact:eds system av kundens administratör.
2. Den anställda signerar via QR-kod på sin telefon.
3. Den signerade PDF:en levereras till kundens HR-system, e-postadress eller SFTP.
4. Personuppgifter raderas automatiskt från pact:eds produktionsmiljö efter bekräftad leverans.
5. Endast anonymiserad metadata (dokument-id, kund-id, tidsstämpel) behålls för fakturering.

Maximal lagringstid för personuppgifter är **48 timmar** från signering, eller **30 dagar** vid leveransfel.

## 2. Hosting och infrastruktur

| | |
|---|---|
| Cloud-leverantör | [HOSTING-LEVERANTÖR] |
| Datacenter | EU (Frankfurt eller Stockholm) |
| Backup | Daglig, krypterad, retention 30 dagar |
| Återställning (DR) | RTO: 4 h, RPO: 24 h |

## 3. Nätverkssäkerhet

- TLS 1.2+ med strikt cipher suite (TLS 1.3 där möjligt)
- HSTS aktiverat med preload
- WAF (Web Application Firewall) framför applikationen
- DDoS-skydd via hosting-leverantör
- Säkerhets­headers: CSP, X-Frame-Options, X-Content-Type-Options m.fl.

## 4. Applikationssäkerhet

- Webbprogrammet följer **OWASP Top 10**-rekommendationer
- Regelbunden statisk analys (SAST) och dependency scanning
- Inga inloggnings­uppgifter eller hemligheter i källkoden — secrets via vault
- CSRF-skydd, input validation, output encoding
- Regelbunden uppdatering av tredjepartspaket; kritiska sårbarheter åtgärdas inom 72 h

## 5. Identitet och åtkomst

**Administratörer (kund):**
- Inloggning via e-post + lösenord eller magic link
- Tvåfaktorsautentisering (TOTP) tillgängligt och rekommenderat
- Lösenordskrav: minst 12 tecken, hash via bcrypt eller argon2id
- Sessionstid 12 timmar med automatisk avlogg

**Personal (pact:ed):**
- Tvåfaktorsautentisering obligatorisk
- Behörighet enligt *least privilege* — endast nödvändig åtkomst
- Loggning av alla administrativa åtgärder
- Bakgrunds­kontroll vid anställning av personer med produktionsåtkomst

## 6. Dataskydd

**I transport:** TLS 1.2+ för all data mellan klient, server och underleverantörer.

**I vila:**
- Databas: AES-256-kryptering på diskvolymer
- Backup: AES-256-kryptering före lagring
- Filer (signerade PDF:er under leverans): krypterade i temporärt object storage

**I användning:** Personuppgifter behandlas i minne under bearbetning och raderas omedelbart efter leverans.

## 7. Loggning och övervakning

- Säkerhetsloggar (autentiserings­händelser, behörighetsändringar, åtkomst till känsliga endpoints) lagras i 12 månader
- Applikationsloggar (felmeddelanden, prestanda) lagras 30 dagar
- Larm vid avvikande beteende (failed logins, ovanliga åtkomstmönster)
- Loggar är skrivskyddade — kan inte ändras eller raderas av personal

Loggar innehåller inte personuppgifter där det kan undvikas. Där sådana ändå förekommer (t.ex. e-postadress vid inloggningsfel) anonymiseras de efter 90 dagar.

## 8. Incidenthantering

| Steg | Åtgärd | Tid |
|---|---|---|
| 1. Upptäckt | Larm via övervakning eller manuell rapport | — |
| 2. Bedömning | Klassificera allvarlighetsgrad och påverkan | < 4 h |
| 3. Inneslutning | Begränsa skadan, stäng av påverkade system om nödvändigt | < 24 h |
| 4. Notifiering | Informera berörda kunder | < 24 h |
| 5. Åtgärd | Lös rotorsaken, återställ drift | enligt allvar |
| 6. Eftergranskning | Post-mortem, dokumentation, förbättringsåtgärder | inom 30 dagar |

Vid personuppgiftsincident följer vi GDPR art. 33–34: anmälan till IMY inom 72 timmar och information till berörda registrerade om hög risk föreligger.

## 9. Underleverantörer

pact:ed anlitar följande underleverantörer som kan komma i kontakt med kunddata:

| Leverantör | Tjänst | Plats |
|---|---|---|
| [HOSTING] | Hosting och databas | EU |
| [E-POST] | E-postleverans | EU |
| Stripe | Betalningar | EU/USA (SCC) |
| [BOKFÖRING] | Bokföring | EU |

Alla underleverantörer har påtecknat DPA med pact:ed och är granskade för säkerhetsefterlevnad.

## 10. Personalsäkerhet

- Tystnadspliktsförklaring vid anställning
- Säkerhetsutbildning vid onboarding och årligen
- Återlämning av all utrustning och åtkomst vid avslut
- Bakgrunds­kontroll för roller med produktionsåtkomst

## 11. Tester och granskning

| Aktivitet | Frekvens |
|---|---|
| Penetrationstest (extern) | Årligen |
| Intern säkerhetsgranskning | Kvartalsvis |
| Återställningstest av backup | Kvartalsvis |
| Genomgång av användarrättigheter | Halvårsvis |
| Underleverantörsöversyn | Årligen |

## 12. Certifieringar och standarder

**Roadmap:**
- ISO 27001 — målår 20XX
- SOC 2 Type II — målår 20XX

Tills certifieringar är på plats refererar pact:ed till denna säkerhets­beskrivning, vår DPA och vår transient-arkitektur som grund för säkerhets­bedömning.

## 13. Kontakt

Säkerhetsfrågor och rapportering av sårbarheter:
**security@pacted.se** · PGP-nyckel finns på pacted.se/security
