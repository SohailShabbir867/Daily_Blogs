# PowerShell script to update MongoDB password in .env file

Write-Host "`n🔧 MongoDB Password Updater`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "This script will help you update the MongoDB password in your .env file.`n" -ForegroundColor White

Write-Host "📝 IMPORTANT:" -ForegroundColor Yellow
Write-Host "   - This is your MongoDB Atlas DATABASE password (not your Google App password)" -ForegroundColor White
Write-Host "   - If you don't know it, you can reset it in MongoDB Atlas:" -ForegroundColor White
Write-Host "     1. Go to https://cloud.mongodb.com" -ForegroundColor Cyan
Write-Host "     2. Navigate to: Database Access → Select user 'mahar' → Edit → Reset Password" -ForegroundColor Cyan
Write-Host "     3. Copy the new password`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    exit 1
}

# Read current content
$envContent = Get-Content $envPath -Raw

# Check if password placeholder exists
if ($envContent -notmatch '<db_password>') {
    Write-Host "⚠️  No password placeholder found. The password might already be set." -ForegroundColor Yellow
    $confirm = Read-Host "Do you want to update it anyway? (y/n)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "`n❌ Update cancelled." -ForegroundColor Red
        exit 0
    }
}

# Get password from user
$securePassword = Read-Host "Enter your MongoDB Atlas password" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "`n❌ Password cannot be empty!" -ForegroundColor Red
    exit 1
}

# URL encode the password (handle special characters)
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($password)

# Replace the placeholder
$updatedContent = $envContent -replace 'mongodb\+srv://mahar:<db_password>@', "mongodb+srv://mahar:$encodedPassword@"

# Write back to file
try {
    Set-Content -Path $envPath -Value $updatedContent -NoNewline
    Write-Host "`n✅ MongoDB password updated successfully!" -ForegroundColor Green
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Restart your server (nodemon should auto-restart)" -ForegroundColor White
    Write-Host "   2. The server should now connect to MongoDB`n" -ForegroundColor White
} catch {
    Write-Host "`n❌ Error updating .env file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
