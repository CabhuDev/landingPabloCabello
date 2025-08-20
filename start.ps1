# Pablo Cabello - Script de Inicio Rápido
# Selecciona entre desarrollo local o producción

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   Pablo Cabello - Inicio Rápido" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "¿Qué deseas hacer?" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 DESARROLLO:" -ForegroundColor Blue
Write-Host "1. 🏠 Testing local (docker en localhost:8080)"
Write-Host "2. 🔍 Utilidades y monitoreo"
Write-Host ""
Write-Host "🚀 PRODUCCIÓN:" -ForegroundColor Green
Write-Host "3. 🌐 Deploy a producción (pablocabello.com)"
Write-Host "4. 📊 Estado del sistema en vivo"
Write-Host ""
Write-Host "5. ❌ Salir"
Write-Host ""

$choice = Read-Host "Elige una opción (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🏠 Iniciando testing local..." -ForegroundColor Blue
        & ".\scripts\docker-local.ps1"
    }
    
    "2" {
        Write-Host ""
        Write-Host "🔍 Abriendo utilidades..." -ForegroundColor Blue
        & ".\scripts\utilities.ps1"
    }
    
    "3" {
        Write-Host ""
        Write-Host "🚀 Iniciando deploy a producción..." -ForegroundColor Green
        & ".\scripts\deploy-production.ps1"
    }
    
    "4" {
        Write-Host ""
        Write-Host "📊 Verificando estado del sistema..." -ForegroundColor Green
        & ".\scripts\utilities.ps1"
    }
    
    "5" {
        Write-Host "👋 ¡Hasta luego!" -ForegroundColor Green
        exit 0
    }
    
    default {
        Write-Host "❌ Opción no válida" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
    }
}
