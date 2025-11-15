# SurfSense Development Startup Script
# This script starts all required services for development

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SurfSense Development Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "surfsense_backend") -or -not (Test-Path "surfsense_web")) {
    Write-Host "Error: This script must be run from the SurfSense root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Function to check if a port is already in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Check for existing processes on required ports
Write-Host "Checking for existing services..." -ForegroundColor Yellow

if (Test-Port -Port 8000) {
    Write-Host "  ⚠️  Port 8000 (Backend) is already in use" -ForegroundColor Yellow
    $response = Read-Host "  Do you want to continue anyway? (y/n)"
    if ($response -ne "y") {
        exit 0
    }
}

if (Test-Port -Port 4000) {
    Write-Host "  ⚠️  Port 4000 (Frontend) is already in use" -ForegroundColor Yellow
    $response = Read-Host "  Do you want to continue anyway? (y/n)"
    if ($response -ne "y") {
        exit 0
    }
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "🚀 Starting Backend Server (port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\surfsense_backend'; Write-Host 'Backend Server - Port 8000' -ForegroundColor Green; Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow; Write-Host ''; uv run main.py --reload"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start Frontend Server
Write-Host "🚀 Starting Frontend Server (port 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\surfsense_web'; Write-Host 'Frontend Server - Port 4000' -ForegroundColor Green; Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow; Write-Host ''; `$env:PORT='4000'; pnpm run dev"

# Ask about Celery services
Write-Host ""
Write-Host "Do you want to start Celery services (Worker & Beat)?" -ForegroundColor Yellow
Write-Host "  These are needed for:" -ForegroundColor Gray
Write-Host "    - Document processing" -ForegroundColor Gray
Write-Host "    - Background tasks" -ForegroundColor Gray
Write-Host "    - Scheduled connector indexing" -ForegroundColor Gray
Write-Host ""
$startCelery = Read-Host "Start Celery services? (y/n)"

if ($startCelery -eq "y" -or $startCelery -eq "Y") {
    # Start Celery Worker
    Write-Host "🚀 Starting Celery Worker..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\surfsense_backend'; Write-Host 'Celery Worker' -ForegroundColor Green; Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow; Write-Host ''; uv run celery -A celery_worker.celery_app worker --loglevel=info --concurrency=1 --pool=solo"
    
    Start-Sleep -Seconds 1
    
    # Start Celery Beat
    Write-Host "🚀 Starting Celery Beat..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\surfsense_backend'; Write-Host 'Celery Beat Scheduler' -ForegroundColor Green; Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow; Write-Host ''; uv run celery -A celery_worker.celery_app beat --loglevel=info"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor White
Write-Host "  • Backend API:    http://localhost:8000" -ForegroundColor Cyan
Write-Host "  • API Docs:       http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  • Frontend:       http://localhost:4000" -ForegroundColor Cyan
if ($startCelery -eq "y" -or $startCelery -eq "Y") {
    Write-Host "  • Celery Worker:  Running" -ForegroundColor Cyan
    Write-Host "  • Celery Beat:    Running" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Each service is running in its own window." -ForegroundColor Yellow
Write-Host "Close the windows or press Ctrl+C to stop individual services." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this script (services will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

