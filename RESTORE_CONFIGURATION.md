# Documento de Restauración - Raid Groups Project

**Fecha de creación:** 2025-11-02  
**Última actualización:** 2025-11-02  
**Propósito:** Guía completa para restaurar la configuración completa del proyecto raid-groups en caso de pérdida del sistema.

---

## 📋 Información del Sistema Original

- **Usuario:** msedek
- **Directorio home:** `/home/msedek`
- **Ruta del proyecto:** `/home/msedek/loa-projects/raid-groups`
- **Node.js versión:** v24.11.0
- **NPM versión:** 11.6.1
- **NVM ubicación:** `/home/msedek/.nvm`
- **Node.js path completo:** `/home/msedek/.nvm/versions/node/v24.11.0/bin/node`
- **PM2:** Instalado globalmente via NPM
- **Cloudflared:** Instalado en `/usr/local/bin/cloudflared`

---

## 🌐 Información de Dominios y Túneles

- **Túnel Cloudflare:** `mordum-loan-tunnel`
- **Túnel ID:** `e52e727a-be0f-43dc-907b-911008473236`
- **Archivo de credenciales:** `/home/msedek/.cloudflared/e52e727a-be0f-43dc-907b-911008473236.json`
- **Configuración del túnel:** `/home/msedek/.cloudflared/config.yml`
- **Dominio del proyecto:** `raids.mordum.loan`
- **Puerto del servidor:** `3001`
- **Dominio existente (NO TOCAR):** `roster.mordum.loan` (puerto 3000)

---

## 🔧 Paso 1: Configuración Inicial del Sistema

### 1.1 Instalar NVM (si no está instalado)

```bash
# Descargar e instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar el perfil
source ~/.bashrc

# Verificar instalación
nvm --version
```

### 1.2 Instalar Node.js y NPM

```bash
# Instalar Node.js v24.11.0
nvm install 24.11.0
nvm use 24.11.0
nvm alias default 24.11.0

# Verificar instalación
node --version  # Debe mostrar: v24.11.0
npm --version   # Debe mostrar: 11.6.1
```

### 1.3 Instalar PM2 Globalmente

```bash
# Instalar PM2
npm install -g pm2

# Verificar instalación
pm2 --version
```

### 1.4 Instalar Cloudflared (si no está instalado)

```bash
# En Ubuntu/Debian
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Verificar instalación
cloudflared --version
```

---

## 📁 Paso 2: Configuración del Proyecto Raid Groups

### 2.1 Crear Estructura de Directorios

```bash
# Crear directorio del proyecto
mkdir -p ~/loa-projects/raid-groups
cd ~/loa-projects/raid-groups
```

### 2.2 Archivo package.json

El proyecto debe tener el siguiente `package.json`:

```json
{
  "name": "raid-groups",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "express": "^5.1.0",
    "googleapis": "^164.0.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.36.0",
    "@types/node": "^24.6.0",
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.4",
    "eslint": "^9.36.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.22",
    "globals": "^16.4.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.45.0",
    "vite": "^7.1.7"
  }
}
```

### 2.3 Instalar Dependencias

```bash
cd ~/loa-projects/raid-groups
npm install
```

### 2.4 Crear Servidor Express (server.cjs)

Crear archivo `server.cjs` en la raíz del proyecto:

```javascript
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3001;

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Manejar todas las rutas y servir index.html (para SPA)
// Este middleware se ejecuta solo si express.static no encontró el archivo
app.use((req, res) => {
  // Si es un archivo estático (con extensión), no hacer nada más
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  
  // Para todas las demás rutas, servir index.html para SPA routing
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Raid Groups server running on port ${PORT}`);
});
```

### 2.5 Construir el Proyecto

```bash
cd ~/loa-projects/raid-groups
npm run build
```

Esto creará la carpeta `dist/` con los archivos estáticos compilados.

### 2.6 Crear Directorio de Logs

```bash
mkdir -p ~/loa-projects/raid-groups/logs
```

---

## ⚙️ Paso 3: Configuración de PM2

### 3.1 Crear Archivo de Configuración PM2

Crear archivo `ecosystem.config.cjs` en la raíz del proyecto:

```javascript
module.exports = {
  apps: [
    {
      name: 'raid-groups',
      script: './server.cjs',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
```

### 3.2 Iniciar la Aplicación con PM2

```bash
cd ~/loa-projects/raid-groups
pm2 start ecosystem.config.cjs
```

### 3.3 Configurar PM2 para Auto-inicio al Reiniciar el Sistema

```bash
# Generar comando de startup (ajustar según el usuario)
pm2 startup systemd -u msedek --hp /home/msedek

# El comando anterior mostrará un comando sudo, ejecutarlo:
# Ejemplo (AJUSTAR SEGÚN LA SALIDA DEL COMANDO ANTERIOR):
sudo env PATH=$PATH:/home/msedek/.nvm/versions/node/v24.11.0/bin pm2 startup systemd -u msedek --hp /home/msedek

# Guardar la lista de procesos actuales
pm2 save
```

**IMPORTANTE:** El comando `sudo` exacto será mostrado por `pm2 startup`. Usar ese comando específico.

### 3.4 Verificar Estado de PM2

```bash
pm2 list
pm2 logs raid-groups
```

---

## ☁️ Paso 4: Configuración del Túnel de Cloudflare

### 4.1 Preparar Directorio de Cloudflared

```bash
mkdir -p ~/.cloudflared
cd ~/.cloudflared
```

### 4.2 Restaurar Credenciales del Túnel

**IMPORTANTE:** Necesitas tener una copia de seguridad del archivo de credenciales:
- `/home/msedek/.cloudflared/e52e727a-be0f-43dc-907b-911008473236.json`

Este archivo contiene las credenciales del túnel. **DEBE SER RESTAURADO DESDE BACKUP** o recreado desde el dashboard de Cloudflare.

**Si necesitas recrear el túnel:**

```bash
# Listar túneles existentes
cloudflared tunnel list

# O crear uno nuevo si es necesario (NO RECOMENDADO - puede romper configuración existente)
# cloudflared tunnel create mordum-loan-tunnel
```

### 4.3 Crear Configuración del Túnel

Crear archivo `~/.cloudflared/config.yml`:

```yaml
tunnel: mordum-loan-tunnel
credentials-file: /home/msedek/.cloudflared/e52e727a-be0f-43dc-907b-911008473236.json

ingress:
  # Roster Data API - Prioridad alta (debe estar primero)
  - hostname: roster.mordum.loan
    service: http://localhost:3000
  
  # Raid Groups - raids.mordum.loan
  - hostname: raids.mordum.loan
    service: http://localhost:3001
  
  # Catch-all rule - debe estar al final
  - service: http_status:404
```

**IMPORTANTE:** 
- NO modificar la configuración de `roster.mordum.loan` (ya existente)
- El orden de las reglas es importante
- El catch-all debe estar al final

### 4.4 Configurar DNS del Túnel

```bash
# Configurar el CNAME para raids.mordum.loan usando force overwrite
export TUNNEL_FORCE_PROVISIONING_DNS=true
cloudflared tunnel route dns mordum-loan-tunnel raids.mordum.loan

# Verificar que se configuró correctamente
cloudflared tunnel route dns list mordum-loan-tunnel
```

**NOTA:** Si hay un error porque ya existe un registro DNS, el flag `TUNNEL_FORCE_PROVISIONING_DNS=true` sobrescribirá el registro existente.

### 4.5 Iniciar Túnel con PM2

```bash
# Verificar si ya existe el proceso
pm2 list | grep cloudflared-tunnel

# Si no existe, iniciarlo
cd ~/.cloudflared
pm2 start cloudflared --name cloudflared-tunnel -- tunnel run

# O si ya hay un proceso configurado, reiniciarlo
pm2 restart cloudflared-tunnel
```

### 4.6 Guardar Configuración de PM2

```bash
pm2 save
```

---

## 🔄 Paso 5: Script de Refresh Cache

### 5.1 Crear Script refresh_cache.sh

Crear archivo `~/loa-projects/raid-groups/refresh_cache.sh`:

```bash
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
```

### 5.2 Hacer Ejecutable el Script

```bash
chmod +x ~/loa-projects/raid-groups/refresh_cache.sh
```

---

## ✅ Paso 6: Verificación Final

### 6.1 Verificar Procesos PM2

```bash
pm2 list
```

Deberías ver:
- `raid-groups` - online
- `cloudflared-tunnel` - online
- Otros procesos (roster-data, etc.) - online

### 6.2 Verificar Servidor Local

```bash
curl http://localhost:3001
```

Debe devolver el HTML de la aplicación.

### 6.3 Verificar Túnel Cloudflare

```bash
# Ver logs del túnel
pm2 logs cloudflared-tunnel --lines 20

# Verificar configuración DNS
cloudflared tunnel route dns list mordum-loan-tunnel
```

### 6.4 Verificar Dominio

Acceder a `https://raids.mordum.loan` en el navegador. Debe mostrar la aplicación.

---

## 🔐 Paso 7: Archivos Críticos a Respaldar

**IMPORTANTE:** Estos archivos DEBEN ser respaldados regularmente:

1. **Credenciales del túnel Cloudflare:**
   - `/home/msedek/.cloudflared/e52e727a-be0f-43dc-907b-911008473236.json`

2. **Configuración del túnel:**
   - `/home/msedek/.cloudflared/config.yml`

3. **Código fuente del proyecto:**
   - Todo el directorio `/home/msedek/loa-projects/raid-groups/` (excepto `node_modules` y `dist`)

4. **Configuración de PM2:**
   - `~/loa-projects/raid-groups/ecosystem.config.cjs`
   - `~/.pm2/dump.pm2` (generado automáticamente con `pm2 save`)

5. **Este documento:**
   - `~/loa-projects/raid-groups/RESTORE_CONFIGURATION.md`

---

## 🚨 Solución de Problemas Comunes

### Error 1033 en Cloudflare

Si ves el error "Error 1033 Cloudflare Tunnel error":

1. Verificar que el túnel está corriendo:
   ```bash
   pm2 list | grep cloudflared-tunnel
   ```

2. Verificar configuración DNS:
   ```bash
   cloudflared tunnel route dns list mordum-loan-tunnel
   ```

3. Reconfigurar DNS con force:
   ```bash
   export TUNNEL_FORCE_PROVISIONING_DNS=true
   cloudflared tunnel route dns mordum-loan-tunnel raids.mordum.loan
   pm2 restart cloudflared-tunnel
   ```

### Servidor no responde en localhost:3001

1. Verificar que el proceso está corriendo:
   ```bash
   pm2 list
   pm2 logs raid-groups
   ```

2. Verificar que el puerto está en uso:
   ```bash
   netstat -tlnp | grep :3001
   ```

3. Verificar que dist/ existe y tiene contenido:
   ```bash
   ls -la ~/loa-projects/raid-groups/dist/
   ```

4. Reconstruir si es necesario:
   ```bash
   cd ~/loa-projects/raid-groups
   npm run build
   pm2 restart raid-groups
   ```

### PM2 no inicia automáticamente

1. Verificar servicio systemd:
   ```bash
   systemctl --user status pm2-msedek
   ```

2. Reconfigurar startup:
   ```bash
   pm2 unstartup systemd
   pm2 startup systemd -u msedek --hp /home/msedek
   # Ejecutar el comando sudo que se muestre
   pm2 save
   ```

---

## 📝 Notas Adicionales

1. **No modificar otros procesos PM2:** Existen otros procesos corriendo (como `roster-data` y `cloudflared-tunnel`). NO modificar o eliminar estos procesos.

2. **Orden de configuración:** El orden de las reglas en `config.yml` es importante. Siempre mantener `roster.mordum.loan` primero y el catch-all al final.

3. **Versiones:** Si las versiones de Node.js o NPM cambian, actualizar este documento.

4. **Backups regulares:** Hacer backups regulares de los archivos críticos mencionados en el Paso 7.

---

## 🔗 Comandos Rápidos de Referencia

```bash
# Ver estado de todos los procesos
pm2 list

# Ver logs del proyecto
pm2 logs raid-groups

# Reiniciar proyecto
pm2 restart raid-groups

# Reconstruir y refrescar
cd ~/loa-projects/raid-groups && ./refresh_cache.sh

# Ver estado del túnel
pm2 logs cloudflared-tunnel
cloudflared tunnel route dns list mordum-loan-tunnel

# Verificar servidor local
curl http://localhost:3001
```

---

**Última actualización:** 2025-11-02  
**Versión del documento:** 1.0

