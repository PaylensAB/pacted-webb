# Migrationsguide — auto-memory → statisk CLAUDE.md

**Plattform:** Windows (baserat på dina sökvägar `C:\Users\leffe\...`)
**Skapad:** 17 maj 2026

Du har installerat **claude-mem** som plugin, vilket satte
`CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` och därmed stängt av Claude Codes inbyggda
auto-memory. Frågan är hur du säkerställer att projekt­kontexten ändå läses
oavsett vilket minnessystem som är aktivt.

Det här dokumentet beskriver tre vägar. **Väg C är rekommenderad.**

---

## Väg A — Avinstallera claude-mem, behåll inbyggda

För dig som vill backa beslutet och gå tillbaka till Claudes auto-memory.

### Steg 1: Hitta var claude-mem är installerat

I PowerShell:

```powershell
Get-Command claude-mem -ErrorAction SilentlyContinue
npm list -g claude-mem 2>$null
Get-ChildItem "$env:USERPROFILE\.claude\plugins" -Filter "*mem*" -ErrorAction SilentlyContinue
```

### Steg 2: Avinstallera

Beroende på hur det installerats:

**Om via npm globalt:**
```powershell
npm uninstall -g claude-mem
```

**Om via Claude Code plugins-mappen:**
```powershell
$pluginDir = "$env:USERPROFILE\.claude\plugins"
Get-ChildItem $pluginDir -Filter "*claude-mem*" | Remove-Item -Recurse -Force
```

**Om via Claude Code marketplace/plugin manager:**
Öppna Claude Code, kör `/plugins` och välj avinstallera där.

### Steg 3: Återställ env-variabeln

```powershell
[System.Environment]::SetEnvironmentVariable('CLAUDE_CODE_DISABLE_AUTO_MEMORY', $null, 'User')
[System.Environment]::SetEnvironmentVariable('CLAUDE_CODE_DISABLE_AUTO_MEMORY', $null, 'Machine')
```

Starta om PowerShell/Claude Code så variabeln försvinner.

### Steg 4: Verifiera

```powershell
$env:CLAUDE_CODE_DISABLE_AUTO_MEMORY  # ska vara tom
```

**Nackdel:** Du tappar funktionerna i claude-mem (som var anledningen att du
installerade det från början).

---

## Väg B — Kör `/learn-codebase` i claude-mem

claude-mem har en kommando som indexar kodbasen och bygger upp minnet
automatiskt från koden.

### Steg 1: Öppna Claude Code i projektroten

```powershell
cd "C:\sökväg\till\pacted\projekt"
claude
```

### Steg 2: Kör learn-codebase

I Claude Code-prompten:

```
/learn-codebase
```

Detta indexerar alla filer i repon och bygger ett kunskaps­minne.

**Nackdel:** `/learn-codebase` bygger minnet från **koden**. Det missar beslut
som inte är kodade — affärsmodellen, prisstrategin, varumärkesvalet, juridiska
ställnings­tagandena, supportmodellen. För pact:ed är detta särskilt
problematiskt eftersom mycket av värdet i projektet är i `.md`-filerna och i
strategiska beslut, inte i koden.

För dig som har **kod-tungt** projekt kan väg B vara OK. För pact:ed är den
otillräcklig.

---

## Väg C — Kopiera CLAUDE.md till projektroten (REKOMMENDERAS)

Claude Code **läser alltid `CLAUDE.md` i projektroten** oavsett vilket
minnessystem som är aktivt. Detta funkar både med inbyggda auto-memory,
med claude-mem och utan något plugin.

Det är ett medvetet val av Anthropic att låta CLAUDE.md vara den
"plattforms­oberoende" platsen för projektkontext.

### Steg 1: Kopiera in CLAUDE.md i projektet

`CLAUDE.md` finns redan här i `outputs/memory-export/CLAUDE.md`. Kopiera den
till din projektrot:

```powershell
# Hitta projektroten — anpassa sökvägen
$projektRot = "C:\sökväg\till\pacted-backend"

# Kopiera filen
Copy-Item "$env:USERPROFILE\AppData\Roaming\Claude\local-agent-mode-sessions\*\outputs\memory-export\CLAUDE.md" $projektRot -Force

# Verifiera
Get-ChildItem "$projektRot\CLAUDE.md"
```

Alternativt (om du har Cowork-outputs som monterad volym): öppna utforskaren,
gå till `outputs\memory-export\`, dra `CLAUDE.md` till projektroten.

### Steg 2: Commita till git

```powershell
cd $projektRot
git add CLAUDE.md
git commit -m "Add CLAUDE.md: project context for AI assistants"
```

Detta säkerställer att kontexten följer med repot även om du byter dator eller
delar projektet med en utvecklare.

### Steg 3: Verifiera att Claude Code läser den

Öppna Claude Code i projektroten:

```powershell
cd $projektRot
claude
```

Fråga något specifikt om projektet:

```
Vilken är vår prismodell?
```

Om Claude svarar med "Gratis 0 kr (10 sign/år), Liten 299 kr/år (500 sign), ..."
så fungerar det. Annars: kontrollera att `CLAUDE.md` ligger i den exakta
projektroten där du startade Claude Code.

### Fördelar med Väg C

1. **Plattformsoberoende** — fungerar oavsett plugin, oavsett OS, oavsett
   miljö (Claude Code CLI, Cowork, Claude Desktop, API-anrop).
2. **Versionerad** — du ser i git-historiken hur kontexten utvecklats.
3. **Granskningsbar** — du kan läsa den själv, dela med utvecklare, granska
   med jurist om det behövs.
4. **Uppdaterad** — när du fattar nya beslut redigerar du CLAUDE.md direkt
   istället för att hoppas att auto-memory hänger med.

### Nackdelar med Väg C

1. **Manuellt underhåll** — du behöver själv hålla den uppdaterad. Auto-memory
   gjorde detta åt dig.
2. **Risk för stale info** — om du ändrar prismodellen men glömmer
   uppdatera CLAUDE.md, ger Claude felaktiga svar.
3. **Kan bli stor** — ju mer kontext, desto längre token-läsning för Claude
   vid varje session.

### Mildra nackdelarna

**Lägg `update-claude-md` som git pre-commit hook** så du blir påmind att
uppdatera kontexten när du gjort större ändringar.

**Håll CLAUDE.md disciplinerad:** ~500 rader är en bra övre gräns. Allt över
det börjar bli motsägelsefullt och svår­läst.

**Delkapitel istället för allt-i-en:** för stora projekt, gör en index-CLAUDE.md
som länkar till `docs/CLAUDE-architecture.md`, `docs/CLAUDE-business.md` osv.
Claude Code följer länkar.

---

## Rekommendation: Hybrid C+B

Den bästa lösningen för pact:ed:

1. **Väg C som primär** — `CLAUDE.md` i projektrot är källan till
   strategisk/beslutsrelaterad kontext (affärsmodell, branding, juridik).
2. **Väg B som komplement** — låt claude-mem indexa koden via
   `/learn-codebase` för teknisk detalj­kontext.
3. **Behåll claude-mem** för funktioner du gillar (sökbarhet, semantisk
   memory).

Detta ger dig det bästa av båda världar: kod-tung kontext via claude-mem,
beslutskontext via CLAUDE.md, och båda läses av Claude vid varje session.

---

## Vad gör jag om jag har auto-memory som jag vill behålla?

Om du har viktiga minnen i ditt nuvarande Claude Code auto-memory som jag
inte ser från Cowork-sandlådan, gör så här:

**Steg 1: Hitta filerna lokalt**

```powershell
Get-ChildItem "$env:USERPROFILE\.claude\projects" -Recurse -Filter "*.md" |
    Select-Object FullName, Length, LastWriteTime
```

**Steg 2: Bundla till en fil**

```powershell
$dest = "$env:USERPROFILE\Desktop\auto-memory-bundle.md"

"# Bundle av auto-memory-filer`n`n*Skapad: $(Get-Date)*`n`n" | Out-File $dest

Get-ChildItem "$env:USERPROFILE\.claude\projects" -Recurse -Filter "*.md" | ForEach-Object {
    "## $($_.FullName)`n" | Out-File $dest -Append
    Get-Content $_.FullName | Out-File $dest -Append
    "`n---`n" | Out-File $dest -Append
}

Write-Host "Bundlad till: $dest"
```

**Steg 3: Klistra in eller ladda upp**

Öppna `auto-memory-bundle.md`, kopiera innehållet till mig i ett nytt
chattmeddelande. Jag bygger sedan en utvidgad CLAUDE.md som kombinerar dessa
minnen med den jag redan skapat från sessionen.

Eller — dra-och-släpp filen i Cowork-chatten så hamnar den i `uploads/` och
jag kan läsa den därifrån.
