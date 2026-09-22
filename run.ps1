# =========================================================================
#                CYBER RAKSHA AI - DEFENSE PLATFORM
#      National Cyber Threat Intelligence & Digital Scam Protection
# =========================================================================

$Host.UI.RawUI.WindowTitle = "CYBER RAKSHA AI - Launching Platform"

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "               CYBER RAKSHA AI - DEFENSE PLATFORM" -ForegroundColor White
Write-Host "     National Cyber Threat Intelligence & Digital Scam Protection" -ForegroundColor Gray
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Verify Prerequisites
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Python is not found on PATH. Please install Python 3.10+." -ForegroundColor Red
    pause
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js / npm is not found on PATH. Please install Node 18+." -ForegroundColor Red
    pause
    exit 1
}

# 2. Launch Backend in new window
Write-Host "[1/2] Starting Cyber Raksha FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
$backendCmd = "cd '$root\backend'; `$env:PYTHONPATH='.'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$backendCmd"

# Wait for backend DB initialization
Start-Sleep -Seconds 3

# 3. Launch Frontend in new window
Write-Host "[2/2] Starting Cyber Raksha Vite React Frontend on http://localhost:5173..." -ForegroundColor Yellow
$frontendCmd = "cd '$root\frontend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$frontendCmd"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "  CYBER RAKSHA AI platform is running!" -ForegroundColor Green
Write-Host "  Backend API:  http://localhost:8000 (Swagger: http://localhost:8000/docs)" -ForegroundColor White
Write-Host "  Frontend App: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  Default Initial Accounts (or register your own account on the register page):
    - Citizen:      citizen@cyberraksha.gov.in (Citizen@123)
    - Organization: org@infosec-defense.in (OrgAdmin@123)
    - Admin:        admin@cyberraksha.gov.in (CyberRaksha@Admin2026)
=====================================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Launching platform in default browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"
