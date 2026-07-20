@echo off
cd /d "%~dp0"

echo ========================================
echo  Instalar Chapadonia Node como servico
echo ========================================
echo.
echo Execute como Administrador!
echo.
echo Criando servico "ChapadoniaSite"...
echo.

:: Create the service using nssm if available, otherwise use sc
where nssm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    nssm install ChapadoniaSite "C:\Program Files\nodejs\node.exe" "C:\Users\Usuario\Documents\UniServerZ\www\dist\server.cjs"
    nssm set ChapadoniaSite AppDirectory "C:\Users\Usuario\Documents\UniServerZ\www"
    nssm set ChapadoniaSite Start SERVICE_AUTO_START
    nssm set ChapadoniaSite DisplayName "Chapadonia Site Backend"
    echo Servico instalado via nssm!
) else (
    sc create "ChapadoniaSite" binPath= "\"C:\Program Files\nodejs\node.exe\" \"C:\Users\Usuario\Documents\UniServerZ\www\dist\server.cjs\"" start=auto DisplayName= "Chapadonia Site Backend"
    sc description "ChapadoniaSite" "Backend Node.js do site Chapadonia"
    
    :: Configure working directory via registry
    reg add "HKLM\SYSTEM\CurrentControlSet\Services\ChapadoniaSite" /v AppDirectory /t REG_SZ /d "C:\Users\Usuario\Documents\UniServerZ\www" /f
    reg add "HKLM\SYSTEM\CurrentControlSet\Services\ChapadoniaSite" /v AppParameters /t REG_SZ /d "C:\Users\Usuario\Documents\UniServerZ\www\dist\server.cjs" /f
    
    echo Servico instalado via sc!
)

echo.
echo Iniciando servico...
net start ChapadoniaSite

echo.
echo Pronto! O servico "ChapadoniaSite" esta rodando.
echo Acesse http://localhost para ver o site.
echo.
pause
