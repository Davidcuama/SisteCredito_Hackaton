# Script para instalar Node.js en Windows
# Ejecutar como Administrador

Write-Host "Instalador de Node.js para SisteCredito" -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js ya esta instalado
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "Node.js ya esta instalado: $nodeVersion" -ForegroundColor Green
        Write-Host "npm tambien deberia estar disponible" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "Node.js no esta instalado, procediendo con la instalacion..." -ForegroundColor Yellow
}

# URL de descarga de Node.js LTS
$nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
$installerPath = "$env:TEMP\nodejs-installer.msi"

Write-Host "Descargando Node.js LTS (v20.10.0)..." -ForegroundColor Cyan
Write-Host "URL: $nodeUrl" -ForegroundColor Gray

try {
    # Descargar Node.js
    Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Descarga completada" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Instalando Node.js..." -ForegroundColor Cyan
    Write-Host "Por favor, sigue las instrucciones del instalador" -ForegroundColor Yellow
    Write-Host "Asegurate de marcar Add to PATH durante la instalacion" -ForegroundColor Yellow
    Write-Host ""
    
    # Ejecutar instalador
    Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait
    
    Write-Host "Instalacion completada" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Cierra y vuelve a abrir la terminal para que los cambios surtan efecto" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Despues de reiniciar la terminal, ejecuta:" -ForegroundColor Cyan
    Write-Host "  node --version" -ForegroundColor White
    Write-Host "  npm --version" -ForegroundColor White
    
} catch {
    Write-Host "Error durante la instalacion: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalacion manual:" -ForegroundColor Yellow
    Write-Host "   1. Visita: https://nodejs.org/" -ForegroundColor White
    Write-Host "   2. Descarga la version LTS" -ForegroundColor White
    Write-Host "   3. Ejecuta el instalador" -ForegroundColor White
    Write-Host "   4. Asegurate de marcar Add to PATH" -ForegroundColor White
    exit 1
} finally {
    # Limpiar archivo temporal
    if (Test-Path $installerPath) {
        Remove-Item $installerPath -ErrorAction SilentlyContinue
    }
}
