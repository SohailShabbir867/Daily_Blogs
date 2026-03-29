# 🚀 Azure Deployment Guide - Move Backend from Render to Azure

## Table of Contents

1. [Azure Student Account Setup](#azure-student-account-setup)
2. [Prerequisites & Requirements](#prerequisites--requirements)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [Verification & Testing](#verification--testing)

---

## 🎓 Azure Student Account Setup

### Step 1: Activate Azure Credits (if not already done)

1. Go to: https://azure.microsoft.com/en-us/free/students/
2. Click **Activate now**
3. Sign in with your **school email** (or personal account)
4. Verify education status
5. Confirm billing information
6. **Get $100 free credits** + free services for 12 months

### Step 2: Access Azure Portal

1. Go to: https://portal.azure.com
2. Sign in with your Azure account
3. You should see a **dashboard** with resources

### Step 3: Install Azure CLI (Command-line tool)

**On Windows PowerShell:**

```powershell
# Download and install Azure CLI
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile AzureCLI.msi
Start-Process msiexec.exe -ArgumentList '/i AzureCLI.msi /quiet' -Wait

# Verify installation
az --version
```

Or **manually download from:** https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows

---

## 📋 Prerequisites & Requirements

### What You'll Need:

- ✅ Azure Student Account (setup above)
- ✅ Node.js 18+ installed locally
- ✅ Git installed
- ✅ Backend code ready to deploy
- ✅ Environment variables (.env file)

### Azure Resources to Create:

| Resource                 | Purpose         | Cost                            |
| ------------------------ | --------------- | ------------------------------- |
| **App Service Plan**     | Hosting compute | Free tier available\*           |
| **App Service**          | Run Node.js app | Free tier: 1 GB RAM, 60 min/day |
| **Application Insights** | Monitoring      | Free tier: 1 GB/month           |

\*Free tier sufficient for development/testing

---

## 🔧 Step-by-Step Deployment

### STEP 1: Create Resource Group (Container for all resources)

A Resource Group organizes all your Azure resources in one place.

**Via Azure Portal:**

1. Login to: https://portal.azure.com
2. Click **+ Create a resource** (top-left)
3. Search: **Resource Group**
4. Click **Create**
5. Fill in:
   - **Subscription:** Azure for Students
   - **Resource group name:** `daily-blogs-rg`
   - **Region:** `East US` (closest to you)
6. Click **Review + Create** → **Create**

**OR Via PowerShell (faster):**

```powershell
az login

# Create resource group
az group create --name daily-blogs-rg --location eastus

# Verify creation
az group show --name daily-blogs-rg
```

---

### STEP 2: Create App Service Plan (Compute resources)

App Service Plan defines CPU/RAM/pricing tier.

**Via Azure Portal:**

1. In your Resource Group, click **+ Create**
2. Search: **App Service Plan**
3. Click **Create**
4. Fill in:
   - **Name:** `daily-blogs-plan`
   - **Operating System:** Linux
   - **Region:** East US
   - **Pricing tier:** **FREE** (F1)
5. Review → **Create**

**OR Via PowerShell:**

```powershell
az appservice plan create `
  --name daily-blogs-plan `
  --resource-group daily-blogs-rg `
  --sku FREE `
  --is-linux
```

---

### STEP 3: Create App Service (Web app instance)

This is your actual running application.

**Via Azure Portal:**

1. In Resource Group, click **+ Create**
2. Search: **App Service**
3. Click **Create**
4. Fill in:
   - **Name:** `daily-blogs-api` (must be globally unique)
   - **Publish:** Code
   - **Runtime stack:** Node 18 LTS
   - **Operating System:** Linux
   - **Region:** East US
   - **App Service Plan:** Select `daily-blogs-plan`
5. Review → **Create**

**Wait ~2-3 minutes for creation...**

**OR Via PowerShell:**

```powershell
az webapp create `
  --resource-group daily-blogs-rg `
  --plan daily-blogs-plan `
  --name daily-blogs-api `
  --runtime "NODE|18-lts" `
  --runtime-version 18-lts
```

**Expected result:** Your app is available at `https://daily-blogs-api.azurewebsites.net`

---

### STEP 4: Configure Application Settings (Environment Variables)

Store sensitive data in Azure (not in code).

**Via Azure Portal:**

1. Go to created **App Service** → `daily-blogs-api`
2. Left sidebar → **Settings** → **Configuration**
3. Click **+ New application setting** for each variable:

**Add these Application Settings:**

```
NODE_ENV = production
PORT = 8080
MONGODB_URI = [Your MongoDB Atlas connection string]
SESSION_SECRET = [Create secure random string]
COOKIE_SECRET = [Create secure random string]
JWT_SECRET = [Create secure random string]
ENCRYPTION_KEY = [Your existing encryption key]
SMTP_USER = [Your email service]
SMTP_PASSWORD = [Email password]
SMTP_HOST = [Email host]
SMTP_PORT = 587
CORS_ORIGIN = https://dailyblogs.website,https://www.dailyblogs.website
FRONTEND_URL = https://dailyblogs.website
```

**How to generate secure secrets (PowerShell):**

```powershell
function New-SecureString {
  [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(
    (New-Guid).ToString() + (New-Guid).ToString()
  ))
}

# Generate each secret
New-SecureString  # SESSION_SECRET
New-SecureString  # COOKIE_SECRET
New-SecureString  # JWT_SECRET
```

**Via PowerShell (automated):**

```powershell
# Set all app settings at once
az webapp config appsettings set `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --settings `
    NODE_ENV=production `
    PORT=8080 `
    MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/daily-blogs" `
    SESSION_SECRET="your-generated-secret" `
    CORS_ORIGIN="https://dailyblogs.website"
```

---

### STEP 5: Deploy Code to Azure

**Option A: Git Deployment (Simplest)**

**1. Setup Local Git (in your backend folder):**

```powershell
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs\backend"

# Setup Git remote for Azure
az webapp deployment user set --user-name "your-azure-username" --password "Create-Strong-Password-123"
```

**2. Get Azure Git URL:**

```powershell
$gitUrl = az webapp deployment source config-local-git `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --query url -o tsv

Write-Host "Git URL: $gitUrl"
# Output: https://daily-blogs-api.scm.azurewebsites.net/daily-blogs-api.git
```

**3. Add Azure as Git remote and push:**

```powershell
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs\backend"

# Add Azure remote
git remote add azure https://daily-blogs-api.scm.azurewebsites.net/daily-blogs-api.git

# Push code to Azure (triggers deployment)
git push azure main

# You'll see deployment logs streaming in real-time
```

**Option B: GitHub Actions (Recommended)**

This automatically deploys when you push to GitHub.

**1. Generate Azure Deployment Credentials:**

```powershell
az ad sp create-for-rbac `
  --name "daily-blogs-deployment" `
  --role contributor `
  --scopes /subscriptions/{subscription-id}/resourceGroups/daily-blogs-rg `
  --json-auth

# Copy the entire JSON output
```

**2. Add to GitHub Secrets:**

- Go to: GitHub repo → **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**
- Name: `AZURE_CREDENTIALS`
- Paste the JSON from Step 1

**3. Create GitHub Actions Workflow:**

File: `.github/workflows/azure-deploy.yml`

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
    paths:
      - "backend/**"
      - ".github/workflows/azure-deploy.yml"

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: daily-blogs-api
          package: ./backend

      - name: Logout of Azure
        run: az logout
```

---

### STEP 6: Configure Startup Script

Azure needs to know how to start your app.

**Create or update file:** `backend/web.config` (or `backend/.azure/startup.sh`)

**Option A - For Node.js (web.config):**

File: `backend/web.config`

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ecmaScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true"/>
          </conditions>
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <fileExtensions>
          <add fileExtension=".js" allowed="true" />
        </fileExtensions>
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

**Option B - For Node.js (simpler):**

File: `backend/.azure/startup.sh`

```bash
#!/bin/bash
npm install
npm start
```

Then in Azure Portal:

1. App Service → **Settings** → **General**
2. **Startup Command:** `npm start`

---

### STEP 7: Verify Deployment

**Check deployment status:**

```powershell
# View deployment status
az webapp show `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --query state

# View logs (last 50 lines)
az webapp log tail `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --lines 50
```

**Test your API:**

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "https://daily-blogs-api.azurewebsites.net/api/health"

# Should return: {"success": true, "message": "Daily Blogs API is running..."}
```

**Via browser:**

- Health check: https://daily-blogs-api.azurewebsites.net/api/health
- API info: https://daily-blogs-api.azurewebsites.net/api/

---

## 🔐 Environment Variables Configuration

### Backend Azure Environment Variables (.env sample)

Create `backend/.env.example`:

```env
# Server
NODE_ENV=production
PORT=8080

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/daily-blogs?retryWrites=true&w=majority

# Session & Auth
SESSION_SECRET=your-super-secret-session-key-generate-secure-random-string
COOKIE_SECRET=your-super-secret-cookie-key-generate-secure-random-string
JWT_SECRET=your-jwt-secret-key-minimum-32-characters
ENCRYPTION_KEY=your-aes-256-encryption-key-32-bytes

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend & CORS
CORS_ORIGIN=https://dailyblogs.website,https://www.dailyblogs.website,http://localhost:5173
FRONTEND_URL=https://dailyblogs.website

# Optional - Monitoring
AZURE_LOG_LEVEL=info
```

### How to Set Variables in Azure (Step 4 detailed)

**Option A: Via Portal UI**

1. App Service → Configuration
2. Click **+ New application setting**
3. Enter each key-value pair
4. Click **Save** at top

**Option B: Via PowerShell (Bulk)**

```powershell
$settings = @{
    NODE_ENV = "production"
    PORT = "8080"
    MONGODB_URI = "mongodb+srv://user:pass@cluster.mongodb.net/daily-blogs"
    SESSION_SECRET = "your-generated-secret"
    COOKIE_SECRET = "your-generated-secret"
    JWT_SECRET = "your-generated-secret"
    CORS_ORIGIN = "https://dailyblogs.website"
}

az webapp config appsettings set `
    --resource-group daily-blogs-rg `
    --name daily-blogs-api `
    --settings $settings
```

---

## ✅ Verification & Testing

### 1. Check Application is Running

```powershell
# URL will be: https://daily-blogs-api.azurewebsites.net/api/health
curl https://daily-blogs-api.azurewebsites.net/api/health
```

### 2. View Deployment Logs

```powershell
# Stream real-time logs
az webapp log tail --resource-group daily-blogs-rg --name daily-blogs-api

# Or via Portal: App Service → Log stream
```

### 3. Test Database Connection

In PowerShell, test if backend can reach MongoDB:

```powershell
Invoke-WebRequest `
    -Uri "https://daily-blogs-api.azurewebsites.net/api/blogs" `
    -Headers @{"Content-Type"="application/json"} `
    -Method GET
```

Should return blog data (or empty array if no blogs).

### 4. Monitor Performance

1. App Service → **Insights**
2. View CPU, Memory, Requests
3. Set up **Alerts** for high usage

---

## 🔄 Update DNS & Frontend

After Azure deployment is verified:

### 1. Update vercel.json (Frontend)

File: `frontend/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "https://daily-blogs-api.azurewebsites.net/api/sitemap.xml"
    },
    {
      "source": "/api/:path*",
      "destination": "https://daily-blogs-api.azurewebsites.net/api/:path*"
    }
  ],
  ...
}
```

### 2. Update CORS in Azure

```powershell
az webapp cors add `
    --resource-group daily-blogs-rg `
    --name daily-blogs-api `
    --allowed-origins https://dailyblogs.website https://www.dailyblogs.website https://vercel.app
```

### 3. Commit & Push Changes

```powershell
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs"

git add frontend/vercel.json
git commit -m "Update API endpoint to Azure"
git push origin main

# Vercel auto-deploys frontend
```

---

## 📊 Cost Estimation (Azure Student Account)

| Service                   | Free Tier    | Cost     |
| ------------------------- | ------------ | -------- |
| App Service Plan (F1)     | ✓ 60 min/day | FREE     |
| App Service               | Included     | FREE     |
| MongoDB Atlas (free tier) | ✓ 512 MB     | FREE     |
| Application Insights      | ✓ 1 GB/month | FREE     |
| **Monthly Total**         |              | **FREE** |

⚠️ **Note:** Free tier limited to 60 minutes per day. For 24/7 hosting:

- Upgrade to B1 ($10/month) or use Azure Container Instances

---

## 🆘 Troubleshooting

| Problem                      | Solution                                     |
| ---------------------------- | -------------------------------------------- |
| **502 Bad Gateway**          | Check app logs: `az webapp log tail`         |
| **App crashing**             | Missing env vars - verify all settings added |
| **Can't connect to MongoDB** | Check CORS and connection string in env vars |
| **Deployment hangs**         | Check git logs: `git log --oneline`          |
| **Free tier timeout**        | Upgrade to B1 plan for 24/7 uptime           |

---

## ✨ Summary

| Step | Task                      | Status  |
| ---- | ------------------------- | ------- |
| 1    | Create Resource Group     | ⏳ TODO |
| 2    | Create App Service Plan   | ⏳ TODO |
| 3    | Create App Service        | ⏳ TODO |
| 4    | Set Environment Variables | ⏳ TODO |
| 5    | Deploy Code               | ⏳ TODO |
| 6    | Configure Startup         | ⏳ TODO |
| 7    | Verify & Test             | ⏳ TODO |
| 8    | Update Frontend           | ⏳ TODO |
