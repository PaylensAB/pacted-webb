# Memory-export — status och nästa steg

**Skapad:** 17 maj 2026
**Plats:** `outputs/memory-export/`

## Vad jag försökte göra

Du bad mig läsa ditt auto-memory för det här projektet (typiskt
`~/.claude/projects/<projekt-katalog>/memory/MEMORY.md` plus alla `.md`-filer
det indexar) och bunta ihop till en `MEMORY_BUNDLE.md`.

## Vad jag faktiskt hittade

I min Cowork-sandlåda fanns:

| Sökväg | Vad det är |
|---|---|
| `/sessions/.../mnt/outputs/` | Den här projektmappen (alla pact:ed-filer) |
| `/sessions/.../mnt/.claude/projects/<hash>/deab93f9-...jsonl` | **Session-transcript** (3,9 MB JSONL), inte memory |
| `/sessions/.../mnt/.claude/skills/` | Cowork-skills (docx, pptx, pdf m.fl.) |
| `/sessions/.../mnt/uploads/` | Tom |

**Det fanns ingen `MEMORY.md`-fil och inga separata memory-`.md`-filer.**

## Varför den inte finns där

Auto-memory som du syftar på är **Claude Codes** lokala minnessystem och ligger
på din Windows-dator under:

```
C:\Users\leffe\.claude\projects\<projekt-hash>\memory\MEMORY.md
```

Min Cowork-sandlåda är en separat miljö (Linux-VM hos Anthropic) som inte har
åtkomst till din lokala disk. Jag kan därför inte läsa eller bundla dem
härifrån.

## Vad jag levererade istället

Eftersom jag inte kunde gissa det jag inte ser har jag levererat två filer:

### `CLAUDE.md`

En projektsammanfattning för pact:ed baserad på **denna sessions kontext**
(alla beslut vi tagit om arkitektur, prismodell, juridik, support­modell m.m.).
Detta är förmodligen **mer komplett och uppdaterat** än vad ditt lokala
auto-memory innehåller, eftersom det reflekterar alla senaste ändringar.

Kopiera den till din projektrot som `CLAUDE.md` så läser Claude Code den
oavsett vilket minnessystem som är aktivt.

### `MIGRATION_GUIDE.md`

Tre vägar (A/B/C) för hur du hanterar övergången från auto-memory till
CLAUDE.md, med konkreta Windows-kommandon.

## Vill du fortfarande bundla ditt lokala auto-memory?

Om du **också** vill exportera det riktiga MEMORY.md-trädet från din Windows-dator,
gör en av två saker:

**Alternativ 1: Klistra in innehållet hit**

Öppna PowerShell och kör:

```powershell
Get-Content "C:\Users\leffe\.claude\projects\*\memory\MEMORY.md" | Set-Clipboard
```

Sen klistrar du in i ett nytt chattmeddelande, så bundlar jag det åt dig.

**Alternativ 2: Ladda upp filerna**

Dra-och-släpp `MEMORY.md` och eventuella `.md`-filer den refererar till in i
chatten. Jag bundlar dem så snart de finns i `uploads/`-mappen.

**Alternativ 3: Kör export själv**

Detta PowerShell-skript bundlar alla `.md`-filer i memory-mappen:

```powershell
$src = "$env:USERPROFILE\.claude\projects"
$dest = "$env:USERPROFILE\Desktop\pact-ed-memory-bundle"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Hitta projektet
$proj = Get-ChildItem $src -Directory | Where-Object {
    $_.Name -like "*pacted*" -or $_.Name -like "*pact*" -or $_.Name -like "*signing*"
} | Select-Object -First 1

if ($proj) {
    Write-Host "Hittade projekt: $($proj.FullName)"
    $mem = Join-Path $proj.FullName "memory"
    if (Test-Path $mem) {
        Copy-Item "$mem\*" $dest -Recurse
        Write-Host "Exporterat till: $dest"
    } else {
        Write-Host "Ingen memory-mapp i projektet"
    }
} else {
    Write-Host "Hittade inget projekt — listar alla:"
    Get-ChildItem $src -Directory | Select-Object Name
}
```

## Sammanfattning av leveransen

Skapade filer:

```
outputs/memory-export/
├── README-export.md         ← den här filen
├── CLAUDE.md                ← projektsammanfattning från sessionen
└── MIGRATION_GUIDE.md       ← tre vägar med Windows-kommandon
```

Inga "minnen från ditt auto-memory" är bundlade — eftersom jag inte hittade
några. Om du har auto-memory lokalt som du vill ha med, skicka över det enligt
ovan så lägger jag till det.
