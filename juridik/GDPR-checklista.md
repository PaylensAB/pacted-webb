# GDPR-checklista — Pacted AB

Checklista över vad du behöver ha på plats innan du tar emot din första
betalande kund. Tänkt som en intern arbetslista, inte ett externt dokument.

## Dokument

- [ ] **Användarvillkor (B2B)** — granskade av jurist, publicerade på pacted.se
- [ ] **Användarvillkor (privat)** — för köpekvitto-tjänsten
- [ ] **Integritetspolicy** — granskad, publicerad
- [ ] **Cookiepolicy** — granskad, publicerad
- [ ] **Personuppgiftsbiträdesavtal (DPA)** — mall klar att skicka till nya kunder
- [ ] **Säkerhetsbeskrivning** — referensdokument för kundens IT-säkerhetschefer

## Registrering och formalia

- [ ] **Aktiebolaget registrerat** hos Bolagsverket (klart enligt dig)
- [ ] **F-skatt** ansökt och godkänd
- [ ] **Momsregistrering** — om omsättning > 80 000 kr/år eller om du registrerar dig frivilligt
- [ ] **Bankkonto** för företaget öppnat
- [ ] **Bokföringssystem** valt (Bokio, Fortnox, Visma m.fl.)
- [ ] **Företagsförsäkring** med ansvarsskydd och cyber-försäkring
- [ ] **Varumärkesansökan inlämnad** hos PRV (klass 9 + 42)
- [ ] **Domännamn registrerat** (.se primärt, .com som backup)

## Internt — informationssäkerhet

- [ ] **Informationssäkerhetspolicy** (intern) — beskriver rutiner, ansvar, klassificering
- [ ] **Datalagrings­policy** — vad sparas, hur länge, hur raderas
- [ ] **Incidentplan** — vad gör man vid säkerhetsincident
- [ ] **Behörighetsmatris** — vem har åtkomst till vad
- [ ] **Loggrutiner** — vad loggas, hur länge, vem läser
- [ ] **Backup-rutiner** — frekvens, plats, återställningstest

## GDPR-specifika åtaganden

- [ ] **Registerförteckning** enligt GDPR art. 30 — internt dokument över alla personuppgifts­behandlingar
- [ ] **Konsekvensbedömning** (DPIA) — gjord för signering och köpekvitto-tjänsten?
- [ ] **Rutin för registrerades rättigheter** — hur svarar du på begäran om information, radering m.fl. inom 30 dagar?
- [ ] **Rutin för incidentanmälan** till IMY (72-timmars deadline)
- [ ] **DPA undertecknad med varje underleverantör** — hosting, e-post, betalning, bokföring
- [ ] **Standardavtalsklausuler (SCC)** för USA-överföringar (Stripe m.fl.)
- [ ] **Dataskyddsombud (DPO)** utsedd — krävs vid storskalig systematisk övervakning eller hantering av särskilda kategorier; inte krav för pact:ed men kan vara klokt att utse en kontaktperson

## Tekniskt — innan lansering

- [ ] **TLS-certifikat** (Let's Encrypt eller liknande) installerat
- [ ] **Säkerhets­headers** konfigurerade (CSP, HSTS, X-Frame-Options)
- [ ] **Dependency scanning** aktiverat i CI/CD
- [ ] **Penetrationstest** genomfört (externt, oberoende)
- [ ] **Tvåfaktorsautentisering** för administratörer
- [ ] **Loggning** uppsatt med larm vid avvikelser
- [ ] **Backup** automatiskt och testad
- [ ] **Monitoring** (uptime, latens, fel) konfigurerad

## Lansering

- [ ] **Pricing** publicerat på hemsidan
- [ ] **Stripe Subscriptions** uppsatt med tre årsprodukter (299 / 699 / 999 kr/år)
- [ ] **Faktureringsadress** och momshantering konfigurerad
- [ ] **Support-flöde** definierat (e-post primärt, chatbot om resurser finns)
- [ ] **SLA** för Mellan/Stor-abonnemang formulerad

## Efter lansering — pågående

- [ ] **Säkerhetsuppdateringar** inom 72 h efter publicering
- [ ] **Granska underleverantörer** årligen
- [ ] **Förnya varumärket** efter 10 år (påminnelse)
- [ ] **Penetrationstest** årligen
- [ ] **GDPR-utbildning** för personalen årligen
- [ ] **Användarvillkor och integritetspolicy** — granska årligen, uppdatera vid behov

## Vid första kund

- [ ] **DPA undertecknat** av kund och pact:ed
- [ ] **Onboarding-möte** för att gå igenom integration
- [ ] **Kontaktperson** för support och säkerhet utbytt
- [ ] **Test-period** i 30 dagar
- [ ] **Faktura skickad** efter testperiod

## Råd och resurser

**Jurist:** För granskning av juridiska dokument, räkna med 8–15 000 kr för
första genomgången. Kan göras i schablon med rådgivning per timme. Sök på
"affärsjurist SaaS" eller "datasäkerhetsjurist Stockholm".

**IMY (tillsynsmyndighet):** [imy.se](https://imy.se) — bra resurser och
vägledningar för små företag. De har en specifik guide för SaaS-företag.

**SBC (Stockholms Företagsråd):** Erbjuder gratis rådgivning för småföretag i
Stockholm.

**ALMI:** Kan ha gratis rådgivning och ibland mikrolån för verksamhetsutveckling.

**Företagarna:** Medlemskap ger tillgång till mall-jurister och konsult­tjänster.
Kostar ungefär 4 000 kr/år men kan löna sig.
