# build-site.ps1
# Sammanställer en deploy-klar hemsida i C:\Users\Leffe\Pacted\site\
# Redo att laddas upp direkt till Cloudflare Pages.
#
# Kör från valfri plats:
#   Set-ExecutionPolicy -Scope Process Bypass; .\build-site.ps1

$ErrorActionPreference = 'Stop'

$root = "C:\Users\Leffe\Pacted"
$site = Join-Path $root "site"

Write-Host "==== Bygger pact:ed webbsida ====" -ForegroundColor Cyan

# 1. Rensa och skapa site-mappen
if (Test-Path $site) {
    Write-Host "Rensar gammal site-mapp..." -ForegroundColor Yellow
    Remove-Item $site -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $site | Out-Null
Write-Host "Skapade: $site" -ForegroundColor Green

# 2. Filer som ska med i den publika sajten
$publicFiles = @(
    @{ src = "landing.html";   dst = "index.html" },   # Marketing-sida = förstasida
    @{ src = "index.html";     dst = "demo.html"  },   # Demo av signeringsflödet
    @{ src = "signup.html";    dst = "signup.html" },
    @{ src = "kvitto.html";    dst = "kvitto.html" },
    @{ src = "sign.html";      dst = "sign.html" },
    @{ src = "account.html";   dst = "account.html" },
    @{ src = "admin.html";     dst = "admin.html" },
    @{ src = "mall.html";      dst = "mall.html" },
    @{ src = "templates.js";   dst = "templates.js" },
    @{ src = "_headers";       dst = "_headers" },
    @{ src = "robots.txt";     dst = "robots.txt" },
    @{ src = "sitemap.xml";    dst = "sitemap.xml" },
    @{ src = "favicon.svg";    dst = "favicon.svg" },
    @{ src = "404.html";       dst = "404.html" }
)

foreach ($f in $publicFiles) {
    $srcPath = Join-Path $root $f.src
    $dstPath = Join-Path $site $f.dst
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $dstPath -Force
        Write-Host "  ✓ $($f.src) → $($f.dst)"
    } else {
        Write-Host "  ⚠ Saknas: $($f.src)" -ForegroundColor Yellow
    }
}

# 3. Fixa interna länkar i index.html (var landing.html)
#    Länkar "index.html" pekade på demo — byt till "demo.html"
$indexPath = Join-Path $site "index.html"
if (Test-Path $indexPath) {
    Write-Host ""
    Write-Host "Fixar interna länkar i index.html..." -ForegroundColor Cyan
    $content = Get-Content $indexPath -Raw
    # Byt href="index.html" till href="demo.html"
    $content = $content -replace 'href="index\.html"', 'href="demo.html"'
    # Lägg till favicon-referens om saknad
    if ($content -notmatch 'favicon\.svg') {
        $content = $content -replace '(<link href="https://fonts\.googleapis\.com/css2)',
            '<link rel="icon" type="image/svg+xml" href="/favicon.svg">' + "`n  " + '$1'
    }
    Set-Content -Path $indexPath -Value $content -Encoding utf8 -NoNewline
    Write-Host "  ✓ Länkar uppdaterade" -ForegroundColor Green
}

# 4. Sammanfattning
$count = (Get-ChildItem $site -File).Count
$size = [math]::Round((Get-ChildItem $site -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1KB, 1)

Write-Host ""
Write-Host "==== KLART ====" -ForegroundColor Green
Write-Host "Plats:   $site"
Write-Host "Filer:   $count"
Write-Host "Storlek: $size KB"
Write-Host ""
Write-Host "Nästa steg — deploy till Cloudflare Pages:" -ForegroundColor Cyan
Write-Host "  1. Gå till https://dash.cloudflare.com → Workers & Pages → Create → Pages"
Write-Host "  2. Välj 'Upload assets' (utan Git)"
Write-Host "  3. Projektnamn: 'pacted'"
Write-Host "  4. Dra hela mappen '$site' till upload-rutan"
Write-Host "  5. Klicka 'Deploy site'"
Write-Host "  6. Efter deploy: Custom domains → Add → pacted.se"
Write-Host ""
Write-Host "Fullständig guide: $root\README-CLOUDFLARE.md" -ForegroundColor DarkGray
