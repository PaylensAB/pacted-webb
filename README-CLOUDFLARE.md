# Deploy pact:ed till Cloudflare Pages

Komplett guide från noll till `https://pacted.se` live. Räkna med **20–30 minuter** första gången.

---

## Vad du behöver

- Domän `pacted.se` (redan köpt)
- Ett Cloudflare-konto (gratis) — skapas på https://dash.cloudflare.com
- Mappen `C:\Users\Leffe\Pacted\` med all projekt-kod

---

## Steg 1 — Bygg site-mappen (2 min)

Öppna PowerShell och kör:

```powershell
cd C:\Users\Leffe\Pacted
.\build-site.ps1
```

Skriptet skapar `C:\Users\Leffe\Pacted\site\` med alla filer som ska laddas upp:

- `index.html` — förstasidan (landing)
- `demo.html` — signerings-demo
- `signup.html`, `kvitto.html`, `sign.html`, `account.html`
- `_headers` — säkerhets-headers (CSP, HSTS m.m.)
- `robots.txt`, `sitemap.xml`, `favicon.svg`, `404.html`

---

## Steg 2 — Flytta domänen till Cloudflare (5 min + väntetid)

**Varför:** Cloudflare hanterar DNS, TLS-certifikat, cache och DDoS-skydd — allt gratis. Om domänen ligger hos Loopia/One.com behöver du peka `nameservers` till Cloudflare.

1. Logga in på https://dash.cloudflare.com
2. Klicka **Add a site** → skriv `pacted.se` → välj **Free-planen**
3. Cloudflare visar två nameservers, t.ex. `alice.ns.cloudflare.com` + `bob.ns.cloudflare.com`
4. Logga in hos din nuvarande domänleverantör (Loopia/One.com/Namecheap)
5. Hitta "DNS" eller "Namservers" i inställningarna
6. Ersätt de befintliga namservrarna med Cloudflares två
7. Spara. **Nu tar det 5 min – 24 h** innan bytet är klart. Cloudflare mejlar när det är klart.

Under tiden: fortsätt med steg 3, det blockeras inte av namservrar.

---

## Steg 3 — Skapa Cloudflare Pages-projekt (5 min)

1. På https://dash.cloudflare.com → vänstermenyn: **Workers & Pages**
2. Klicka **Create application** → fliken **Pages** → **Upload assets**
3. Projektnamn: `pacted`
4. **Dra hela mappen `C:\Users\Leffe\Pacted\site\`** till upload-rutan (eller klicka och välj alla filer)
5. Klicka **Deploy site**
6. Efter ~30 sekunder är sajten live på `https://pacted.pages.dev`
7. Testa: öppna `https://pacted.pages.dev` — landing-sidan ska visas

---

## Steg 4 — Koppla `pacted.se` (2 min, efter att steg 2 klarnat)

1. I Pages-projektet: fliken **Custom domains**
2. Klicka **Set up a custom domain** → skriv `pacted.se` → **Continue** → **Activate domain**
3. Klicka **Add another** → skriv `www.pacted.se` → **Continue** → **Activate domain**
4. Cloudflare lägger automatiskt till DNS-poster och skapar TLS-certifikat

Inom 1–5 min: `https://pacted.se` visar din landing-sida.

---

## Steg 5 — Testa att allt fungerar

Öppna i webbläsaren och kontrollera:

- `https://pacted.se` — landing-sidan
- `https://pacted.se/signup.html` — anmälningsformuläret
- `https://pacted.se/demo.html` — signerings-demo
- `https://pacted.se/kvitto.html` — privat kvitto-verktyg
- `https://pacted.se/random-nonsense` — 404-sidan

Kontrollera säkerhet:
- https://securityheaders.com/?q=pacted.se — betyg A eller bättre
- https://www.ssllabs.com/ssltest/analyze.html?d=pacted.se — betyg A+

---

## Steg 6 — Uppdatera signup-formuläret (10 min)

Just nu är `signup.html` bara HTML utan riktig submit-funktion. Snabbaste sättet att göra det funktionellt:

1. Skapa gratis konto på https://tally.so
2. Klicka **Create a new form** → välj mall "Waitlist" eller "Contact"
3. Lägg till fält: företagsnamn, e-post, telefon, antal anställda
4. **Share** → **Embed** → kopiera embed-koden
5. Öppna `C:\Users\Leffe\Pacted\signup.html` i VS Code
6. Byt ut det befintliga `<form>`-blocket mot Tally-embed
7. Kör `build-site.ps1` igen och ladda upp `site/` till Cloudflare Pages

Nu hamnar alla nya intresseanmälningar direkt i din inbox + Tally-dashboard.

---

## Framtida uppdateringar

Varje gång du ändrat något i `C:\Users\Leffe\Pacted\`:

```powershell
cd C:\Users\Leffe\Pacted
.\build-site.ps1
```

Sedan i Cloudflare Pages:
1. Öppna `pacted`-projektet
2. Fliken **Deployments** → **Create deployment**
3. Dra `site\`-mappen dit
4. Klart på ~30 sek

**Ännu smidigare** (om du orkar en gång): koppla projektet till GitHub. Då räcker `git push` för att deploya. Se: https://developers.cloudflare.com/pages/get-started/git-integration/

---

## Kostnader

| | Kostnad |
|---|---|
| Cloudflare Pages | **Gratis** (500 deploys/mån, obegränsad bandbredd) |
| Cloudflare DNS | **Gratis** |
| TLS-certifikat | **Gratis** (auto via Cloudflare) |
| Domän `pacted.se` | ~100–150 kr/år (redan betald) |
| **Totalt år 1** | **~150 kr** |

---

## Vanliga problem

**"Site can't be reached" efter DNS-byte:**
Vänta 5–60 min. Testa `nslookup pacted.se` — svaret ska innehålla Cloudflare-IP:er (t.ex. 104.x.x.x).

**Custom domain fastnar i "Verifying":**
Kontrollera att domänen visas som "Active" i Cloudflare-dashboardens huvudvy (inte bara i Pages).

**Formulär i signup.html gör inget:**
Se steg 6 — den är statisk tills du kopplar Tally eller liknande.

**Ändringar syns inte:**
Cloudflare cachar aggressivt. I dashboarden: **Caching** → **Configuration** → **Purge Everything**.

---

## Kontakt & support

- Cloudflare-support (chat): https://dash.cloudflare.com/support
- Cloudflare-forum: https://community.cloudflare.com/
- Cloudflare-status: https://www.cloudflarestatus.com/

Lycka till med lanseringen! 🚀
