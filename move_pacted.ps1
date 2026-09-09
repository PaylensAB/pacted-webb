# move_pacted.ps1
# Flyttar hela pact:ed-projektet till C:\Users\Leffe\Pacted\
# (C:\Användare\Leffe\Pacted\ i utforskaren — samma mapp)
#
# Kör i PowerShell från valfri plats:
#   Set-ExecutionPolicy -Scope Process Bypass; .\move_pacted.ps1
#
# Vad skriptet gör:
# 1. Hittar Cowork-outputs-mappen automatiskt
# 2. Skapar C:\Users\Leffe\Pacted om den inte finns
# 3. Kopierar allt utom skriptet självt och .git-metadata
# 4. Bevarar git-historik om den finns
# 5. Om ingen .git finns: initierar ett nytt repo med milstolpar som taggar
# 6. Loggar allt till Pacted-move.log på skrivbordet

$ErrorActionPreference = 'Stop'
$logPath = "$env:USERPROFILE\Desktop\Pacted-move.log"
Start-Transcript -Path $logPath -Force | Out-Null

Write-Host "==== pact:ed → C:\Users\Leffe\Pacted ====" -ForegroundColor Cyan
Write-Host "Start: $(Get-Date)"
Write-Host ""

# --- Steg 1: hitta källa (försök flera platser + fallback till sökning) ---
$candidates = @(
    "$env:LOCALAPPDATA\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\local-agent-mode-sessions\645e150a-bb4f-4bc8-95b9-d78a00834ec0\172697fb-0060-432c-b365-56c17ee089c4\local_8d654c77-c650-46ca-896f-be7d5b859d6f\outputs",
    "$env:APPDATA\Claude\local-agent-mode-sessions\645e150a-bb4f-4bc8-95b9-d78a00834ec0\172697fb-0060-432c-b365-56c17ee089c4\local_8d654c77-c650-46ca-896f-be7d5b859d6f\outputs"
)
$src = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $src) {
    Write-Host "Ingen av de vanliga sökvägarna funkade — söker bredare..." -ForegroundColor Yellow
    $roots = @("$env:LOCALAPPDATA\Packages", "$env:APPDATA")
    foreach ($root in $roots) {
        if (-not (Test-Path $root)) { continue }
        $hit = Get-ChildItem $root -Recurse -Directory -Filter "outputs" -ErrorAction SilentlyContinue -Depth 12 |
               Where-Object { $_.FullName -like "*local-agent-mode-sessions*local_8d654c77*" } |
               Select-Object -First 1
        if ($hit) { $src = $hit.FullName; break }
    }
}

if (-not $src) {
    Write-Error "Kunde inte hitta Cowork-outputs-mappen. Prova att köra skriptet direkt från mappen där move_pacted.ps1 ligger."
    Stop-Transcript | Out-Null
    exit 1
}
Write-Host "Källa: $src" -ForegroundColor Green

# --- Steg 2: skapa mål ---
$dst = "C:\Users\Leffe\Pacted"
if (Test-Path $dst) {
    Write-Host "VARNING: $dst finns redan." -ForegroundColor Yellow
    $answer = Read-Host "Fortsätta och skriva över? (ja/nej)"
    if ($answer -ne "ja") { Write-Host "Avbrutet."; Stop-Transcript | Out-Null; exit 0 }
} else {
    New-Item -ItemType Directory -Force -Path $dst | Out-Null
    Write-Host "Skapade: $dst" -ForegroundColor Green
}

# --- Steg 3: kopiera filer (skippa skriptet självt och backup-mappar) ---
Write-Host ""
Write-Host "Kopierar filer..." -ForegroundColor Cyan
$excludes = @('move_pacted.ps1', 'Pacted-move.log', 'node_modules')
Get-ChildItem -Path $src -Force | Where-Object { $_.Name -notin $excludes } | ForEach-Object {
    $target = Join-Path $dst $_.Name
    Copy-Item -Path $_.FullName -Destination $target -Recurse -Force
    Write-Host "  ✓ $($_.Name)"
}

# --- Steg 4: git-historik ---
Write-Host ""
Write-Host "Hanterar versionshistorik..." -ForegroundColor Cyan

# Safety net — säkerställ att $dst är satt (kan förloras i vissa PS-scopes)
if (-not $dst -or $dst.Length -eq 0) {
    $dst = "C:\Users\Leffe\Pacted"
    Write-Host "  (Återställer $dst)" -ForegroundColor DarkGray
}

$gitExists = Test-Path (Join-Path $dst ".git")
if ($gitExists) {
    Write-Host "  git-repo redan kopierat med historik" -ForegroundColor Green
    & git -C $dst log --oneline -5 2>&1 | ForEach-Object { Write-Host "    $_" }
} else {
    Write-Host "  Ingen befintlig historik hittad. Initierar nytt repo med milstolpar." -ForegroundColor Yellow

    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "  VARNING: git inte installerat. Ladda ner från https://git-scm.com/download/win" -ForegroundColor Red
    } else {
        & git -C $dst init 2>&1 | Out-Null
        & git -C $dst config user.name "Leffe Dimitriou" 2>&1 | Out-Null
        & git -C $dst config user.email "leffe.dimitriou@gmail.com" 2>&1 | Out-Null

        # Ignorera stora / genererade filer
        $gitignorePath = Join-Path $dst ".gitignore"
        @('node_modules/','.next/','dist/','.env','*.log') | Out-File $gitignorePath -Encoding utf8 -Append

        & git -C $dst add . 2>&1 | Out-Null
        & git -C $dst commit -m "v1.0 pact:ed komplett paket: prototyp, backend, juridik, affärsmodell" 2>&1 | Out-Null
        & git -C $dst tag -a v1.0 -m "Första kompletta leveransen — pact:ed" 2>&1 | Out-Null

        Write-Host "  ✓ Nytt git-repo skapat med tag v1.0" -ForegroundColor Green
    }
}

# --- Steg 5: sammanfattning ---
Write-Host ""
Write-Host "==== KLART ====" -ForegroundColor Green
Write-Host "Plats:    $dst"
Write-Host "Filer:    $(Get-ChildItem $dst -Recurse -File | Measure-Object).Count"
Write-Host "Storlek:  $([math]::Round((Get-ChildItem $dst -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1KB, 1)) KB"
Write-Host "Logg:     $logPath"
Write-Host ""
Write-Host "Nästa steg:" -ForegroundColor Cyan
Write-Host "  cd '$dst'"
Write-Host "  git log --oneline    # se historik"
Write-Host "  code .               # öppna i VS Code (om installerat)"

Stop-Transcript | Out-Null
Start-Sleep -Seconds 3
