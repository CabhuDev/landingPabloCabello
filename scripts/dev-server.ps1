# Pablo Cabello - Script de desarrollo local
# PowerShell version con mejor control de procesos

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   Pablo Cabello - Desarrollo Local" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verificando dependencias..." -ForegroundColor Green

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no encontrado. Instala desde: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar Python
try {
    $pythonVersion = python --version
    Write-Host "✓ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python no encontrado. Instala desde: https://python.org/" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar uvicorn
try {
    python -m uvicorn --version | Out-Null
    Write-Host "✓ Uvicorn disponible" -ForegroundColor Green
} catch {
    Write-Host "⚠ Instalando uvicorn..." -ForegroundColor Yellow
    pip install uvicorn
}

# Verificar serve
try {
    npx http-server --version | Out-Null
    Write-Host "✓ Http-server disponible" -ForegroundColor Green
} catch {
    Write-Host "⚠ Http-server se instalará automáticamente con npx" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Iniciando servidores..." -ForegroundColor Yellow
Write-Host "- Backend (FastAPI): http://localhost:8000" -ForegroundColor White
Write-Host "- Frontend (Http-server): Puerto automático (ver ventana http-server)" -ForegroundColor White
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Crear directorio logs si no existe
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Función para matar procesos al salir
function Stop-DevServers {
    Write-Host ""
    Write-Host "Deteniendo servidores..." -ForegroundColor Yellow
    
    # Matar procesos por puerto
    Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "✓ Servidores detenidos" -ForegroundColor Green
    exit 0
}

# Registrar función de limpieza al salir
Register-EngineEvent PowerShell.Exiting -Action { Stop-DevServers }

# Iniciar Backend
Write-Host "🚀 Iniciando Backend..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" -WindowStyle Normal -PassThru

# Esperar un momento
Start-Sleep -Seconds 3

# Iniciar Frontend (puerto automático)
Write-Host "🚀 Iniciando Frontend..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d frontend && npx serve . --cors" -WindowStyle Normal -PassThru

# Esperar a que los servicios estén listos
Write-Host ""
Write-Host "Esperando a que los servidores estén listos..." -ForegroundColor Yellow

$backendReady = $false
$frontendReady = $false
$timeout = 30

for ($i = 0; $i -lt $timeout; $i++) {
    if (!$backendReady) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 1 -ErrorAction Stop
            $backendReady = $true
            Write-Host "✓ Backend listo" -ForegroundColor Green
        } catch {
            # Backend aún no está listo
        }
    }
    
    if (!$frontendReady) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 1 -ErrorAction Stop
            $frontendReady = $true
            Write-Host "✓ Frontend listo" -ForegroundColor Green
        } catch {
            # Frontend aún no está listo
        }
    }
    
    if ($backendReady -and $frontendReady) {
        break
    }
    
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   SERVIDORES INICIADOS ✅" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Presiona 'q' para detener o 'o' para abrir navegador" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan

# Abrir navegador automáticamente
Start-Process "http://localhost:3000"

# Esperar input del usuario
do {
    $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    switch ($key.Character) {
        'q' { 
            Stop-DevServers
        }
        'o' { 
            Start-Process "http://localhost:3000"
            Write-Host "🌐 Navegador abierto" -ForegroundColor Green
        }
    }
} while ($true)