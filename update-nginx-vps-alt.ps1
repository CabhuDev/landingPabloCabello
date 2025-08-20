# Script PowerShell alternativo con mejor compatibilidad SSH
# Ejecutar desde Windows: .\update-nginx-vps-alt.ps1

param(
    [string]$VpsIP = "31.97.36.248",
    [string]$VpsUser = "root",
    [switch]$DryRun = $false
)

# Configuración
$ErrorActionPreference = "Continue"  # Cambiar a Continue para mejor debugging

Write-Host "🔧 Actualizando nginx en VPS desde Windows (versión alternativa)..." -ForegroundColor Blue
Write-Host "📍 VPS: $VpsUser@$VpsIP" -ForegroundColor Cyan

# Verificar que SSH funciona con mejor control de errores
Write-Host "🔍 Verificando conexión SSH..." -ForegroundColor Yellow

# Usar Start-Process para mejor control
$sshTest = Start-Process -FilePath "ssh" -ArgumentList "-o","ConnectTimeout=10","$VpsUser@$VpsIP","echo 'Conexion OK'" -Wait -PassThru -NoNewWindow -RedirectStandardOutput "ssh_test_output.txt" -RedirectStandardError "ssh_test_error.txt"

if ($sshTest.ExitCode -eq 0) {
    $output = Get-Content "ssh_test_output.txt" -ErrorAction SilentlyContinue
    Write-Host "✅ Conexión SSH establecida: $output" -ForegroundColor Green
    Remove-Item "ssh_test_output.txt", "ssh_test_error.txt" -ErrorAction SilentlyContinue
} else {
    $error = Get-Content "ssh_test_error.txt" -ErrorAction SilentlyContinue
    Write-Host "❌ Error SSH: $error" -ForegroundColor Red
    Write-Host "💡 Soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Usar Windows Terminal en lugar de PowerShell ISE" -ForegroundColor White
    Write-Host "   2. Verificar que OpenSSH está instalado:" -ForegroundColor White
    Write-Host "      Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'" -ForegroundColor Gray
    Write-Host "   3. Probar comando manual: ssh $VpsUser@$VpsIP" -ForegroundColor White
    Remove-Item "ssh_test_output.txt", "ssh_test_error.txt" -ErrorAction SilentlyContinue
    exit 1
}

# Crear script bash para el VPS
$bashScript = @"
#!/bin/bash

# Script para añadir pablocabello.com a nginx
set -e

echo "🔧 Añadiendo pablocabello.com a configuración de Nginx..."

# Verificar archivo principal
if [ ! -f /etc/nginx/sites-available/obratec.app ]; then
    echo "❌ ERROR: No se encuentra /etc/nginx/sites-available/obratec.app"
    exit 1
fi

# Backup
echo "📝 Creando backup..."
cp /etc/nginx/sites-available/obratec.app /etc/nginx/sites-available/obratec.app.backup.`date +%Y%m%d_%H%M%S`

# Remover configuración previa si existe
if grep -q "pablocabello.com" /etc/nginx/sites-available/obratec.app; then
    echo "⚠️  Removiendo configuración previa de pablocabello.com..."
    sed -i '/# PROYECTO 2: PABLOCABELLO.COM/,/^server {$/d' /etc/nginx/sites-available/obratec.app
    sed -i '/server_name pablocabello.com/,/^}$/d' /etc/nginx/sites-available/obratec.app
fi

# Añadir nueva configuración
echo "➕ Añadiendo configuración de pablocabello.com..."
cat >> /etc/nginx/sites-available/obratec.app << 'EOF'

# =====================================================
# PROYECTO 2: PABLOCABELLO.COM (Nginx + FastAPI) - Puerto 8443
# =====================================================

# pablocabello.com principal
server {
    listen 443 ssl http2;
    server_name pablocabello.com www.pablocabello.com;
    
    # Certificados SSL Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/pablocabello.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pablocabello.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logs
    access_log /var/log/nginx/pablocabello.access.log;
    error_log /var/log/nginx/pablocabello.error.log;
    
    # Proxy al contenedor (puerto 8443 HTTPS)
    location / {
        proxy_pass https://127.0.0.1:8443;
        proxy_ssl_verify off;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_set_header X-Forwarded-Host `$host;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
        client_max_body_size 10M;
    }
    
    # Health check
    location /health {
        proxy_pass https://127.0.0.1:8443/health;
        proxy_ssl_verify off;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name pablocabello.com www.pablocabello.com;
    return 301 https://`$server_name`$request_uri;
}
EOF

echo "✅ Configuración añadida"

# Verificar sintaxis
echo "🔍 Verificando sintaxis nginx..."
nginx -t

if [ `$? -eq 0 ]; then
    echo "✅ Sintaxis correcta"
    echo "🔄 Recargando nginx..."
    systemctl reload nginx
    echo ""
    echo "🎉 ¡pablocabello.com configurado correctamente!"
    echo ""
    echo "📊 URLs disponibles:"
    echo "  Obratec: https://obratec.app"
    echo "  N8N: https://n8n.obratec.app"  
    echo "  Pablo: https://pablocabello.com"
    echo ""
    echo "📋 Próximos pasos:"
    echo "  1. Obtener certificados SSL:"
    echo "     sudo certbot --nginx -d pablocabello.com -d www.pablocabello.com"
    echo "  2. Desplegar contenedor"
    echo "  3. Verificar: curl -k https://pablocabello.com/health"
else
    echo "❌ Error en sintaxis nginx"
    exit 1
fi
"@

# Guardar script en archivo temporal local
$tempFile = "update_nginx_temp.sh"
$bashScript | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "📝 Script bash creado localmente: $tempFile" -ForegroundColor Yellow

# Subir script al VPS usando scp
Write-Host "📤 Subiendo script al VPS con scp..." -ForegroundColor Yellow
$scpProcess = Start-Process -FilePath "scp" -ArgumentList $tempFile,"$VpsUser@$VpsIP:/tmp/update_nginx_pablo.sh" -Wait -PassThru -NoNewWindow

if ($scpProcess.ExitCode -ne 0) {
    Write-Host "❌ Error subiendo archivo con scp" -ForegroundColor Red
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    exit 1
}

# Dar permisos de ejecución
ssh "$VpsUser@$VpsIP" "chmod +x /tmp/update_nginx_pablo.sh"

# Modo DryRun
if ($DryRun) {
    Write-Host "🧪 MODO DRY-RUN: Mostrando contenido del script..." -ForegroundColor Magenta
    ssh "$VpsUser@$VpsIP" "echo '=== CONTENIDO DEL SCRIPT ===' && cat /tmp/update_nginx_pablo.sh"
    Write-Host ""
    Write-Host "💡 Para ejecutar realmente: .\update-nginx-vps-alt.ps1" -ForegroundColor Yellow
    ssh "$VpsUser@$VpsIP" "rm /tmp/update_nginx_pablo.sh"
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    exit 0
}

# Confirmar ejecución
Write-Host ""
Write-Host "⚠️  ATENCIÓN: Esto modificará nginx en tu VPS" -ForegroundColor Yellow
Write-Host "   - Backup automático incluido" -ForegroundColor White
Write-Host "   - Solo añade pablocabello.com" -ForegroundColor White
$confirm = Read-Host "¿Continuar? (y/N)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    ssh "$VpsUser@$VpsIP" "rm /tmp/update_nginx_pablo.sh"
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    exit 0
}

# Ejecutar script en VPS
Write-Host ""
Write-Host "🚀 Ejecutando script en VPS..." -ForegroundColor Green
ssh "$VpsUser@$VpsIP" "sudo /tmp/update_nginx_pablo.sh"

$exitCode = $LASTEXITCODE

# Limpiar archivos temporales
ssh "$VpsUser@$VpsIP" "rm /tmp/update_nginx_pablo.sh" -ErrorAction SilentlyContinue
Remove-Item $tempFile -ErrorAction SilentlyContinue

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡NGINX ACTUALIZADO CORRECTAMENTE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Obtener certificados SSL:" -ForegroundColor White
    Write-Host "      ssh $VpsUser@$VpsIP 'sudo certbot --nginx -d pablocabello.com -d www.pablocabello.com'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Construir contenedor:" -ForegroundColor White
    Write-Host "      docker-compose build && docker-compose up -d" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Verificar:" -ForegroundColor White  
    Write-Host "      curl -k https://pablocabello.com/health" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Error en la ejecución" -ForegroundColor Red
    exit 1
}
