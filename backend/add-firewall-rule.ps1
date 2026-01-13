# Add Backend Firewall Rule
# Run this as Administrator

Write-Host "Adding firewall rule for backend (port 5000)..." -ForegroundColor Yellow

try {
    New-NetFirewallRule `
        -DisplayName "Daily Blogs Backend - Port 5000" `
        -Direction Inbound `
        -LocalPort 5000 `
        -Protocol TCP `
        -Action Allow `
        -Enabled True

    Write-Host "✅ Backend firewall rule added successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    Write-Host "Make sure you're running as Administrator" -ForegroundColor Yellow
}

Read-Host "Press Enter to exit"
