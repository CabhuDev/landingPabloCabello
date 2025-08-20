#!/bin/bash

# Script wrapper para construcción Docker
# Pablo Cabello - Aparejador

# Verificar que estamos en el directorio correcto
if [ ! -f "Dockerfile" ]; then
    echo "Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Llamar al script de build en la carpeta docker
./docker/build.sh "$@"