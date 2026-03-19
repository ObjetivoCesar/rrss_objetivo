# Expert Lens Pipeline — Empaquetador ZIP

$SRC = "C:\Users\Cesar\Documents\GRUPO EMPRESARIAL REYES\PROYECTOS\Generador de guiones - Videos - voz en off\expert-lens-pipeline"
$DEST = "C:\Users\Cesar\Documents\GRUPO EMPRESARIAL REYES\PROYECTOS\expert-lens-pipeline-module"
$ZIP  = "C:\Users\Cesar\Documents\GRUPO EMPRESARIAL REYES\PROYECTOS\expert-lens-pipeline-module.zip"

if (Test-Path $DEST) { Remove-Item $DEST -Recurse -Force }
if (Test-Path $ZIP)  { Remove-Item $ZIP -Force }
New-Item -ItemType Directory -Path $DEST | Out-Null

Write-Host "Copiando archivos..." -ForegroundColor Cyan

# Directorios
$dirs = @("app", "lib", "prompts", "adn", "supabase", "types")
foreach ($d in $dirs) {
    $from = Join-Path $SRC $d
    $to   = Join-Path $DEST $d
    if (Test-Path $from) {
        New-Item -ItemType Directory -Path $to -Force | Out-Null
        Copy-Item -Path "$from\*" -Destination $to -Recurse -Force
        Write-Host "  OK $d" -ForegroundColor Green
    }
}

# Carpeta video-styles dentro de public
$vsFrom = Join-Path $SRC "public\video-styles"
$vsTo   = Join-Path $DEST "public\video-styles"
if (Test-Path $vsFrom) {
    New-Item -ItemType Directory -Path $vsTo -Force | Out-Null
    Copy-Item -Path "$vsFrom\*" -Destination $vsTo -Recurse -Force
    Write-Host "  OK public\video-styles" -ForegroundColor Green
}

# Scripts del proyecto (excluyendo node_modules)
$scriptsFrom = Join-Path $SRC "scripts"
$scriptsTo   = Join-Path $DEST "scripts"
if (Test-Path $scriptsFrom) {
    New-Item -ItemType Directory -Path $scriptsTo -Force | Out-Null
    Copy-Item -Path "$scriptsFrom\*" -Destination $scriptsTo -Recurse -Force
    Write-Host "  OK scripts" -ForegroundColor Green
}

# Archivos individuales de raiz
$files = @(
    "middleware.ts",
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "postcss.config.mjs",
    "eslint.config.mjs",
    ".gitignore",
    ".env.example",
    "INTEGRATION_GUIDE.md",
    "README.md",
    "next-env.d.ts"
)
foreach ($f in $files) {
    $from = Join-Path $SRC $f
    $to   = Join-Path $DEST $f
    if (Test-Path $from) {
        Copy-Item -Path $from -Destination $to -Force
        Write-Host "  OK $f" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Comprimiendo ZIP..." -ForegroundColor Cyan
Compress-Archive -Path "$DEST\*" -DestinationPath $ZIP -Force

$sizeMB = [math]::Round((Get-Item $ZIP).Length / 1MB, 2)
Write-Host ""
Write-Host "ZIP creado: $ZIP ($sizeMB MB)" -ForegroundColor Green
Write-Host "Carpeta temporal: $DEST" -ForegroundColor White
