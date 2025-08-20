# Pablo Cabello - Script de despliegue Docker local
# PowerShell version para testing local antes de producción

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   Pablo Cabello - Docker Local Testing" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$ImageName = "pablo-cabello-web"
$ContainerName = "pablo-cabello-local"
$Tag = "latest"
$LocalPort = "8080"

# Verificar Docker
Write-Host "Verificando Docker..." -ForegroundColor Green
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker no encontrado. Instala Docker Desktop desde: https://docker.com/get-started" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar que Docker está corriendo
try {
    docker info | Out-Null
    Write-Host "✓ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker no está corriendo. Inicia Docker Desktop" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "Opciones disponibles:" -ForegroundColor Yellow
Write-Host "1. Construir imagen Docker" -ForegroundColor White
Write-Host "2. Ejecutar contenedor" -ForegroundColor White
Write-Host "3. Construir y ejecutar (completo)" -ForegroundColor White
Write-Host "4. Detener contenedor" -ForegroundColor White
Write-Host "5. Ver logs" -ForegroundColor White
Write-Host "6. Limpiar (detener y eliminar)" -ForegroundColor White
Write-Host "7. Salir" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Selecciona una opción (1-7)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔨 Construyendo imagen Docker..." -ForegroundColor Blue
        
        # Detener contenedor si existe
        $existingContainer = docker ps -a -q -f name=$ContainerName
        if ($existingContainer) {
            Write-Host "Deteniendo contenedor existente..." -ForegroundColor Yellow
            docker stop $ContainerName
            docker rm $ContainerName
        }
        
        # Construir imagen
        docker build -t "${ImageName}:${Tag}" .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Imagen construida exitosamente" -ForegroundColor Green
            
            # Mostrar información de la imagen
            Write-Host ""
            Write-Host "Información de la imagen:" -ForegroundColor Blue
            docker images $ImageName
        } else {
            Write-Host "❌ Error al construir la imagen" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 Ejecutando contenedor..." -ForegroundColor Blue
        
        # Verificar si la imagen existe
        $imageExists = docker images -q "${ImageName}:${Tag}"
        if (-not $imageExists) {
            Write-Host "❌ La imagen no existe. Construye primero la imagen (opción 1)" -ForegroundColor Red
            break
        }
        
        # Detener contenedor si ya existe
        $existingContainer = docker ps -a -q -f name=$ContainerName
        if ($existingContainer) {
            Write-Host "Deteniendo contenedor existente..." -ForegroundColor Yellow
            docker stop $ContainerName
            docker rm $ContainerName
        }
        
        # Crear directorios locales si no existen
        $LogsDir = ".\logs"
        $DataDir = ".\data"
        if (!(Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }
        if (!(Test-Path $DataDir)) { New-Item -ItemType Directory -Path $DataDir | Out-Null }
        
        # Ejecutar contenedor
        docker run -d `
            --name $ContainerName `
            -p "${LocalPort}:80" `
            -v "${PWD}\logs:/app/logs" `
            -v "${PWD}\data:/app/data" `
            -e ENV=development `
            -e DEBUG=true `
            "${ImageName}:${Tag}"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Contenedor iniciado exitosamente" -ForegroundColor Green
            Write-Host ""
            Write-Host "🌐 Aplicación disponible en: http://localhost:$LocalPort" -ForegroundColor Cyan
            Write-Host "📋 API Docs: http://localhost:$LocalPort/docs" -ForegroundColor Cyan
            Write-Host "� Health Check: http://localhost:$LocalPort/health" -ForegroundColor Cyan
            
            # Esperar a que esté listo
            Write-Host ""
            Write-Host "Esperando a que la aplicación esté lista..." -ForegroundColor Yellow
            
            $ready = $false
            $timeout = 30
            for ($i = 0; $i -lt $timeout; $i++) {
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:$Port" -TimeoutSec 2 -ErrorAction Stop
                    $ready = $true
                    break
                } catch {
                    Start-Sleep -Seconds 1
                }
            }
            
            if ($ready) {
                Write-Host "✅ Aplicación lista!" -ForegroundColor Green
                $openBrowser = Read-Host "¿Abrir en navegador? (y/N)"
                if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
                    Start-Process "http://localhost:$Port"
                }
            } else {
                Write-Host "⚠️ La aplicación tardó en estar lista. Verifica los logs." -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Error al ejecutar el contenedor" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🔨🚀 Construyendo y ejecutando..." -ForegroundColor Blue
        
        # Detener contenedor si existe
        $existingContainer = docker ps -a -q -f name=$ContainerName
        if ($existingContainer) {
            Write-Host "Deteniendo contenedor existente..." -ForegroundColor Yellow
            docker stop $ContainerName
            docker rm $ContainerName
        }
        
        # Construir imagen
        Write-Host "Construyendo imagen..." -ForegroundColor Blue
        docker build -t "${ImageName}:${Tag}" .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Imagen construida" -ForegroundColor Green
            
            # Crear directorios locales
            $LogsDir = ".\logs"
            $DataDir = ".\data"
            if (!(Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }
            if (!(Test-Path $DataDir)) { New-Item -ItemType Directory -Path $DataDir | Out-Null }
            
            # Ejecutar contenedor
            Write-Host "Ejecutando contenedor..." -ForegroundColor Blue
            docker run -d `
                --name $ContainerName `
                -p "${Port}:80" `
                -v "${PWD}\logs:/app/logs" `
                -v "${PWD}\data:/app/data" `
                -e ENV=development `
                -e DEBUG=true `
                "${ImageName}:${Tag}"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Despliegue completo exitoso!" -ForegroundColor Green
                Write-Host ""
                Write-Host "🌐 Aplicación disponible en: http://localhost:$Port" -ForegroundColor Cyan
                Write-Host "📋 API Docs: http://localhost:$Port/docs" -ForegroundColor Cyan
                
                # Abrir navegador automáticamente
                Start-Sleep -Seconds 3
                Start-Process "http://localhost:$Port"
            }
        } else {
            Write-Host "❌ Error en el build" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "🛑 Deteniendo contenedor..." -ForegroundColor Yellow
        
        $containerExists = docker ps -q -f name=$ContainerName
        if ($containerExists) {
            docker stop $ContainerName
            Write-Host "✅ Contenedor detenido" -ForegroundColor Green
        } else {
            Write-Host "ℹ️ No hay contenedor corriendo" -ForegroundColor Blue
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "📋 Mostrando logs..." -ForegroundColor Blue
        
        $containerExists = docker ps -a -q -f name=$ContainerName
        if ($containerExists) {
            docker logs -f $ContainerName
        } else {
            Write-Host "❌ No existe el contenedor" -ForegroundColor Red
        }
    }
    
    "6" {
        Write-Host ""
        Write-Host "🧹 Limpiando..." -ForegroundColor Yellow
        
        # Detener y eliminar contenedor
        $containerExists = docker ps -a -q -f name=$ContainerName
        if ($containerExists) {
            docker stop $ContainerName
            docker rm $ContainerName
            Write-Host "✅ Contenedor eliminado" -ForegroundColor Green
        }
        
        # Preguntar si eliminar imagen
        $removeImage = Read-Host "¿Eliminar también la imagen? (y/N)"
        if ($removeImage -eq "y" -or $removeImage -eq "Y") {
            docker rmi "${ImageName}:${Tag}" -f
            Write-Host "✅ Imagen eliminada" -ForegroundColor Green
        }
        
        # Limpiar imágenes huérfanas
        docker image prune -f
        Write-Host "✅ Limpieza completa" -ForegroundColor Green
    }
    
    "7" {
        Write-Host "👋 ¡Hasta luego!" -ForegroundColor Green
        exit 0
    }
    
    default {
        Write-Host "❌ Opción no válida" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Estado actual:" -ForegroundColor Blue
docker ps -a --filter name=$ContainerName --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Read-Host "Presiona Enter para continuar"
