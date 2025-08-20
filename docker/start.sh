#!/bin/bash

# Script de inicio para el contenedor Docker
# Pablo Cabello - Aparejador

echo "============================================"
echo "  Pablo Cabello - Aparejador & Desarrollador"
echo "  Iniciando aplicación en puerto 8080..."
echo "  VPS: pablocabello.com"
echo "============================================"

# Crear directorios necesarios
mkdir -p /app/logs /app/data

# Configurar permisos (solo si somos root)
if [ "$(id -u)" = "0" ]; then
    chown -R appuser:appuser /app/logs /app/data 2>/dev/null || true
fi

# Verificar que los archivos de configuración existen
if [ ! -f /etc/nginx/sites-available/default ]; then
    echo "ERROR: Configuración de Nginx no encontrada"
    exit 1
fi

# Verificar que el backend existe
if [ ! -f /app/backend/app/main.py ]; then
    echo "ERROR: Backend no encontrado en /app/backend/app/main.py"
    exit 1
fi

# Verificar que el frontend existe
if [ ! -f /app/frontend/index.html ]; then
    echo "ERROR: Frontend no encontrado en /app/frontend/index.html"
    exit 1
fi

echo "✓ Verificaciones completadas"

# Configurar variables de entorno si no están definidas
export ENV=${ENV:-production}
export DEBUG=${DEBUG:-false}

echo "Entorno: $ENV"
echo "Debug: $DEBUG"

# Ejecutar migraciones de base de datos si existen
if [ -f /app/backend/migrations.py ]; then
    echo "Ejecutando migraciones de base de datos..."
    cd /app/backend
    python migrations.py
fi

# Crear usuario y configurar nginx si es necesario
if [ "$ENV" = "production" ]; then
    echo "Configurando para producción..."
    
    # Habilitar Service Worker para producción
    if [ -f /app/frontend/sw.js ]; then
        echo "✓ Service Worker disponible"
    fi
fi

echo "Iniciando servicios con Supervisor..."

# Iniciar supervisor que maneja nginx y fastapi
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf