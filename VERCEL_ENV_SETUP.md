# 🌐 Vercel Frontend Environment Variables Guide

## Overview

Environment variables on Vercel contain sensitive data and configuration that changes between environments (development, preview, production).

---

## 📋 Required Environment Variables for Vercel

### Frontend Environment Variables (.env.local)

Create file: `frontend/.env.local` (local development only)

```env
# API Endpoints
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_NODE_ENV=development
VITE_APP_NAME=Daily Blogs
VITE_FRONTEND_URL=http://localhost:5173

# Optional - Analytics
VITE_ANALYTICS_ID=

# Optional - Social
VITE_GITHUB_ID=
VITE_TWITTER_HANDLE=
```

---

## 🚀 Step 1: Add Environment Variables in Vercel Dashboard

### Via Vercel Web Interface (Recommended for beginners)

1. **Login to Vercel:** https://vercel.com/dashboard

2. **Select Your Project:** Click `daily-blogs` project

3. **Go to Settings:**
   - Click **Settings** tab at top
   - Left sidebar → **Environment Variables**

4. **Add Production Variables:**
   - Click **+ Add New** → **Production**

**Add these variables:**

| Key                 | Value                                       | Environment |
| ------------------- | ------------------------------------------- | ----------- |
| `VITE_API_URL`      | `https://daily-blogs-api.azurewebsites.net` | Production  |
| `VITE_SOCKET_URL`   | `https://daily-blogs-api.azurewebsites.net` | Production  |
| `VITE_FRONTEND_URL` | `https://dailyblogs.website`                | Production  |
| `VITE_NODE_ENV`     | `production`                                | Production  |

5. **Add Preview Variables (for testing before deploy):**
   - Click **+ Add New** → **Preview**

**Add these variables:**

| Key                 | Value                                       | Environment |
| ------------------- | ------------------------------------------- | ----------- |
| `VITE_API_URL`      | `https://daily-blogs-api.azurewebsites.net` | Preview     |
| `VITE_SOCKET_URL`   | `https://daily-blogs-api.azurewebsites.net` | Preview     |
| `VITE_FRONTEND_URL` | `https://your-preview-url.vercel.app`       | Preview     |
| `VITE_NODE_ENV`     | `development`                               | Preview     |

6. **Add Development Variables (local):**
   - Click **+ Add New** → **Development**

**Add these variables:**

| Key                 | Value                   | Environment |
| ------------------- | ----------------------- | ----------- |
| `VITE_API_URL`      | `http://localhost:5000` | Development |
| `VITE_SOCKET_URL`   | `http://localhost:5000` | Development |
| `VITE_FRONTEND_URL` | `http://localhost:5173` | Development |
| `VITE_NODE_ENV`     | `development`           | Development |

7. **Save and Redeploy:**
   - Click **Save** for each variable
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment

---

## 🛠️ Step 2: Update Frontend Code to Use Environment Variables

### Update axios/API client

File: `frontend/src/services/api.js` (or similar)

```javascript
// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
});

export { api, SOCKET_URL };
```

### Update Socket.IO connection

File: `frontend/src/context/ChatContext.jsx` (or similar)

```javascript
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export default socket;
```

### Update Frontend URL references

File: `frontend/src/services/auth.js` (or similar)

```javascript
const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

export const getRedirectUrl = () => FRONTEND_URL;
```

---

## 📝 Step 3: Create .env.example (for documentation)

File: `frontend/.env.example`

```env
# ============================================
# FRONTEND ENVIRONMENT VARIABLES
# ============================================
# Copy this to .env.local and fill in values
# DO NOT commit .env.local to version control!

# API Configuration
# Points to your backend API server
VITE_API_URL=https://daily-blogs-api.azurewebsites.net

# WebSocket Configuration
# For real-time chat functionality
VITE_SOCKET_URL=https://daily-blogs-api.azurewebsites.net

# Frontend URL
# Used for redirects, social sharing, etc.
VITE_FRONTEND_URL=https://dailyblogs.website

# Environment
# development, preview, or production
VITE_NODE_ENV=production

# App Name (displayed in UI)
VITE_APP_NAME=Daily Blogs

# Optional - Social Media Handles
VITE_GITHUB_ID=
VITE_TWITTER_HANDLE=

# Optional - Analytics
VITE_ANALYTICS_ID=
VITE_GA_ID=
```

---

## 🔄 Step 4: Configure Vercel via CLI (Advanced)

### Install Vercel CLI

```powershell
npm install -g vercel
```

### Connect to Vercel project

```powershell
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs\frontend"

vercel link
# Select your project: daily-blogs
```

### Add environment variables via CLI

```powershell
# Add production environment variables
vercel env add VITE_API_URL
# Paste: https://daily-blogs-api.azurewebsites.net

vercel env add VITE_SOCKET_URL
# Paste: https://daily-blogs-api.azurewebsites.net

vercel env add VITE_FRONTEND_URL
# Paste: https://dailyblogs.website

vercel env add VITE_NODE_ENV
# Paste: production

# View all environment variables
vercel env list

# Remove an environment variable
vercel env remove VITE_OLD_VAR
```

---

## 🔒 Step 5: Secure Sensitive Variables

### For API Keys / Secrets

If you have any sensitive keys (API keys, secrets):

```env
# ❌ NEVER put secrets in frontend
VITE_API_KEY=secret123  # DON'T DO THIS!

# ✅ Instead, call backend endpoint
# Backend should authenticate via protected routes
```

**Why?** Frontend variables are visible in browser (check DevTools → Console):

```javascript
// Anyone can see this in browser:
import.meta.env.VITE_API_KEY;
```

**Solution:** Store secrets only on backend/Azure:

- Secrets go in Azure App Service Configuration
- Frontend calls backend endpoints
- Backend validates credentials

---

## 📦 Step 6: Update vite.config.js

Ensure Vite loads .env files correctly:

File: `frontend/vite.config.js`

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Ensure .env files are loaded
  define: {
    __APP_ENV__: JSON.stringify(process.env.VITE_NODE_ENV || "development"),
  },

  // Expose environment variables to frontend
  // All VITE_ prefixed variables are automatically available

  build: {
    chunkSizeWarningLimit: 600,
    minify: "esbuild",
    cssCodeSplit: true,
  },

  server: {
    host: true,
    port: 5173,
  },
});
```

---

## 🚀 Step 7: Deploy with New Environment Variables

### Option A: Auto-deploy on Git push

```powershell
cd "c:\Users\User\Desktop\Daily Blogs\daily-blogs"

git add frontend/.env.example
git add frontend/vite.config.js
git commit -m "Add environment variables configuration

- Add VITE_API_URL to point to Azure backend
- Add VITE_SOCKET_URL for WebSocket connections
- Update frontend code to use env vars
- Add .env.example for documentation"

git push origin main
# Vercel automatically redeploys on push
```

### Option B: Manually trigger redeploy in Vercel

1. Go to Vercel Dashboard → `daily-blogs`
2. **Deployments** tab
3. Click **...** on latest deployment
4. Click **Redeploy**

---

## ✅ Verification Steps

### 1. Check Environment Variables Loaded

In browser DevTools (F12):

```javascript
// Console tab

// Check API URL
import.meta.env.VITE_API_URL;
// Output: "https://daily-blogs-api.azurewebsites.net"

// Check environment
import.meta.env.VITE_NODE_ENV;
// Output: "production"
```

### 2. Test API Connection

```javascript
// In browser console
fetch(import.meta.env.VITE_API_URL + "/api/health")
  .then((r) => r.json())
  .then((d) => console.log(d));
```

Should show: `{success: true, message: "Daily Blogs API is running...}`

### 3. Check Network Requests

1. Open **DevTools** → **Network** tab
2. Refresh page
3. Look for API requests going to:
   - `https://daily-blogs-api.azurewebsites.net/api/...`
   - NOT localhost or old Render URL

### 4. Verify via Vercel Logs

```powershell
vercel logs daily-blogs --scope=personal
```

---

## 📋 Environment Variables Checklist

Before going live, verify:

| Variable            | Development             | Preview                                     | Production                                  | Type   |
| ------------------- | ----------------------- | ------------------------------------------- | ------------------------------------------- | ------ |
| `VITE_API_URL`      | `http://localhost:5000` | `https://daily-blogs-api.azurewebsites.net` | `https://daily-blogs-api.azurewebsites.net` | URL    |
| `VITE_SOCKET_URL`   | `http://localhost:5000` | `https://daily-blogs-api.azurewebsites.net` | `https://daily-blogs-api.azurewebsites.net` | URL    |
| `VITE_FRONTEND_URL` | `http://localhost:5173` | `https://[preview].vercel.app`              | `https://dailyblogs.website`                | URL    |
| `VITE_NODE_ENV`     | `development`           | `development`                               | `production`                                | String |

---

## 🔄 Updating Environment Variables

### When to Update

- Backend API URL changes
- Environment (dev → prod)
- Switching platforms (Render → Azure)
- Adding new external services

### How to Update

**Via Vercel Dashboard (simplest):**

1. Settings → Environment Variables
2. Find variable
3. Click **Edit**
4. Update value
5. **Save**
6. **Redeploy** deployment

**Via CLI:**

```powershell
vercel env rm VITE_API_URL
vercel env add VITE_API_URL
# Enter new value
```

---

## 📊 Environment Variables by Environment

### Development (localhost)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
VITE_NODE_ENV=development
```

### Preview (Vercel Preview Deployments)

```env
VITE_API_URL=https://daily-blogs-api.azurewebsites.net
VITE_SOCKET_URL=https://daily-blogs-api.azurewebsites.net
VITE_FRONTEND_URL=https://[preview-hash].vercel.app
VITE_NODE_ENV=development
```

### Production (Live domain)

```env
VITE_API_URL=https://daily-blogs-api.azurewebsites.net
VITE_SOCKET_URL=https://daily-blogs-api.azurewebsites.net
VITE_FRONTEND_URL=https://dailyblogs.website
VITE_NODE_ENV=production
```

---

## 🆘 Troubleshooting

| Problem                  | Cause                               | Solution                                |
| ------------------------ | ----------------------------------- | --------------------------------------- |
| **API 404 errors**       | Wrong API URL                       | Check `VITE_API_URL` in Vercel settings |
| **CORS errors**          | Backend not allowing Vercel domain  | Update backend CORS in Azure            |
| **Env vars undefined**   | Variables not reloaded after deploy | Manually redeploy in Vercel             |
| **Old backend URL used** | Cache not cleared                   | Hard refresh (Ctrl+Shift+R)             |
| **Chat not working**     | Wrong Socket URL                    | Verify `VITE_SOCKET_URL` value          |

---

## 📝 Summary

✅ **Steps Completed:**

- [ ] Create `.env.local` for local development
- [ ] Add variables to Vercel dashboard (Production/Preview/Development)
- [ ] Update frontend code to use `import.meta.env.VITE_*`
- [ ] Create `.env.example` file
- [ ] Update `vite.config.js` if needed
- [ ] Test environment variables in browser console
- [ ] Verify API calls go to Azure, not old Render URL
- [ ] Redeploy on Vercel
- [ ] Test in production
