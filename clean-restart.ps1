# Clean Restart Script for SurfSense Backend
# This script ensures port 8000 is free and restarts the backend cleanly

Write-Host "Cleaning up port 8000..." -ForegroundColor Yellow

# Find and kill any processes using port 8000
$connections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "  Killing process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Red
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
}

# Verify port is free
$stillInUse = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($stillInUse) {
    Write-Host "  Warning: Port 8000 is still in use!" -ForegroundColor Red
    Write-Host "  You may need to manually close the application using it." -ForegroundColor Yellow
} else {
    Write-Host "  Port 8000 is now free!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\surfsense_backend'; Write-Host 'Backend Server - Port 8000' -ForegroundColor Green; Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow; Write-Host ''; uv run main.py --reload"

Write-Host "Backend server starting in a new window..." -ForegroundColor Green
Write-Host "Wait a few seconds for it to initialize, then check http://localhost:8000" -ForegroundColor Yellow

