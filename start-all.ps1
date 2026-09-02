$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot

function Stop-PortProcess([int]$port) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Stop-PortProcess 3000
Stop-PortProcess 3001
Stop-PortProcess 3002

Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$projectRoot\backend_inventra'; npm start"
Start-Process powershell -ArgumentList '-NoExit', '-Command', "`$env:PORT='3001'; Set-Location '$projectRoot\frontend_inventra'; npm start"
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$projectRoot\flutter_inventra'; flutter run -d chrome --web-port 3002"

Write-Host 'Backend : http://localhost:3000'
Write-Host 'React   : http://localhost:3001'
Write-Host 'Flutter : http://localhost:3002'