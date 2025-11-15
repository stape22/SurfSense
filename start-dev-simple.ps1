# SurfSense Simple Startup Script
# Starts only Backend and Frontend (minimum required)

Write-Host "Starting SurfSense (Backend + Frontend)..." -ForegroundColor Cyan

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\surfsense_backend'; uv run main.py --reload"

Start-Sleep -Seconds 2

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\surfsense_web'; `$env:PORT='3001'; pnpm run dev"

Write-Host "Services started!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3001" -ForegroundColor Cyan
