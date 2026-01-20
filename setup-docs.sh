#!/bin/bash

# Script para configurar la documentación interactiva con Docusaurus

echo "🚀 Configurando documentación interactiva SIDIS API..."

# Navegar al directorio docs
cd docs

# Instalar dependencias
echo "📦 Instalando dependencias de Docusaurus..."
npm install

# Crear directorio src si no existe
mkdir -p src/components

# Copiar archivos de documentación existentes
echo "📋 Copiando documentación existente..."

# Copiar API_DOCUMENTATION.md como api-documentation.md
if [ -f "../API_DOCUMENTATION.md" ]; then
    cp "../API_DOCUMENTATION.md" "./api-documentation.md"
    echo "✅ API Documentation copiado"
fi

# Copiar AUTH_API_DOCUMENTATION.md como auth-api-documentation.md
if [ -f "../AUTH_API_DOCUMENTATION.md" ]; then
    cp "../AUTH_API_DOCUMENTATION.md" "./auth-api-documentation.md"
    echo "✅ Auth API Documentation copiado"
fi

# Crear directorio de imágenes
mkdir -p static/img

# Crear favicon placeholder
if [ ! -f "static/img/favicon.ico" ]; then
    echo "Creating placeholder favicon..."
    # En un entorno real, aquí pondrías tu favicon
    touch static/img/favicon.ico
fi

# Crear logo placeholder
if [ ! -f "static/img/logo.svg" ]; then
    echo "Creating placeholder logo..."
    # En un entorno real, aquí pondrías tu logo
    cat > static/img/logo.svg << 'EOL'
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="16" fill="#2e8555"/>
  <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">S</text>
</svg>
EOL
fi

echo "✅ Configuración completada!"
echo ""
echo "Para iniciar el servidor de desarrollo:"
echo "  cd docs"
echo "  npm start"
echo ""
echo "Para construir para producción:"
echo "  cd docs" 
echo "  npm run build"
echo ""
echo "🎉 ¡Tu documentación interactiva está lista!"