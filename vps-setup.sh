#!/bin/bash

# Script de configuración inicial del VPS
# Para ejecutar en el servidor: ssh root@31.97.36.248 'bash -s' < vps-setup.sh

echo "🚀 Configurando VPS para Pablo Cabello - Aparejador"

# Actualizar sistema
apt-get update && apt-get upgrade -y

# Instalar dependencias básicas
apt-get install -y curl wget git ufw htop

# Instalar Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Añadir usuario actual al grupo docker
    usermod -aG docker $USER
else
    echo "✅ Docker ya está instalado"
fi

# Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Instalando Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose ya está instalado"
fi

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Crear directorios
echo "📁 Creando directorios..."
mkdir -p /opt/pablo-cabello/{logs,data,backups}

# Configurar logrotate
cat > /etc/logrotate.d/pablo-cabello << 'EOF'
/opt/pablo-cabello/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 root root
}
EOF

# Configurar cron para backups automáticos
cat > /etc/cron.d/pablo-cabello-backup << 'EOF'
# Backup diario a las 3 AM
0 3 * * * root /opt/pablo-cabello/docker/backup.sh
EOF

echo "✅ VPS configurado correctamente"
echo "📝 Próximos pasos:"
echo "1. Clonar el repositorio en /opt/pablo-cabello"
echo "2. Configurar variables de entorno (.env)"
echo "3. Ejecutar ./docker-deploy.sh"