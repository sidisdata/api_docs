# Script para configurar la documentación interactiva con Docusaurus en Windows

Write-Host "Configurando documentación interactiva SIDIS API..." -ForegroundColor Green

# Navegar al directorio docs
Set-Location docs

# Instalar dependencias
Write-Host "Instalando dependencias de Docusaurus..." -ForegroundColor Yellow
npm install

# Crear directorio src/components si no existe
if (!(Test-Path "src/components")) {
    New-Item -ItemType Directory -Path "src/components" -Force
}

# Copiar archivos de documentación existentes
Write-Host "Copiando documentación existente..." -ForegroundColor Yellow

# Copiar API_DOCUMENTATION.md como api-documentation.md
if (Test-Path "../API_DOCUMENTATION.md") {
    Copy-Item "../API_DOCUMENTATION.md" "./api-documentation.md"
    Write-Host "API Documentation copiado" -ForegroundColor Green
}

# Copiar AUTH_API_DOCUMENTATION.md como auth-api-documentation.md  
if (Test-Path "../AUTH_API_DOCUMENTATION.md") {
    Copy-Item "../AUTH_API_DOCUMENTATION.md" "./auth-api-documentation.md"
    Write-Host "Auth API Documentation copiado" -ForegroundColor Green
}

# Crear directorio de imágenes
if (!(Test-Path "static/img")) {
    New-Item -ItemType Directory -Path "static/img" -Force
}

# Crear favicon placeholder
if (!(Test-Path "static/img/favicon.ico")) {
    Write-Host "Creando favicon placeholder..." -ForegroundColor Yellow
    New-Item -ItemType File -Path "static/img/favicon.ico" -Force
}

# Crear logo placeholder
if (!(Test-Path "static/img/logo.svg")) {
    Write-Host "Creando logo placeholder..." -ForegroundColor Yellow
    @"
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="16" fill="#2e8555"/>
  <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">S</text>
</svg>
"@ | Out-File -FilePath "static/img/logo.svg" -Encoding UTF8
}

Write-Host "Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el servidor de desarrollo:" -ForegroundColor Cyan
Write-Host "  cd docs" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Para construir para producción:" -ForegroundColor Cyan
Write-Host "  cd docs" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host ""
Write-Host "Tu documentación interactiva está lista!" -ForegroundColor Green