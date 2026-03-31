# Script de Mantenimiento RRSS Objetivo
# Uso: .\reset-local.ps1

Write-Host "🚀 Iniciando limpieza de entorno local..." -ForegroundColor Cyan

# 1. Eliminar carpetas pesadas
$folders = @("apps\rrss-objetivo\.next", "apps\rrss-objetivo\node_modules", "node_modules")

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "🧹 Borrando $folder..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $folder
    }
}

# 2. Reinstalar dependencias (opcional, pero recomendado)
Write-Host "📦 Reinstalando dependencias..." -ForegroundColor Cyan
npm install

Write-Host "✅ Entorno limpio. Puedes ejecutar 'npm run dev' ahora." -ForegroundColor Green
