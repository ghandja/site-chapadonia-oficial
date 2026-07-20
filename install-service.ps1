# Chapadonia Node Service Installer
# Execute como ADMINISTRADOR

$serviceName = "ChapadoniaSite"
$displayName = "Chapadonia Site Backend"
$nodePath = "C:\Program Files\nodejs\node.exe"
$scriptPath = "C:\Users\Usuario\Documents\UniServerZ\www\dist\server.cjs"
$workDir = "C:\Users\Usuario\Documents\UniServerZ\www"

Write-Host "Instalando servico $serviceName..." -ForegroundColor Cyan

# Check if service already exists
if (Get-Service $serviceName -ErrorAction SilentlyContinue) {
    Write-Host "Servico ja existe. Parando e removendo..." -ForegroundColor Yellow
    Stop-Service $serviceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $serviceName
    Start-Sleep 2
}

# Create the service
$cmd = "`"$nodePath`" `"$scriptPath`""
sc.exe create $serviceName binPath=$cmd start=auto DisplayName=$displayName

# Set working directory via registry
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\$serviceName"
Set-ItemProperty -Path $regPath -Name "AppDirectory" -Value $workDir -Type String -ErrorAction SilentlyContinue

# Set recovery options (restart on failure)
sc.exe failure $serviceName reset=86400 actions=restart/5000/restart/10000/restart/30000

Write-Host "Iniciando servico..." -ForegroundColor Cyan
Start-Service $serviceName -ErrorAction SilentlyContinue
Start-Sleep 2

$svc = Get-Service $serviceName -ErrorAction SilentlyContinue
if ($svc.Status -eq "Running") {
    Write-Host "[OK] Servico $serviceName esta RODANDO!" -ForegroundColor Green
    Write-Host "Acesse http://localhost para ver o site." -ForegroundColor Green
} else {
    Write-Host "[ERRO] Servico nao iniciou. Status: $($svc.Status)" -ForegroundColor Red
}

pause
