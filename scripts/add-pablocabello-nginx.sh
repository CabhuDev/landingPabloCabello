#!/bin/bash

# Script para AÑADIR pablocabello.com a la configuración nginx existente
# SIN tocar la configuración de obratec.app que ya funciona
# Ejecutar como: ./add-pablocabello-nginx.sh

set -e

echo "🔧 Añadiendo pablocabello.com a configuración de Nginx en VPS..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que el archivo principal existe
if [ ! -f /etc/nginx/sites-available/obratec.app ]; then
    print_error "No se encuentra /etc/nginx/sites-available/obratec.app"
    print_error "Este script requiere que obratec.app ya esté configurado"
    exit 1
fi

# Backup de la configuración actual
print_status "Creando backup de la configuración actual..."
cp /etc/nginx/sites-available/obratec.app /etc/nginx/sites-available/obratec.app.backup.$(date +%Y%m%d_%H%M%S)

# Verificar si pablocabello.com ya está configurado
if grep -q "pablocabello.com" /etc/nginx/sites-available/obratec.app; then
    print_warning "pablocabello.com ya está configurado en nginx"
    print_status "¿Quieres sobrescribir la configuración? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Operación cancelada"
        exit 0
    fi
    
    # Remover configuración existente de pablocabello.com
    print_status "Removiendo configuración existente de pablocabello.com..."
    sed -i '/# pablocabello.com/,/^}$/d' /etc/nginx/sites-available/obratec.app
fi

# Añadir configuración de pablocabello.com al final
print_status "Añadiendo configuración de pablocabello.com..."
cat >> /etc/nginx/sites-available/obratec.app << 'EOF'

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
EOF

# Verificar sintaxis
print_status "Verificando sintaxis de nginx..."
nginx -t

if [ $? -eq 0 ]; then
    print_success "Sintaxis de nginx correcta ✓"
    
    # Recargar nginx
    print_status "Recargando nginx..."
    systemctl reload nginx
    
    print_success "🎉 ¡pablocabello.com añadido correctamente a nginx!"
    echo ""
    echo "📊 URLs disponibles:"
    echo "  Obratec Frontend: https://obratec.app"
    echo "  Obratec N8N: https://n8n.obratec.app"
    echo "  Pablo Cabello: https://pablocabello.com"
    echo ""
    echo "🔍 Verificar logs:"
    echo "  Obratec: tail -f /var/log/nginx/obratec.*.log"
    echo "  Pablo: tail -f /var/log/nginx/pablocabello.*.log"
    echo ""
    echo "📋 Próximos pasos:"
    echo "  1. Obtener certificados SSL: sudo certbot --nginx -d pablocabello.com -d www.pablocabello.com"
    echo "  2. Desplegar contenedor: docker-compose up -d"
    echo "  3. Verificar funcionamiento: curl -k https://pablocabello.com/health"
    
else
    print_error "Error en la sintaxis de nginx. Revisa la configuración."
    print_warning "Se mantiene la configuración anterior."
    exit 1
fi
