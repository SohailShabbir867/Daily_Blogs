# Windows Firewall Configuration Script for Vite Dev Server
# Run this script as Administrator to allow network access

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Vite Dev Server Firewall Configuration" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "  1. Right-click PowerShell" -ForegroundColor Yellow
    Write-Host "  2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "  3. Navigate to this directory and run the script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Remove existing rule if it exists
Write-Host "🔍 Checking for existing firewall rules..." -ForegroundColor Yellow
$existingRule = Get-NetFirewallRule -DisplayName "Vite Dev Server - Port 5173" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "📝 Removing existing rule..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "Vite Dev Server - Port 5173"
    Write-Host "✅ Existing rule removed" -ForegroundColor Green
}

# Create new firewall rule
Write-Host "🔧 Creating new firewall rule for port 5173..." -ForegroundColor Yellow

try {
    New-NetFirewallRule `
        -DisplayName "Vite Dev Server - Port 5173" `
        -Direction Inbound `
        -LocalPort 5173 `
        -Protocol TCP `
        -Action Allow `
        -Profile Any `
        -Enabled True `
        -Description "Allow incoming connections to Vite development server on port 5173"
    
    Write-Host "✅ Firewall rule created successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create firewall rule: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete!" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Green
Write-Host "  1. Start your Vite dev server: npm run dev" -ForegroundColor White
Write-Host "  2. Note the 'Network' URL shown in the terminal" -ForegroundColor White
Write-Host "  3. Use that URL to access from other devices" -ForegroundColor White
Write-Host ""

# Display current IP address
Write-Host "📍 Your computer's IP addresses:" -ForegroundColor Yellow
Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } |
    Select-Object IPAddress, InterfaceAlias |
    Format-Table -AutoSize

Write-Host ""
Write-Host "💡 Tip: Use the IPv4 address for your active network adapter" -ForegroundColor Cyan
Write-Host "    Example: http://192.168.1.100:5173" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
