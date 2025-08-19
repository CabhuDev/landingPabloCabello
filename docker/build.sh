#!/bin/bash

# Script de construcción Docker para Pablo Cabello - Aparejador
# Uso: ./build.sh [tag]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
IMAGE_NAME="pablo-cabello-web"
TAG=${1:-latest}
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}   Pablo Cabello - Docker Build${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker no está instalado${NC}"
    echo "Instala Docker desde: https://docker.com/get-started"
    exit 1
fi

# Verificar que Docker está corriendo
if ! docker info &> /dev/null; then
    echo -e "${RED}ERROR: Docker no está corriendo${NC}"
    echo "Inicia Docker Desktop o el daemon de Docker"
    exit 1
fi

echo -e "${GREEN}✓ Docker está disponible${NC}"

# Cambiar al directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Mostrar información del build
echo ""
echo -e "${BLUE}Información del build:${NC}"
echo "  Imagen: $FULL_IMAGE_NAME"
echo "  Contexto: $(pwd)"
echo "  Dockerfile: ./Dockerfile"
echo ""

# Limpiar builds anteriores (opcional)
read -p "¿Limpiar imágenes anteriores? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Limpiando imágenes anteriores...${NC}"
    docker rmi $FULL_IMAGE_NAME 2>/dev/null || true
    docker image prune -f
fi

# Construir la imagen
echo -e "${BLUE}Construyendo imagen Docker...${NC}"
echo ""

docker build \
    --tag $FULL_IMAGE_NAME \
    --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
    --build-arg VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build completado exitosamente${NC}"
    echo ""
    echo -e "${BLUE}Información de la imagen:${NC}"
    docker images $IMAGE_NAME:$TAG
    echo ""
    
    # Mostrar tamaño de la imagen
    SIZE=$(docker images $FULL_IMAGE_NAME --format "{{.Size}}")
    echo -e "${BLUE}Tamaño de la imagen: ${YELLOW}$SIZE${NC}"
    
    echo ""
    echo -e "${BLUE}Para ejecutar la imagen:${NC}"
    echo "  docker run -p 80:80 $FULL_IMAGE_NAME"
    echo ""
    echo -e "${BLUE}Para ejecutar con docker-compose:${NC}"
    echo "  docker-compose up -d"
    echo ""
    
    # Preguntar si quiere ejecutar
    read -p "¿Ejecutar la imagen ahora? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Ejecutando contenedor...${NC}"
        docker run -d -p 80:80 --name pablo-cabello-app $FULL_IMAGE_NAME
        echo -e "${GREEN}✓ Aplicación disponible en: http://localhost${NC}"
    fi
    
else
    echo ""
    echo -e "${RED}❌ Build falló${NC}"
    exit 1
fi