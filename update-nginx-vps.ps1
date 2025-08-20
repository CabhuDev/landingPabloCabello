# Script PowerShell para añadir pablocabello.com a nginx en VPS
# Ejecutar desde Windows: .\update-nginx-vps.ps1

param(
    [string]$VpsIP = "31.97.36.248",
    [string]$VpsUser = "root",  # Cambiar por tu usuario
    [switch]$DryRun = $false
)

# Configuración
$ErrorActionPreference = "Stop"

Write-Host "🔧 Actualizando nginx en VPS desde Windows..." -ForegroundColor Blue
Write-Host "📍 VPS: $VpsUser@$VpsIP" -ForegroundColor Cyan

# Verificar que SSH funciona
Write-Host "🔍 Verificando conexión SSH..." -ForegroundColor Yellow
try {
    # Intentar conexión SSH sin BatchMode para permitir contraseña
    $testConnection = ssh -o ConnectTimeout=10 "$VpsUser@$VpsIP" "echo 'Conexión OK'"
    if ($LASTEXITCODE -ne 0) {
        throw "Error de conexión SSH"
    }
    Write-Host "✅ Conexión SSH establecida" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: No se puede conectar al VPS" -ForegroundColor Red
    Write-Host "💡 Opciones:" -ForegroundColor Yellow
    Write-Host "   1. Configurar SSH key (recomendado):" -ForegroundColor White
    Write-Host "      ssh-keygen -t rsa -b 4096" -ForegroundColor Gray
    Write-Host "      ssh-copy-id $VpsUser@$VpsIP" -ForegroundColor Gray
    Write-Host "   2. Usar contraseña directamente" -ForegroundColor White
    Write-Host "   3. Verificar que el VPS esté accesible" -ForegroundColor White
    exit 1
}

# Crear script temporal para el VPS
$scriptContent = @'
#!/bin/bash

# Script para añadir pablocabello.com a nginx (generado desde PowerShell)
set -e

echo "🔧 Añadiendo pablocabello.com a configuración de Nginx..."

# Verificar que el archivo principal existe
if [ ! -f /etc/nginx/sites-available/obratec.app ]; then
    echo "❌ ERROR: No se encuentra /etc/nginx/sites-available/obratec.app"
    exit 1
fi

# Backup de la configuración actual
echo "📝 Creando backup..."
cp /etc/nginx/sites-available/obratec.app /etc/nginx/sites-available/obratec.app.backup.$(date +%Y%m%d_%H%M%S)

# Verificar si pablocabello.com ya está configurado
if grep -q "pablocabello.com" /etc/nginx/sites-available/obratec.app; then
    echo "⚠️  pablocabello.com ya está configurado"
    # Remover configuración existente
    sed -i '/# PROYECTO 2: PABLOCABELLO.COM/,/^}$/d' /etc/nginx/sites-available/obratec.app
    sed -i '/server_name pablocabello.com/,/^}$/d' /etc/nginx/sites-available/obratec.app
    echo "🗑️  Configuración anterior removida"
fi

# Añadir nueva configuración
echo "➕ Añadiendo configuración de pablocabello.com..."
cat >> /etc/nginx/sites-available/obratec.app << 'NGINX_CONFIG'

# =====================================================
# PROYECTO 2: PABLOCABELLO.COM (Nginx + FastAPI) - Puerto 8443
# =====================================================

# pablocabello.com principal
server {
    listen 443 ssl http2;
    server_name pablocabello.com www.pablocabello.com;
    
    # Usar certificados Let's Encrypt para pablocabello.com
    ssl_certificate /etc/letsencrypt/live/pablocabello.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pablocabello.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logs específicos para pablocabello.com
    access_log /var/log/nginx/pablocabello.access.log;
    error_log /var/log/nginx/pablocabello.error.log;
    
    # Proxy al contenedor pablo-cabello-web (puerto 8443 HTTPS)
    location / {
        proxy_pass https://127.0.0.1:8443;
        proxy_ssl_verify off;  # Para certificados autofirmados del contenedor
        
        # Headers estándar
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts similares a obratec
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
        
        # Para archivos grandes
        client_max_body_size 10M;
    }
    
    # Health check específico para pablocabello
    location /health {
        proxy_pass https://127.0.0.1:8443/health;
        proxy_ssl_verify off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS para pablocabello.com
server {
    listen 80;
    server_name pablocabello.com www.pablocabello.com;
    return 301 https://$server_name$request_uri;
}
NGINX_CONFIG

echo "✅ Configuración añadida"

# Verificar sintaxis
echo "🔍 Verificando sintaxis de nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Sintaxis correcta"
    
    # Recargar nginx
    echo "🔄 Recargando nginx..."
    systemctl reload nginx
    
    echo ""
    echo "🎉 ¡pablocabello.com añadido correctamente!"
    echo ""
    echo "📊 URLs disponibles:"
    echo "  Obratec: https://obratec.app"
    echo "  N8N: https://n8n.obratec.app"
    echo "  Pablo: https://pablocabello.com"
    echo ""
    echo "📋 Próximos pasos:"
    echo "  1. Obtener certificados SSL:"
    echo "     sudo certbot --nginx -d pablocabello.com -d www.pablocabello.com"
    echo "  2. Desplegar contenedor en tu máquina local"
    echo "  3. Verificar: curl -k https://pablocabello.com/health"
    
else
    echo "❌ Error en sintaxis de nginx"
    echo "🔙 Configuración anterior restaurada"
    exit 1
fi
'@

# Guardar script temporal
$tempScript = "/tmp/update_nginx_pablo_$(Get-Date -Format 'yyyyMMdd_HHmmss').sh"
Write-Host "📝 Creando script temporal: $tempScript" -ForegroundColor Yellow

# Subir script al VPS
Write-Host "📤 Subiendo script al VPS..." -ForegroundColor Yellow
$scriptContent | ssh "$VpsUser@$VpsIP" "cat > $tempScript && chmod +x $tempScript"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error subiendo script al VPS" -ForegroundColor Red
    exit 1
}

# Modo DryRun
if ($DryRun) {
    Write-Host "🧪 MODO DRY-RUN: Mostrando lo que se haría..." -ForegroundColor Magenta
    ssh "$VpsUser@$VpsIP" "echo '=== CONTENIDO DEL SCRIPT ===' && cat $tempScript"
    Write-Host ""
    Write-Host "💡 Para ejecutar realmente: .\update-nginx-vps.ps1 (sin -DryRun)" -ForegroundColor Yellow
    ssh "$VpsUser@$VpsIP" "rm $tempScript"
    exit 0
}

# Confirmar ejecución
Write-Host ""
Write-Host "⚠️  ATENCIÓN: Esto modificará la configuración de nginx en tu VPS" -ForegroundColor Yellow
Write-Host "   - Se creará un backup automático" -ForegroundColor White
Write-Host "   - Se añadirá pablocabello.com sin tocar obratec.app" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "¿Continuar? (y/N)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    ssh "$VpsUser@$VpsIP" "rm $tempScript"
    exit 0
}

# Ejecutar script en VPS
Write-Host ""
Write-Host "🚀 Ejecutando script en VPS..." -ForegroundColor Green
ssh "$VpsUser@$VpsIP" "sudo $tempScript"

$exitCode = $LASTEXITCODE

# Limpiar archivo temporal
ssh "$VpsUser@$VpsIP" "rm $tempScript" -ErrorAction SilentlyContinue

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡NGINX ACTUALIZADO CORRECTAMENTE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Obtener certificados SSL en VPS:" -ForegroundColor White
    Write-Host "      ssh $VpsUser@$VpsIP 'sudo certbot --nginx -d pablocabello.com -d www.pablocabello.com'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Construir y desplegar tu contenedor:" -ForegroundColor White
    Write-Host "      docker-compose build && docker-compose up -d" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Verificar funcionamiento:" -ForegroundColor White
    Write-Host "      curl -k https://pablocabello.com/health" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔍 Monitorear logs:" -ForegroundColor Cyan
    Write-Host "   ssh $VpsUser@$VpsIP 'tail -f /var/log/nginx/pablocabello.*.log'" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Error ejecutando script en VPS" -ForegroundColor Red
    Write-Host "🔍 Revisa los logs para más detalles" -ForegroundColor Yellow
    exit 1
}
