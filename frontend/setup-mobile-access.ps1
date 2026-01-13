# PowerShell script to automatically configure .env for network access
# This script finds your IP and creates the .env file

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Mobile Network Access - .env Generator" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Get the laptop's IP address
$ipAddress = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" -and $_.InterfaceAlias -like "*Wi-Fi*" } |
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $ipAddress) {
    # Fallback to any non-localhost IP if Wi-Fi not found
    $ipAddress = Get-NetIPAddress -AddressFamily IPv4 | 
        Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } |
        Select-Object -First 1 -ExpandProperty IPAddress
}

if (-not $ipAddress) {
    Write-Host "❌ Could not detect your IP address!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run 'ipconfig' manually and find your IPv4 Address" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Detected IP Address: $ipAddress" -ForegroundColor Green
Write-Host ""

# Create .env content
$envContent = @"
# ============================================
# FRONTEND ENVIRONMENT CONFIGURATION
# ============================================
# Auto-generated for mobile network access on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Backend API URL - Using laptop's network IP
VITE_API_URL=http://${ipAddress}:5000/api

# App name
VITE_APP_NAME=Daily Blogs

# App version
VITE_APP_VERSION=1.0.0

# ============================================
# MOBILE ACCESS URLS
# ============================================
# Frontend URL (for mobile browser): http://${ipAddress}:5173
# Backend URL (if needed): http://${ipAddress}:5000
"@

# Save to .env file
$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host ""
        Write-Host "❌ Cancelled. Existing .env file was not modified." -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 0
    }
}

try {
    $envContent | Set-Content -Path $envPath -Encoding UTF8
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create .env file: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete!" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Mobile Access URLs:" -ForegroundColor Green
Write-Host "   Frontend: http://$ipAddress:5173" -ForegroundColor White
Write-Host "   Backend:  http://$ipAddress:5000" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Make sure firewall is configured (run configure-firewall.ps1)" -ForegroundColor White
Write-Host "   2. Start backend: npm start (in backend folder)" -ForegroundColor White
Write-Host "   3. Start frontend: npm run dev (in frontend folder)" -ForegroundColor White
Write-Host "   4. Open http://$ipAddress:5173 on your mobile device" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Make sure your mobile is on the same Wi-Fi network!" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
