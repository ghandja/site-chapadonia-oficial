@echo off
title Chapadonia Site

echo ========================================
echo  Chapadonia Site - Production Server
echo  Rodando via Apache (http://localhost)
echo ========================================
echo.

cd /d "%~dp0"

:: Start the Node site backend
echo [START] Iniciando Chapadonia backend na porta 3000 (localhost)...
echo.
start /B "" node dist/server.cjs

:: Open browser
timeout /T 3 /NOBREAK >NUL
start http://localhost

echo [OK] Chapadonia Site iniciado! Acesse http://localhost
echo [INFO] Para parar, feche esta janela.
echo.
pause
