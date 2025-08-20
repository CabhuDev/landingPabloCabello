# Pablo Cabello - Script de Despliegue de Producción
# Despliega el proyecto usando docker-compose en el VPS
# Version: 2.0 - Actualizada para proyecto pablocabello.com

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   Pablo Cabello - Production Deploy" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Variables de configuración
$VPS_HOST = "31.97.36.248"
$VPS_USER = "root"
$PROJECT_NAME = "pablo-cabello"
$DOMAIN = "pablocabello.com"

# Verificar conexión SSH
Write-Host "🔐 Verificando conexión SSH..." -ForegroundColor Blue
try {
    $sshTest = ssh $VPS_USER@$VPS_HOST "echo 'Conexión exitosa'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexión SSH establecida" -ForegroundColor Green
    } else {
        throw "Error de conexión"
    }
} catch {
    Write-Host "❌ Error de conexión SSH. Verifica:" -ForegroundColor Red
    Write-Host "   • Clave SSH configurada" -ForegroundColor Yellow
    Write-Host "   • VPS accesible ($VPS_HOST)" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "Selecciona una opción:" -ForegroundColor Yellow
Write-Host "1. 🔨 Build y Deploy completo"
Write-Host "2. 🚀 Deploy solamente (usar imagen existente)"
Write-Host "3. 📊 Ver estado de contenedores"
Write-Host "4. 🔄 Reiniciar servicios"
Write-Host "5. 📋 Ver logs"
Write-Host "6. 🛑 Detener servicios"
Write-Host "7. ❌ Salir"
Write-Host ""

$choice = Read-Host "Elige una opción (1-7)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔨 Iniciando Build y Deploy completo..." -ForegroundColor Blue
        
        # Build local
        Write-Host "Construyendo imagen localmente..." -ForegroundColor Green
        docker-compose build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build completado" -ForegroundColor Green
            
            # Deploy
            Write-Host "Iniciando contenedores..." -ForegroundColor Green
            docker-compose up -d
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Deploy exitoso" -ForegroundColor Green
                Write-Host ""
                Write-Host "🌐 Sitio disponible en: https://$DOMAIN" -ForegroundColor Cyan
                Write-Host "📊 Verificando estado..." -ForegroundColor Blue
                docker-compose ps
            } else {
                Write-Host "❌ Error en el deploy" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Error en el build" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 Iniciando deploy..." -ForegroundColor Blue
        docker-compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deploy exitoso" -ForegroundColor Green
            Write-Host ""
            Write-Host "🌐 Sitio disponible en: https://$DOMAIN" -ForegroundColor Cyan
            docker-compose ps
        } else {
            Write-Host "❌ Error en el deploy" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "📊 Estado de contenedores:" -ForegroundColor Blue
        docker-compose ps
        
        Write-Host ""
        Write-Host "🔍 Verificando conectividad..." -ForegroundColor Blue
        
        # Test local
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -UseBasicParsing
            Write-Host "✅ Contenedor local respondiendo (HTTP $($response.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "❌ Contenedor local no responde" -ForegroundColor Red
        }
        
        # Test desde VPS
        Write-Host "Verificando desde VPS..." -ForegroundColor Blue
        ssh $VPS_USER@$VPS_HOST "curl -I http://127.0.0.1:8080 2>/dev/null | head -1"
    }
    
    "4" {
        Write-Host ""
        Write-Host "🔄 Reiniciando servicios..." -ForegroundColor Blue
        docker-compose restart
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Servicios reiniciados" -ForegroundColor Green
            docker-compose ps
        } else {
            Write-Host "❌ Error al reiniciar" -ForegroundColor Red
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "📋 Logs del contenedor:" -ForegroundColor Blue
        Write-Host "Presiona Ctrl+C para salir de los logs" -ForegroundColor Yellow
        Write-Host ""
        docker-compose logs -f
    }
    
    "6" {
        Write-Host ""
        Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Blue
        docker-compose down
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Servicios detenidos" -ForegroundColor Green
        } else {
            Write-Host "❌ Error al detener servicios" -ForegroundColor Red
        }
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
Read-Host "Presiona Enter para continuar"
