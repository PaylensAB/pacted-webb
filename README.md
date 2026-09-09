# pact:ed — komplett paket

En testbar prototyp plus de byggstenar som behövs för att lansera tjänsten:
marknadsföringssida, juridiska dokument och namnanalys. Allt på ett ställe så
det är lätt att få överblick.

## Viktigt först — namn och branding

Det valda namnet är **pact:ed** (stylized) / **Pact** (legalentitet) / `pacted.se`
(domän). Visuellt visas det med kolon, juridiskt och i URL:er utan. Se
`namnanalys.md` för bakgrunden till valet och `STATUS.md` för aktuell status.

## Filöversikt

| Fil | Vad det är |
|---|---|
| `landing.html` | **Marknadsföringssidan** — hero, hur det funkar, priser, FAQ. Det här är den hemsida du kan publicera. |
| `index.html` | Admin-dashboard för arbetsgivaren (skapa dokument, generera QR, se signaturer). Prototyp. |
| `sign.html` | Publik signeringssida som öppnas via QR-kod. Mobiloptimerad. Prototyp. |
| `kvitto.html` | **Gratis köpekvitto** för privatpersoner. Två parter signerar, båda får PDF. |
| `namnanalys.md` | Analys av dina föreslagna namn + alternativ + varumärkesstrategi |
| `juridik/anvandarvillkor.md` | Användarvillkor (B2B) — utkast för jurist |
| `juridik/anvandarvillkor-privat.md` | Användarvillkor för köpekvitto-tjänsten |
| `juridik/integritetspolicy.md` | Integritetspolicy (GDPR) |
| `juridik/personuppgiftsbitradesavtal.md` | DPA — det avtal kunder undertecknar med dig |
| `juridik/cookiepolicy.md` | Cookiepolicy |
| `juridik/sakerhetsbeskrivning.md` | Säkerhetsbeskrivning — referens för kunders IT-säkerhetsansvariga |
| `juridik/GDPR-checklista.md` | Intern arbetslista för vad du behöver innan lansering |

## Snabbstart

Öppna `landing.html` i din webbläsare för att se den färdiga hemsidan, och
`index.html` för att testa admin/signaturflödet.

För kvitto-flödet, öppna `kvitto.html` direkt — du behöver inget annat. Fyll
i vad du säljer, signera som säljare, signera som köpare, och en PDF laddas
ner.

## Den arkitektur du valde — och varför den är smart

Du tog ett bra strategiskt beslut när du sa att pact:ed **inte ska lagra**
signerade dokument långsiktigt. Den modellen — där dokumentet skapas, signeras
och vidarebefordras direkt till kunden, varefter det raderas — kallas en
**transient relay**. Det ger dig flera fördelar:

**Minskat juridiskt ansvar.** Du har inte tusentals signerade dokument att
ansvara för i händelse av dataintrång. Det enda du har är anonym metadata.
Det gör din DPA mycket enklare att skriva och din försäkring billigare.

**Mindre GDPR-skop.** Eftersom personuppgifter passerar genom dig under
maximalt 48 timmar är retention-frågan i princip löst, och rätten att bli
glömd är automatisk.

**Säljargument.** "Vi lagrar inte era dokument" är en stark
positionering mot konkurrenter som faktiskt arkiverar allt. Använd det aktivt
i marknadsföring och säljmöten.

**Lägre driftskostnader.** Lagring kostar pengar; mindre lagring = lägre
moln-räkning. Du tjänar pengar på prenumeration, inte på utrymme.

Se `juridik/sakerhetsbeskrivning.md` och `juridik/personuppgiftsbitradesavtal.md`
för formuleringar som speglar denna modell.

## Steg för steg från prototyp till säljbar tjänst

Detta är en grov roadmap. Beroende på resurser landar tidsåtgången på 6–12
veckor om en utvecklare jobbar fokuserat, eller 3–4 månader vid sidan om
annat arbete.

### Vecka 1–2: Foundation

Du har redan AB:t. Komplettera med:

1. Välj namn (se `namnanalys.md`) och köp domän (loopia.se eller one.com)
2. Lämna in varumärkesansökan hos PRV (klass 9 + 42, ca 2 400 kr)
3. Sätt upp e-post (Google Workspace eller proton.me, från ca 60 kr/månad)
4. Bokföringssystem (Bokio är gratis upp till en viss volym, sedan ca 200 kr/månad)
5. Företagsförsäkring med ansvarsskydd och cyber (kontakta Trygg-Hansa eller If)
6. Skicka utkasten i `juridik/` till en affärsjurist för granskning (8–15 000 kr för en första pass)

### Vecka 3–6: Backend

Frontend-prototypen funkar redan — nu ska den koppla mot riktig server.
Tekniska val jag rekommenderar:

- **Frontend:** Next.js på Vercel (gratis tier räcker länge)
- **Backend:** Node.js (samma Next.js-projekt) eller separat Express-server
- **Databas:** Postgres på Supabase eller Neon (gratis tier räcker länge)
- **Filhantering:** Tillfällig lagring i S3 eller Supabase Storage, raderas efter leverans
- **Inloggning:** Magic link via Resend (gratis tier räcker länge)
- **Betalning:** Stripe Subscriptions (1.4% + 1.80 kr per transaktion)

Funktioner att bygga in:
- Multi-tenant data — varje kund har sina egna dokument
- Magic link-inloggning för administratör
- Mallhantering (samma 20 mallar som finns i prototypen)
- Leverans till HR-system (e-post primärt, CatalystOne API andra hand)
- Stripe-koppling med tre prisplaner
- Audit log för fakturering

### Vecka 7–8: Polering och tester

- Penetrationstest av webbtjänst (5–15 000 kr externt)
- Belastningstest
- Inkjet GDPR-checklistan (`juridik/GDPR-checklista.md`)
- Skriva supportartiklar / hjälpcenter

### Vecka 9–10: Första kunden

Det här är den viktigaste fasen. Hitta en kund som testar tjänsten gratis i en
månad. Förslagsvis:

- Din nuvarande arbetsgivare (om relevant)
- Någon i ditt nätverk som är HR-chef
- Ett mellanstort företag du har kontakt med via LinkedIn

Be om feedback, citat och tillåtelse att använda dem som referens. När det
funkar bra för dem, börja ta betalt.

### Vecka 11+: Skalning

- Lägg in tjänsten på en jämförelsesajt (HR-tech, capterra)
- Skriv blogginlägg om GDPR och digital signering (SEO)
- Bygg out CatalystOne API-integration på riktigt (om kunder ber om det)
- Bygg fler integrationer (Visma, Hogia, Fortnox)
- Eventuellt bygg ut SSO för Stor-paketet

## Tekniska detaljer för prototypen

### Funktioner

`landing.html`, `kvitto.html`, `sign.html` är fristående och fungerar utan
backend. `index.html` använder browserns localStorage som "databas" — det
betyder att data du skapar i admin-vyn bara finns i din egen webbläsare.

### Bibliotek (CDN)

- **Tailwind CSS** för styling
- **pdf-lib** för PDF-generering helt i webbläsaren
- **qrcode** (soldair) för QR-kod-rendering i admin

Signature pad är en egen implementering inline (~80 rader JavaScript) — ingen
extern dependency krävs.

### Driftsättning

För att rulla ut prototypen så att riktiga kunder kan testa:

1. Skapa konto på Vercel eller Netlify (gratis)
2. Dra HTML-filerna till deras drag-and-drop-uploader
3. Få en URL som `signa.vercel.app`
4. Sätt **Bas-URL för QR-kod** i admin till `https://din-app.vercel.app/sign.html`
5. Nu funkar QR-kod-scanning på riktig telefon

Det är fortfarande en prototyp, men den fungerar end-to-end över internet.

## Vad som saknas (jämfört med produktion)

- Multi-tenancy (alla data är gemensam i samma webbläsare)
- Inloggning för administratörer
- Riktig databas
- Stripe-betalningar
- E-postleverans till mottagar­system
- CatalystOne-integration
- Backup, monitoring, säkerhetsloggar
- Tvåfaktorsautentisering
- Audit log persisterad i databas

Allt detta är på roadmap-listan ovan.

## Frågor under tiden

Skriv så svarar vi (som om jag pratar med dig direkt under bygget). Det är
mycket att gå igenom — ta en 