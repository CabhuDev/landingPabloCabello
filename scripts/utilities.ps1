# Pablo Cabello - Utilidades de Monitoreo
# Script para verificar estado y realizar mantenimiento

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   Pablo Cabello - Monitor y Utilidades" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$VPS_HOST = "31.97.36.248"
$VPS_USER = "root"
$DOMAIN = "pablocabello.com"

Write-Host "Selecciona una utilidad:" -ForegroundColor Yellow
Write-Host "1. 🔍 Verificar estado completo del sistema"
Write-Host "2. 📊 Ver métricas de rendimiento"
Write-Host "3. 📋 Ver logs detallados"
Write-Host "4. 🌐 Test de conectividad"
Write-Host "5. 🔧 Verificar configuración nginx"
Write-Host "6. 💾 Backup de configuraciones"
Write-Host "7. ❌ Salir"
Write-Host ""

$choice = Read-Host "Elige una opción (1-7)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔍 Verificando estado completo..." -ForegroundColor Blue
        
        # Estado local
        Write-Host ""
        Write-Host "📱 Estado local:" -ForegroundColor Green
        docker-compose ps
        
        # Conectividad local
        Write-Host ""
        Write-Host "🔗 Conectividad local:" -ForegroundColor Green
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -UseBasicParsing
            Write-Host "✅ HTTP: $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "❌ HTTP: No responde" -ForegroundColor Red
        }
        
        # Estado VPS
        Write-Host ""
        Write-Host "🌐 Estado VPS:" -ForegroundColor Green
        ssh $VPS_USER@$VPS_HOST "systemctl status nginx | grep 'Active:'"
        ssh $VPS_USER@$VPS_HOST "curl -I http://127.0.0.1:8080 2>/dev/null | head -1"
        
        # Test público
        Write-Host ""
        Write-Host "🌍 Test público:" -ForegroundColor Green
        try {
            $response = Invoke-WebRequest -Uri "https://$DOMAIN" -TimeoutSec 10 -UseBasicParsing
            Write-Host "✅ $DOMAIN: $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "❌ $DOMAIN: Error - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "📊 Métricas de rendimiento:" -ForegroundColor Blue
        
        # Uso de recursos locales
        Write-Host ""
        Write-Host "💻 Recursos locales:" -ForegroundColor Green
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        
        # Espacio en disco
        Write-Host ""
        Write-Host "💾 Espacio en disco VPS:" -ForegroundColor Green
        ssh $VPS_USER@$VPS_HOST "df -h | grep -E '(Filesystem|/dev/root)'"
        
        # Logs de tamaño
        Write-Host ""
        Write-Host "📋 Tamaño de logs:" -ForegroundColor Green
        ssh $VPS_USER@$VPS_HOST "ls -lh /var/log/nginx/*pablo* 2>/dev/null || echo 'No hay logs específicos de pablocabello'"
    }
    
    "3" {
        Write-Host ""
        Write-Host "📋 Logs detallados:" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Selecciona qué logs ver:" -ForegroundColor Yellow
        Write-Host "1. Logs del contenedor pablo-cabello"
        Write-Host "2. Logs de nginx (acceso)"
        Write-Host "3. Logs de nginx (errores)"
        Write-Host "4. Todos los logs"
        Write-Host ""
        
        $logChoice = Read-Host "Elige (1-4)"
        
        switch ($logChoice) {
            "1" {
                Write-Host "📋 Logs del contenedor:" -ForegroundColor Green
                docker-compose logs -f --tail=50
            }
            "2" {
                Write-Host "📋 Logs de nginx (acceso):" -ForegroundColor Green
                ssh $VPS_USER@$VPS_HOST "tail -f /var/log/nginx/pablocabello.access.log 2>/dev/null || tail -f /var/log/nginx/access.log"
            }
            "3" {
                Write-Host "📋 Logs de nginx (errores):" -ForegroundColor Green
                ssh $VPS_USER@$VPS_HOST "tail -f /var/log/nginx/pablocabello.error.log 2>/dev/null || tail -f /var/log/nginx/error.log"
            }
            "4" {
                Write-Host "📋 Todos los logs (Ctrl+C para salir):" -ForegroundColor Green
                Start-Job -ScriptBlock { docker-compose logs -f }
                ssh $VPS_USER@$VPS_HOST "tail -f /var/log/nginx/*.log"
            }
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "🌐 Test de conectividad completo:" -ForegroundColor Blue
        
        $urls = @(
            "http://localhost:8080",
            "https://$DOMAIN",
            "https://www.$DOMAIN"
        )
        
        foreach ($url in $urls) {
            try {
                $params = @{
                    Uri = $url
                    TimeoutSec = 10
                    UseBasicParsing = $true
                }
                
                $response = Invoke-WebRequest @params
                Write-Host "✅ $url : $($response.StatusCode)" -ForegroundColor Green
            } catch {
                Write-Host "❌ $url : Error" -ForegroundColor Red
            }
        }
        
        # Test desde VPS
        Write-Host ""
        Write-Host "🔍 Test desde VPS:" -ForegroundColor Blue
        ssh $VPS_USER@$VPS_HOST "curl -I http://127.0.0.1:8080"
    }
    
    "5" {
        Write-Host ""
        Write-Host "🔧 Verificando configuración nginx:" -ForegroundColor Blue
        
        ssh $VPS_USER@$VPS_HOST "nginx -t"
        
        Write-Host ""
        Write-Host "📋 Configuración actual:" -ForegroundColor Blue
        ssh $VPS_USER@$VPS_HOST "grep -A 10 -B 2 'pablocabello.com' /etc/nginx/sites-available/obratec.app"
    }
    
    "6" {
        Write-Host ""
        Write-Host "💾 Creando backup de configuraciones..." -ForegroundColor Blue
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        
        # Backup nginx
        ssh $VPS_USER@$VPS_HOST "cp /etc/nginx/sites-available/obratec.app /etc/nginx/sites-available/obratec.app.backup.$timestamp"
        
        # Backup local
        Copy-Item "docker-compose.yml" "docker-compose.yml.backup.$timestamp"
        Copy-Item "Dockerfile" "Dockerfile.backup.$timestamp"
        
        Write-Host "✅ Backups creados:" -ForegroundColor Green
        Write-Host "   VPS: /etc/nginx/sites-available/obratec.app.backup.$timestamp" -ForegroundColor Cyan
        Write-Host "   Local: docker-compose.yml.backup.$timestamp" -ForegroundColor Cyan
        Write-Host "   Local: Dockerfile.backup.$timestamp" -ForegroundColor Cyan
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
