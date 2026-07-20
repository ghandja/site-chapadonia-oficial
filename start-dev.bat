@echo off
title Chapadonia Site (Dev)

cd /d "%~dp0"

echo [START] Iniciando Chapadonia em modo DEV (hot-reload)...
echo [INFO] Acesse via Apache em http://localhost
echo.
npx tsx server.ts

pause
