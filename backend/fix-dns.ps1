# Fix DNS for MongoDB Atlas Connection
# Run this script as Administrator!

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MongoDB Atlas DNS Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Right-click PowerShell" -ForegroundColor Yellow
    Write-Host "  2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "  3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

Write-Host "Setting Google DNS (8.8.8.8 and 8.8.4.4)..." -ForegroundColor Yellow
Write-Host ""

# Get active network adapters
$adapters = Get-NetAdapter | Where-Object {$_.Status -eq "Up"}

foreach ($adapter in $adapters) {
    Write-Host "Configuring: $($adapter.Name)" -ForegroundColor Cyan
    
    try {
        # Set DNS servers
        Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses ("8.8.8.8", "8.8.4.4")
        Write-Host "  [OK] DNS servers set to 8.8.8.8, 8.8.4.4" -ForegroundColor Green
    }
    catch {
        Write-Host "  [FAILED] Could not set DNS: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Flushing DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "  [OK] DNS cache flushed" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DNS Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Now try running your server:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or test the connection:" -ForegroundColor Yellow
Write-Host "  node test-mongodb.js" -ForegroundColor White
Write-Host ""

pause
