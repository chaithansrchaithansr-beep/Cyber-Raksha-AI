@echo off
TITLE CYBER RAKSHA AI - Launching Full-Stack Platform
echo =========================================================================
echo                CYBER RAKSHA AI - DEFENSE PLATFORM
echo      National Cyber Threat Intelligence ^& Digital Scam Protection
echo =========================================================================
echo.

:: Start Backend in new window
echo [1/2] Starting Cyber Raksha FastAPI Backend on http://localhost:8000...
start "Cyber Raksha Backend" cmd /k "cd /d %~dp0backend && set PYTHONPATH=.&& python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait 3 seconds for DB initialization
timeout /t 3 /nobreak >nul

:: Start Frontend in new window
echo [2/2] Starting Cyber Raksha Vite React Frontend on http://localhost:5173...
start "Cyber Raksha Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =========================================================================
echo  CYBER RAKSHA AI is now launching!
echo  Backend:  http://localhost:8000 (API Docs: http://localhost:8000/docs)
echo  Frontend: http://localhost:5173
echo  
echo  Default Initial Accounts (or register on the register page):
echo    - Citizen:      citizen@cyberraksha.gov.in (Citizen@123)
echo    - Organization: org@infosec-defense.in (OrgAdmin@123)
echo    - Admin:        admin@cyberraksha.gov.in (CyberRaksha@Admin2026)
echo =========================================================================
echo.
echo Opening browser to http://localhost:5173...
timeout /t 2 /nobreak >nul
start http://localhost:5173
pause
