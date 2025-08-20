#!/bin/bash
# Script para generar certificados SSL autofirmados para desarrollo

echo "🔐 Generando certificados SSL autofirmados para pablocabello.com..."

# Crear directorio de certificados si no existe
mkdir -p /app/certs

# Generar clave privada
openssl genrsa -out /app/certs/privkey.pem 2048

# Generar certificado autofirmado
openssl req -new -x509 -key /app/certs/privkey.pem -out /app/certs/fullchain.pem -days 365 \
    -subj "/C=ES/ST=Madrid/L=Madrid/O=Pablo Cabello/OU=Aparejador/CN=pablocabello.com/emailAddress=admin@pablocabello.com" \
    -addext "subjectAltName=DNS:pablocabello.com,DNS:www.pablocabello.com,DNS:localhost"

# Configurar permisos
chmod 600 /app/certs/privkey.pem
chmod 644 /app/certs/fullchain.pem

echo "✅ Certificados SSL generados en /app/certs/"
echo "⚠️  NOTA: Estos son certificados autofirmados para desarrollo"
echo "🌐 Para producción, usar Let's Encrypt o certificados comerciales"
