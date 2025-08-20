#!/bin/bash

# Script de despliegue para Pablo Cabello - Aparejador
# Para usar en VPS/servidor de producción

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables de configuración
IMAGE_NAME="pablo-cabello-web"
CONTAINER_NAME="pablo-cabello-app"
BACKUP_DIR="/opt/pablo-cabello/backups"
DATA_DIR="/opt/pablo-cabello/data"
LOGS_DIR="/opt/pablo-cabello/logs"

echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}   Pablo Cabello - Despliegue Producción${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Verificar que estamos en el servidor correcto
echo -e "${BLUE}Verificando servidor...${NC}"
if [ -z "$PABLO_PRODUCTION_SERVER" ]; then
    echo -e "${YELLOW}⚠️  Variable PABLO_PRODUCTION_SERVER no está definida${NC}"
    read -p "¿Confirmas que estás en el servidor de producción? (yes/no): " -r
    if [ "$REPLY" != "yes" ]; then
        echo "Despliegue cancelado"
        exit 1
    fi
fi

# Cambiar al directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Crear directorios necesarios
echo -e "${BLUE}Creando directorios...${NC}"
sudo mkdir -p $BACKUP_DIR $DATA_DIR $LOGS_DIR
sudo chown -R $USER:$USER $DATA_DIR $LOGS_DIR

# Hacer backup de la aplicación actual si existe
if docker ps -a | grep -q $CONTAINER_NAME; then
    echo -e "${BLUE}Creando backup...${NC}"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/pablo-cabello-backup-$TIMESTAMP.tar.gz"
    
    # Backup de datos
    sudo tar -czf $BACKUP_FILE -C / opt/pablo-cabello/data 2>/dev/null || true
    echo -e "${GREEN}✓ Backup creado: $BACKUP_FILE${NC}"
    
    # Mantener solo los últimos 5 backups
    sudo find $BACKUP_DIR -name "pablo-cabello-backup-*.tar.gz" -type f -printf '%T@ %p\n' | sort -n | head -n -5 | cut -d' ' -f2- | sudo xargs rm -f
fi

# Detener contenedor existente
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${BLUE}Deteniendo contenedor actual...${NC}"
    docker stop $CONTAINER_NAME
fi

# Remover contenedor existente
if docker ps -a | grep -q $CONTAINER_NAME; then
    echo -e "${BLUE}Removiendo contenedor anterior...${NC}"
    docker rm $CONTAINER_NAME
fi

# Limpiar imágenes no utilizadas
echo -e "${BLUE}Limpiando imágenes obsoletas...${NC}"
docker image prune -f

# Ejecutar nuevo contenedor con docker-compose
echo -e "${BLUE}Desplegando nueva versión...${NC}"
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose up -d --build

# Verificar que el contenedor está corriendo
echo -e "${BLUE}Verificando despliegue...${NC}"
sleep 10

if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Despliegue exitoso${NC}"
    
    # Verificar que la aplicación responde
    for i in {1..30}; do
        if curl -f -s http://localhost/health > /dev/null; then
            echo -e "${GREEN}✓ Aplicación respondiendo correctamente${NC}"
            break
        fi
        
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ La aplicación no responde después de 30 intentos${NC}"
            echo "Logs del contenedor:"
            docker-compose logs --tail=50
            exit 1
        fi
        
        echo "Esperando que la aplicación esté lista... ($i/30)"
        sleep 2
    done
    
    echo ""
    echo -e "${GREEN}🎉 Despliegue completado exitosamente${NC}"
    echo ""
    echo -e "${BLUE}Información del despliegue:${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}Para ver logs:${NC}"
    echo "  docker-compose logs -f"
    echo ""
    echo -e "${BLUE}Para acceder al contenedor:${NC}"
    echo "  docker-compose exec web bash"
    echo ""
    
    # Mostrar estadísticas
    echo -e "${BLUE}Uso de recursos:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
else
    echo -e "${RED}❌ Error en el despliegue${NC}"
    echo "Logs del contenedor:"
    docker-compose logs --tail=50
    
    # Intentar rollback si hay backup
    if [ -f "$BACKUP_FILE" ]; then
        echo ""
        read -p "¿Quieres hacer rollback al backup anterior? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}Haciendo rollback...${NC}"
            # Aquí implementarías la lógica de rollback
            echo -e "${YELLOW}Rollback no implementado aún${NC}"
        fi
    fi
    
    exit 1
fi