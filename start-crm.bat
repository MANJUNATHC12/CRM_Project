@echo off
title NexusCRM Launcher
color 0A

echo.
echo  ================================================
echo    _   _                   _____ ____  __  __
echo   ^| ^\ ^| ^| _____  ___   _ ___/ __/   ^|  \/  ^|
echo   ^|  \^| ^|/ _ \ \/ / ^| ^| / /_\ \ ^|  ^| ^|\/^| ^|
echo   ^| ^|\  ^|  __/^>  ^<^| ^|_^| / /___^\ \ ^|__^| ^|  ^| ^|
echo   ^|_^| \_^\___/_/\_^\__,_/_____\____^|_^|  ^|_^|
echo.
echo   Enterprise CRM — Starting All Services...
echo  ================================================
echo.

:: ── Check Node.js ──
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

:: ── Check .NET ──
where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] .NET SDK not found! Please install .NET 7 SDK first.
    pause
    exit /b 1
)

echo  [1/2] Starting Backend  (ASP.NET Core - http://localhost:5146) ...
start "NexusCRM Backend" cmd /k "color 0B && title NexusCRM Backend && cd /d C:\Users\navee\Downloads\Manjunath\CRMproject\backend && echo Starting backend... && dotnet run --launch-profile http"

:: Wait a moment so backend gets a head start
timeout /t 3 /nobreak >nul

echo  [2/2] Starting Frontend (React Vite   - http://localhost:5173) ...
start "NexusCRM Frontend" cmd /k "color 0E && title NexusCRM Frontend && cd /d C:\Users\navee\Downloads\Manjunath\CRMproject\frontend && echo Starting frontend... && npm run dev"

echo.
echo  ================================================
echo   Both servers are starting up!
echo.
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:5146
echo   API Docs : http://localhost:5146/swagger
echo.
echo   Close the server windows to stop the servers.
echo  ================================================
echo.

:: Auto-open browser after 5 seconds
echo  Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"

exit
