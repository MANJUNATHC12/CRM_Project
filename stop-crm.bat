@echo off
title NexusCRM - Stop Servers
color 0C

echo.
echo  ================================================
echo   Stopping NexusCRM Servers...
echo  ================================================
echo.

echo  Stopping Frontend (Node.js)...
taskkill /F /IM node.exe /T >nul 2>&1
echo  [OK] Frontend stopped.

echo  Stopping Backend (dotnet)...
taskkill /F /IM dotnet.exe /T >nul 2>&1
echo  [OK] Backend stopped.

echo.
echo  ================================================
echo   All servers have been shut down. Goodbye!
echo  ================================================
echo.
pause
