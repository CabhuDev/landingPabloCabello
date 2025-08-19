#!/bin/bash

# Script wrapper para despliegue Docker
# Pablo Cabello - Aparejador

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Llamar al script de deploy en la carpeta docker
./docker/deploy.sh "$@"