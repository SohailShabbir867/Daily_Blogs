# ⚡ Azure Migration - Quick Command Reference

Copy and paste these commands in order. Replace placeholders with your values.

---

## 🔐 AUTHENTICATE WITH AZURE

```powershell
# Login
az login

# Verify subscription
az account show
# Should show: "displayName": "Azure for Students"
```

---

## 📦 CREATE AZURE RESOURCES

```powershell
# Create Resource Group
az group create --name daily-blogs-rg --location eastus

# Create App Service Plan (FREE tier)
az appservice plan create `
  --name daily-blogs-plan `
  --resource-group daily-blogs-rg `
  --sku FREE `
  --is-linux

# Create App Service (Node.js)
az webapp create `
  --resource-group daily-blogs-rg `
  --plan daily-blogs-plan `
  --name daily-blogs-api `
  --runtime "NODE|18-lts"

# ⏱️ Wait 2-3 minutes...

# Verify App Service created
az webapp show `
  --name daily-blogs-api `
  --resource-group daily-blogs-rg
```

---

## 🔐 GENERATE SECURE SECRETS (PowerShell)

```powershell
function New-SecureSecret {
  [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(
    (New-Guid).ToString() + (New-Guid).ToString()
  ))
}

# Generate 3 secrets - copy outputs
Write-Host "SESSION_SECRET: $(New-SecureSecret)"
Write-Host "COOKIE_SECRET: $(New-SecureSecret)"
Write-Host "JWT_SECRET: $(New-SecureSecret)"

# Save these values!
```

---

## 🔧 ADD ENVIRONMENT VARIABLES TO AZURE

Replace placeholders before running:

```powershell
# Set all environment variables
az webapp config appsettings set `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --settings `
    NODE_ENV="production" `
    PORT="8080" `
    MONGODB_URI="mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/daily-blogs?retryWrites=true&w=majority" `
    SESSION_SECRET="PASTE_SECRET_1_HERE" `
    COOKIE_SECRET="PASTE_SECRET_2_HERE" `
    JWT_SECRET="PASTE_SECRET_3_HERE" `
    ENCRYPTION_KEY="YOUR_EXISTING_KEY" `
    SMTP_HOST="smtp.gmail.com" `
    SMTP_PORT="587" `
    SMTP_USER="your-email@gmail.com" `
    SMTP_PASSWORD="YOUR_APP_PASSWORD" `
    CORS_ORIGIN="https://dailyblogs.website,https://www.dailyblogs.website" `
    FRONTEND_URL="https://dailyblogs.website"

# Verify variables added
az webapp config appsettings list `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api
```

---

## 🚀 CONFIGURE & DEPLOY

```powershell
# Set startup command
az webapp config set `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --startup-file "npm start"

# Create deployment user
az webapp deployment user set `
  --user-name "dailyblogs-deploy" `
  --password "CreateStrongPassword123!@#"

# Get Git URL
$gitUrl = az webapp deployment source config-local-git `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --query url -o tsv

Write-Host "Git URL: $gitUrl"
# COPY THIS URL - you'll need it next
```

---

## 📤 DEPLOY BACKEND CODE

```powershell
# Navigate to backend
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs\backend"

# Add Azure remote (replace URL with yours from previous step)
git remote add azure "PASTE_GIT_URL_HERE.git"

# Deploy
git push azure main

# ⏱️ Wait 2-5 minutes...
```

---

## ✅ VERIFY BACKEND RUNNING

```powershell
# Test health endpoint
$uri = "https://daily-blogs-api.azurewebsites.net/api/health"
$response = Invoke-WebRequest -Uri $uri -UseBasicParsing

if ($response.StatusCode -eq 200) {
  Write-Host "✓ Backend is running!" -ForegroundColor Green
  $response.Content | ConvertFrom-Json | Format-Table
}

# View logs
az webapp log tail `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --lines 50
```

---

## 🌐 PREPARE FRONTEND FOR DEPLOYMENT

```powershell
# Create local .env.local file
"VITE_API_URL=https://daily-blogs-api.azurewebsites.net
VITE_SOCKET_URL=https://daily-blogs-api.azurewebsites.net
VITE_FRONTEND_URL=https://dailyblogs.website
VITE_NODE_ENV=production" | Out-File -FilePath "frontend/.env.local" -Encoding UTF8

# Copy .env.example
Copy-Item "frontend/.env.local" "frontend/.env.example"
```

---

## 📤 COMMIT & PUSH ALL CHANGES

```powershell
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs"

git add .

git commit -m "Migrate backend to Azure and setup Vercel environment variables

- Deploy backend to Azure App Service
- Configure environment variables on Azure
- Update frontend to use env vars
- Add .env.example for documentation"

git push origin main

# ⏱️ Wait 2-3 minutes for Vercel to redeploy...
```

---

## 🔍 FINAL VERIFICATION

```powershell
# Test backend API
Invoke-WebRequest -Uri "https://daily-blogs-api.azurewebsites.net/api/health" -UseBasicParsing
Invoke-WebRequest -Uri "https://daily-blogs-api.azurewebsites.net/api/blogs" -UseBasicParsing

# View Azure metrics
az webapp show `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --query state

# Check DNS
nslookup dailyblogs.website
```

---

## 🔄 USEFUL AZURE COMMANDS

```powershell
# View all resources
az resource list --resource-group daily-blogs-rg

# View app configuration
az webapp config appsettings list `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api

# Update a single setting
az webapp config appsettings set `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --settings NODE_ENV="production"

# Stop app
az webapp stop `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api

# Start app
az webapp start `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api

# Restart app
az webapp restart `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api

# View live logs
az webapp log tail `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api

# Get deployment user
az webapp deployment user show

# Delete service (cleanup)
az webapp delete `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api
```

---

## 🌐 VERCEL ENVIRONMENT VARIABLES (via CLI)

```powershell
# Install Vercel CLI
npm install -g vercel

# Link to project
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs\frontend"
vercel link

# Add production variables
vercel env add VITE_API_URL
# Paste: https://daily-blogs-api.azurewebsites.net

vercel env add VITE_SOCKET_URL
# Paste: https://daily-blogs-api.azurewebsites.net

vercel env add VITE_FRONTEND_URL
# Paste: https://dailyblogs.website

vercel env add VITE_NODE_ENV
# Paste: production

# List all variables
vercel env list

# Remove a variable
vercel env remove VITE_OLD_VAR
```

---

## 🔄 UPDATE CORS IN AZURE

```powershell
# Add Vercel domains to CORS
az webapp cors add `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --allowed-origins `
    https://dailyblogs.website `
    https://www.dailyblogs.website `
    https://vercel.app

# View CORS settings
az webapp cors show `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api
```

---

## 🆘 DEBUG COMMANDS

```powershell
# Check if endpoint responding
Test-NetConnection -ComputerName daily-blogs-api.azurewebsites.net -Port 443

# Get full app info
az webapp show `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --query "{name:name,state:state,hostNames:hostNames,identity:identity}"

# Check deployment status
az webapp deployment list `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api

# Check Git history
git log --oneline -5

# Verify git remote
git remote -v
```

---

## 🎯 PLACEHOLDERS TO REPLACE

Before running commands, replace these:

```
PLACEHOLDER                          → REPLACE WITH
─────────────────────────────────────────────────────
USERNAME                             → Your MongoDB Atlas username
PASSWORD                             → Your MongoDB Atlas password
CLUSTER                              → Your MongoDB cluster name (e.g., cluster0)
PASTE_SECRET_1_HERE                  → Generated SESSION_SECRET
PASTE_SECRET_2_HERE                  → Generated COOKIE_SECRET
PASTE_SECRET_3_HERE                  → Generated JWT_SECRET
YOUR_EXISTING_KEY                    → Your AES-256 encryption key
your-email@gmail.com                 → Your Gmail address
YOUR_APP_PASSWORD                    → Gmail app-specific password
CreateStrongPassword123!@#           → A strong unique password
PASTE_GIT_URL_HERE                   → Git URL from Azure CLI output
CreateStrongPassword123!@#           → Same password as deployment user
```

---

## 📋 COMMAND ORDER SUMMARY

1. Authenticate: `az login`
2. Create Resource Group
3. Create App Service Plan
4. Create App Service
5. Generate Secrets (PowerShell)
6. Add Environment Variables
7. Configure Startup
8. Create Deployment User
9. Get Git URL
10. Deploy Code
11. Verify Deployment
12. Update Frontend Code
13. Commit & Push
14. Verify Everything

---

## ✅ VERIFICATION CHECKLIST

Run after each phase:

```powershell
# After Azure setup
az webapp show --name daily-blogs-api --resource-group daily-blogs-rg

# After deployment
Invoke-WebRequest -Uri "https://daily-blogs-api.azurewebsites.net/api/health"

# After Vercel update
git log --oneline -1  # Verify latest commit

# Check URLs load
Start-Process "https://dailyblogs.website"
Start-Process "https://daily-blogs-api.azurewebsites.net/api/health"
```

---

## 📚 REFERENCE LINKS

- Azure CLI Reference: https://docs.microsoft.com/en-us/cli/azure/
- Vercel CLI Docs: https://vercel.com/docs/cli
- Node.js on App Service: https://docs.microsoft.com/en-us/azure/app-service/app-service-web-get-started-nodejs

