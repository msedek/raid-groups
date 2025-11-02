#!/bin/bash

# Script para refrescar el caché y reconstruir el proyecto

set -e

echo "🔄 Refrescando caché y reconstruyendo proyecto..."

# Cambiar al directorio del proyecto
cd "$(dirname "$0")"

# Cargar nvm si está disponible
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "📦 Reconstruyendo proyecto..."
npm run build

echo "🔄 Reiniciando servidor PM2..."
pm2 restart raid-groups

echo "⏳ Esperando que el servidor esté listo..."
sleep 3

echo "🌐 Verificando servidor..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Servidor funcionando correctamente (HTTP $HTTP_CODE)"
    echo ""
    echo "📊 Estado de PM2:"
    pm2 list | grep raid-groups
    echo ""
    echo "✅ Proceso completado exitosamente!"
else
    echo "❌ Error: Servidor no responde correctamente (HTTP $HTTP_CODE)"
    echo "📋 Logs del servidor:"
    pm2 logs raid-groups --lines 10 --nostream
    exit 1
fi
