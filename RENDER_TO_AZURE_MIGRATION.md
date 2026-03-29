# ✅ Complete Migration Checklist: Render → Azure + Vercel Env Setup

## 📋 Overview

Migrate your backend from **Render** to **Azure** and configure environment variables on **Vercel**.

**Timeline:** 30-45 minutes  
**Cost:** FREE (Azure Student Account)

---

## 🎯 PHASE 1: Azure Setup (15 minutes)

### ✅ STEP 1: Login to Azure

```powershell
# Login to Azure account
az login

# Verify you're on Azure for Students subscription
az account show
# Should show: "Azure for Students"
```

**If you don't see Azure for Students:**
1. Go to https://azure.microsoft.com/en-us/free/students/
2. Click **Activate now**
3. Verify with school email
4. Wait 5-10 minutes for activation

---

### ✅ STEP 2: Create Resource Group

```powershell
# Create resource group
az group create --name daily-blogs-rg --location eastus

# Verify
az group show --name daily-blogs-rg
```

**Expected output:** Shows `"name": "daily-blogs-rg"` ✓

---

### ✅ STEP 3: Create App Service Plan

```powershell
# Create FREE App Service Plan
az appservice plan create `
  --name daily-blogs-plan `
  --resource-group daily-blogs-rg `
  --sku FREE `
  --is-linux

# Verify
az appservice plan show --name daily-blogs-plan --resource-group daily-blogs-rg
```

**Expected output:** Shows `"sku": {"name": "F1", "tier": "Free"}` ✓

---

### ✅ STEP 4: Create App Service

```powershell
# Create Node.js App Service
az webapp create `
  --resource-group daily-blogs-rg `
  --plan daily-blogs-plan `
  --name daily-blogs-api `
  --runtime "NODE|18-lts"

# Verify
az webapp show --name daily-blogs-api --resource-group daily-blogs-rg
```

⏱️ **Wait 2-3 minutes for creation to complete...**

**Your app will be available at:**
```
https://daily-blogs-api.azurewebsites.net
```

---

## 🔐 PHASE 2: Configure Environment Variables on Azure (10 minutes)

### ✅ STEP 5: Generate Secure Secrets

Run in PowerShell to generate secure random strings:

```powershell
function New-SecureSecret {
  [System.Convert]::ToBase64String(
    [System.Text.Encoding]::UTF8.GetBytes(
      (New-Guid).ToString() + (New-Guid).ToString()
    )
  )
}

# Generate these - copy the output for each
Write-Host "SESSION_SECRET: $(New-SecureSecret)"
Write-Host "COOKIE_SECRET: $(New-SecureSecret)"
Write-Host "JWT_SECRET: $(New-SecureSecret)"
```

Save the three generated secrets somewhere safe (you'll use them next).

---

### ✅ STEP 6: Add All Environment Variables to Azure

Copy your `.env` file values and add them to Azure:

```powershell
# Replace with your actual values
$resourceGroup = "daily-blogs-rg"
$appName = "daily-blogs-api"

# Set all app settings at once
az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $appName `
  --settings `
    NODE_ENV="production" `
    PORT="8080" `
    MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/daily-blogs?retryWrites=true&w=majority" `
    SESSION_SECRET="PASTE_GENERATED_SECRET_HERE" `
    COOKIE_SECRET="PASTE_GENERATED_SECRET_HERE" `
    JWT_SECRET="PASTE_GENERATED_SECRET_HERE" `
    ENCRYPTION_KEY="YOUR_EXISTING_ENCRYPTION_KEY" `
    SMTP_HOST="smtp.gmail.com" `
    SMTP_PORT="587" `
    SMTP_USER="your-email@gmail.com" `
    SMTP_PASSWORD="YOUR_EMAIL_APP_PASSWORD" `
    CORS_ORIGIN="https://dailyblogs.website,https://www.dailyblogs.website" `
    FRONTEND_URL="https://dailyblogs.website"

# Verify all settings were added
az webapp config appsettings list --resource-group $resourceGroup --name $appName
```

**Replace placeholders:**
- `YOUR_USERNAME` - MongoDB Atlas username
- `YOUR_PASSWORD` - MongoDB Atlas password
- `YOUR_CLUSTER` - MongoDB cluster name
- `PASTE_GENERATED_SECRET_HERE` - Use values from Step 5
- `YOUR_EXISTING_ENCRYPTION_KEY` - From your current .env
- `your-email@gmail.com` - Your Gmail for email service
- `YOUR_EMAIL_APP_PASSWORD` - Gmail app-specific password

---

### ✅ STEP 7: Configure Startup Command

Tell Azure how to start your Node.js app:

```powershell
az webapp config set `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --startup-file "npm start"
```

---

## 🚀 PHASE 3: Deploy Your Backend Code (10 minutes)

### ✅ STEP 8: Setup Local Git Deployment

```powershell
# Create deployment user (one-time setup)
az webapp deployment user set `
  --user-name "dailyblogs-deploy" `
  --password "CreateAStrongPasswordHere123!@#"

# Save this username/password - you'll use it again if needed
```

---

### ✅ STEP 9: Get Azure Git Repository URL

```powershell
$gitUrl = az webapp deployment source config-local-git `
  --resource-group daily-blogs-rg `
  --name daily-blogs-api `
  --query url -o tsv

Write-Host "Git URL: $gitUrl"
# Output: https://dailyblogs-deploy@daily-blogs-api.scm.azurewebsites.net/daily-blogs-api.git
```

**Copy the URL** - you'll use it in the next step.

---

### ✅ STEP 10: Deploy Backend Code

```powershell
# Navigate to backend folder
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs\backend"

# Add Azure as a git remote (replace URL with yours from Step 9)
git remote add azure "https://dailyblogs-deploy@daily-blogs-api.scm.azurewebsites.net/daily-blogs-api.git"

# Push code to Azure (triggers deployment automatically)
git push azure main

# Watch the deployment logs scroll by
# When you see "Deployment successful!" - you're done!
```

**⏱️ Deployment takes 2-5 minutes.**

---

### ✅ STEP 11: Verify Backend is Running

```powershell
# Test your API
$response = Invoke-WebRequest -Uri "https://daily-blogs-api.azurewebsites.net/api/health" -UseBasicParsing

if ($response.StatusCode -eq 200) {
  Write-Host "✓ Backend is running successfully!" -ForegroundColor Green
  $response.Content | ConvertFrom-Json
} else {
  Write-Host "✗ Backend returned error: $($response.StatusCode)" -ForegroundColor Red
}

# Or via browser: https://daily-blogs-api.azurewebsites.net/api/health
```

**Expected output:**
```json
{
  "success": true,
  "message": "Daily Blogs API is running",
  "timestamp": "2026-03-29T...",
  "uptime": 123.456,
  "environment": "production"
}
```

✅ **If you see this, backend is running!**

---

## 🌐 PHASE 4: Configure Frontend Environment Variables on Vercel (10 minutes)

### ✅ STEP 12: Add Environment Variables in Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Select project: `daily-blogs`
3. Click **Settings** tab
4. Left sidebar: **Environment Variables**
5. Click **+ Add New** for each variable below

**Add PRODUCTION variables (select "Production" from dropdown):**

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://daily-blogs-api.azurewebsites.net` |
| `VITE_SOCKET_URL` | `https://daily-blogs-api.azurewebsites.net` |
| `VITE_FRONTEND_URL` | `https://dailyblogs.website` |
| `VITE_NODE_ENV` | `production` |

After adding each:
- Click **Save**

---

### ✅ STEP 13: Add PREVIEW Variables

Repeat the process but select **Preview** from dropdown:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://daily-blogs-api.azurewebsites.net` |
| `VITE_SOCKET_URL` | `https://daily-blogs-api.azurewebsites.net` |
| `VITE_FRONTEND_URL` | `https://[auto-generated].vercel.app` |
| `VITE_NODE_ENV` | `development` |

---

### ✅ STEP 14: Add DEVELOPMENT Variables (for local testing)

Repeat but select **Development** from dropdown:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `http://localhost:5000` |
| `VITE_SOCKET_URL` | `http://localhost:5000` |
| `VITE_FRONTEND_URL` | `http://localhost:5173` |
| `VITE_NODE_ENV` | `development` |

---

### ✅ STEP 15: Create .env.example File

Create file: `frontend/.env.example`

```env
# API Configuration
VITE_API_URL=https://daily-blogs-api.azurewebsites.net
VITE_SOCKET_URL=https://daily-blogs-api.azurewebsites.net
VITE_FRONTEND_URL=https://dailyblogs.website
VITE_NODE_ENV=production
VITE_APP_NAME=Daily Blogs
```

---

### ✅ STEP 16: Create Local .env.local File

Create file: `frontend/.env.local` (for your local development machine)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
VITE_NODE_ENV=development
```

---

### ✅ STEP 17: Update Frontend Code

Make sure your API client uses the environment variables:

File: `frontend/src/services/api.js` (or wherever you create axios instance)

```javascript
// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
});

export default api;
```

File: `frontend/src/context/ChatContext.jsx` (or socket connection)

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
});

export default socket;
```

---

### ✅ STEP 18: Update vercel.json

File: `frontend/vercel.json`

Ensure it has rewrites to proxy API calls:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://daily-blogs-api.azurewebsites.net/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/sitemap.xml",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/xml; charset=utf-8"
        }
      ]
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

---

## 📤 PHASE 5: Commit & Deploy (5 minutes)

### ✅ STEP 19: Commit All Changes

```powershell
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs"

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Migrate backend to Azure and configure Vercel environment variables

- Move backend from Render to Azure App Service
- Configure all environment variables on Azure
- Add VITE_* environment variables to Vercel (Production/Preview/Development)  
- Update frontend code to use environment variables
- Create .env.example for documentation"

# Push to GitHub (triggers Vercel redeploy automatically)
git push origin main
```

**⏱️ Wait 2-3 minutes for Vercel to deploy...**

---

### ✅ STEP 20: Monitor Deployment on Vercel

1. Go to: https://vercel.com/dashboard
2. Select `daily-blogs` project
3. Click **Deployments** tab
4. Watch for deployment status: **Ready** ✓

---

## ✅ PHASE 6: Final Verification (5 minutes)

### ✅ STEP 21: Test Backend API

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "https://daily-blogs-api.azurewebsites.net/api/health" -UseBasicParsing

# Test getting blogs
Invoke-WebRequest -Uri "https://daily-blogs-api.azurewebsites.net/api/blogs" -UseBasicParsing

# Both should return 200 OK
```

---

### ✅ STEP 22: Test Frontend Environment Variables

In your browser (https://dailyblogs.website):

1. Right-click → **Inspect** (DevTools)
2. Open **Console** tab
3. Copy-paste:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Frontend URL:', import.meta.env.VITE_FRONTEND_URL);
console.log('Environment:', import.meta.env.VITE_NODE_ENV);
```

**Expected output:**
```
API URL: https://daily-blogs-api.azurewebsites.net
Frontend URL: https://dailyblogs.website
Environment: production
```

---

### ✅ STEP 23: Test API Calls from Frontend

In browser Console:

```javascript
fetch(import.meta.env.VITE_API_URL + '/api/health')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
```

**Should return:** `{success: true, message: "Daily Blogs API is running"`

---

### ✅ STEP 24: Check Pages Load Correctly

Test these URLs in browser:
- [ ] https://dailyblogs.website (Home page)
- [ ] https://dailyblogs.website/about (About page)
- [ ] https://dailyblogs.website/contact (Contact page)
- [ ] https://dailyblogs.website/blog (Blog page with posts)
- [ ] Try creating/editing blog (if logged in)

All should work without errors ✓

---

## 📊 After Deployment

### Update DNS Records (if needed)

Make sure your domain DNS points to Vercel:

```powershell
nslookup dailyblogs.website
```

Should show: Vercel's IP address (76.76.19.21)

### Remove Old Render Deployment

1. Go to: https://render.com/dashboard
2. Click your backend service
3. Click **Settings**
4. Scroll to bottom → **Delete Service** (optional, can keep for rollback)

### Monitor Azure & Vercel

**Azure:**
- https://portal.azure.com → daily-blogs-api
- Check: Deployments, Configuration, Metrics

**Vercel:**
- https://vercel.com/dashboard → daily-blogs
- Check: Deployments, Logs, Analytics

---

## 🎉 COMPLETION CHECKLIST

Mark as ✅ when complete:

| Task | Status |
|------|--------|
| Azure Resource Group created | ⏳ |
| App Service Plan created | ⏳ |
| App Service created | ⏳ |
| Environment variables added to Azure | ⏳ |
| Backend code deployed to Azure | ⏳ |
| Backend health check passes | ⏳ |
| Vercel environment variables configured (Prod) | ⏳ |
| Vercel environment variables configured (Preview) | ⏳ |
| Vercel environment variables configured (Dev) | ⏳ |
| Frontend code updated to use env vars | ⏳ |
| .env.example created | ⏳ |
| .env.local created locally | ⏳ |
| All changes committed and pushed | ⏳ |
| Vercel deployment successful | ⏳ |
| Frontend loads without errors | ⏳ |
| API calls work correctly | ⏳ |
| Blog pages load with content | ⏳ |
| Chat functionality works | ⏳ |

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **502 Bad Gateway from Azure** | Check Azure logs: `az webapp log tail --resource-group daily-blogs-rg --name daily-blogs-api` |
| **Environment variables undefined** | Redeploy on Vercel: Dashboard → Deployments → Redeploy |
| **API 404 errors** | Verify `VITE_API_URL` is correct in Vercel settings |
| **CORS errors** | Add Vercel domain to Azure CORS: `az webapp cors add --resource-group daily-blogs-rg --name daily-blogs-api --allowed-origins https://dailyblogs.website` |
| **MongoDB connection fails** | Check `MONGODB_URI` connection string in Azure app settings |
| **Email not sending** | Verify `SMTP_USER` and `SMTP_PASSWORD` in Azure app settings |

---

## 📞 Support Resources

- **Azure Docs:** https://docs.microsoft.com/azure/
- **Vercel Docs:** https://vercel.com/docs
- **Node.js Docs:** https://nodejs.org/en/docs/
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/

