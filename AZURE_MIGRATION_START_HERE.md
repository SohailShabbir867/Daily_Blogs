# 🚀 Backend Migration: Render → Azure Complete Guide

## 📌 EXECUTIVE SUMMARY

You are migrating your **Daily Blogs** backend from **Render** to **Azure** and configuring environment variables on **Vercel** frontend.

**Total Time:** ~1 hour  
**Cost:** FREE (Azure Student Account)  
**Difficulty:** Medium

---

## 📚 YOUR NEW DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR SYSTEM OVERVIEW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React)                Backend (Node.js)           │
│  ├─ Vercel                       ├─ Azure App Service       │
│  ├─ Domain: dailyblogs.website   ├─ URL: daily-blogs-api    │
│  ├─ Env Vars: STORED IN VERCEL   │   .azurewebsites.net     │
│  │  - VITE_API_URL              ├─ Env Vars: STORED IN     │
│  │  - VITE_SOCKET_URL           │  AZURE CONFIG             │
│  │  - VITE_FRONTEND_URL         │  - MONGODB_URI            │
│  │  - VITE_NODE_ENV             │  - SESSION_SECRET         │
│  │                              │  - SMTP credentials       │
│  │                              │  - CORS settings          │
│  │                              │                           │
│  └─────────────────────┬────────┘                           │
│                        │ API calls                          │
│                        │ WebSocket                          │
│                        ▼                                    │
│                 Database (MongoDB)                         │
│                 ├─ MongoDB Atlas                           │
│                 ├─ URL: mongodb+srv://...                  │
│                 └─ 512 MB free tier                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 DOCUMENTATION FILES CREATED

We've created 4 comprehensive guides for you:

### 1. **[RENDER_TO_AZURE_MIGRATION.md](./RENDER_TO_AZURE_MIGRATION.md)** ⭐ START HERE
**Purpose:** Complete step-by-step migration checklist  
**Contains:** 24 steps organized in 6 phases  
**Time:** 45 minutes  
**Best for:** Following along with the migration  

**Phases:**
- Phase 1: Azure Setup (15 min)
- Phase 2: Configure Environment Variables (10 min)
- Phase 3: Deploy Backend Code (10 min)
- Phase 4: Configure Frontend Variables (10 min)
- Phase 5: Commit & Deploy (5 min)
- Phase 6: Final Verification (5 min)

---

### 2. **[AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)** 
**Purpose:** Detailed Azure deployment explanation  
**Contains:** In-depth setup for each step  
**Best for:** Understanding what each step does  
**Topics:**
- Azure Student Account setup
- Different deployment options (Git vs GitHub Actions)
- Troubleshooting common issues
- Cost estimation

---

### 3. **[VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)**
**Purpose:** Configure frontend environment variables  
**Contains:** Vercel dashboard setup + code changes  
**Best for:** Setting up 3 environments (Dev/Preview/Prod)  
**Topics:**
- Add variables in Vercel dashboard
- Update frontend code to use env vars
- Test environment variables
- Securely handle secrets

---

### 4. **[AZURE_COMMANDS_QUICK_REFERENCE.md](./AZURE_COMMANDS_QUICK_REFERENCE.md)** ⚡ COPY-PASTE REFERENCE
**Purpose:** All commands in one file  
**Contains:** Ready-to-copy PowerShell commands  
**Best for:** Quick reference while executing  
**Uses:** Just copy and paste the commands  

---

## 🎯 QUICK START (5 MINUTES)

### Choose Your Path:

**Path A: Follow Step-by-Step (Recommended for first-time)**
1. Open: [RENDER_TO_AZURE_MIGRATION.md](./RENDER_TO_AZURE_MIGRATION.md)
2. Follow steps 1-24 in order
3. Come back here if you get stuck

**Path B: Copy-Paste Commands (Recommended if experienced)**
1. Open: [AZURE_COMMANDS_QUICK_REFERENCE.md](./AZURE_COMMANDS_QUICK_REFERENCE.md)
2. Copy commands one section at a time
3. Execute in PowerShell
4. Wait for completion before next section

**Path C: Deep Dive (Recommended to understand everything)**
1. Read: [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) - Understand Azure
2. Read: [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) - Understand Vercel
3. Execute: [RENDER_TO_AZURE_MIGRATION.md](./RENDER_TO_AZURE_MIGRATION.md) - Do the migration
4. Reference: [AZURE_COMMANDS_QUICK_REFERENCE.md](./AZURE_COMMANDS_QUICK_REFERENCE.md) - For commands

---

## ✅ PREREQUISITES CHECKLIST

Before you start, have these ready:

- [ ] **Azure Student Account** - https://azure.microsoft.com/en-us/free/students/
  - Already have? Skip activation
  - Don't have? Takes 5 minutes to activate
  
- [ ] **Azure CLI Installed**
  - Check: `az --version` in PowerShell
  - Need to install? Will be in Step 3 of migration guide

- [ ] **MongoDB Atlas Connection String**
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/daily-blogs`
  - Where to find: MongoDB Atlas → Dashboard → Connect → Copy connection string

- [ ] **Your .env File**
  - Current backend/.env with all secrets
  - Keep this safe during migration

- [ ] **Gmail App Password** (if using Gmail for emails)
  - Generate at: https://myaccount.google.com/apppasswords
  - Only needed if you send emails from your app

- [ ] **Your SMTP Credentials** (if using different email service)
  - Host, Port, Username, Password

---

## 🔄 PHASE BREAKDOWN

### Phase 1: AZURE SETUP (15 minutes)
Creates the infrastructure on Azure to host your backend

**What happens:**
1. Create Resource Group (container for resources)
2. Create App Service Plan (defines compute resources)
3. Create App Service (actual running Node.js app)

**Result:** Your app will be at `https://daily-blogs-api.azurewebsites.net`

---

### Phase 2: ENVIRONMENT VARIABLES (10 minutes)
Stores configuration and secrets securely

**What you'll add:**
- Database URL (MongoDB Atlas)
- Email credentials (SMTP)
- Session secrets (auto-generated)
- CORS settings (Frontend URL)

**Why this matters:** Keeps secrets out of your code

---

### Phase 3: DEPLOY BACKEND (10 minutes)
Pushes your Node.js code to Azure

**How it works:**
1. Add Azure as a Git remote
2. Push your backend code: `git push azure main`
3. Azure automatically downloads, installs dependencies, and runs your app

**Time:** Usually 2-5 minutes per deployment

---

### Phase 4: FRONTEND ENV VARS (10 minutes)
Tells frontend where to find the backend

**What you'll configure:**
- Production: Points to Azure backend
- Preview: Points to Azure backend (for testing)
- Development: Points to localhost (local testing)

**Why 3 environments?**
- Dev: For local testing on your machine
- Preview: Vercel test deployments (auto-created on pull requests)
- Production: Your live website

---

### Phase 5: COMMIT & DEPLOY (5 minutes)
Pushes all changes to GitHub

**What happens:**
1. Git commit all changes
2. GitHub push triggers Vercel redeploy
3. Frontend gets new environment variables

---

### Phase 6: VERIFICATION (5 minutes)
Confirms everything is working

**Tests:**
- [ ] Backend responds to health check
- [ ] Frontend loads without errors
- [ ] API calls reach backend (not Render)
- [ ] Chat/real-time features work

---

## 🔐 SECURITY: Environment Variables Explained

### Why use environment variables?

**Secrets should NEVER be in code:**
```javascript
// ❌ NEVER DO THIS
const dbURL = "mongodb+srv://user:password@cluster.mongodb.net/db";
const emailPassword = "mySecretPassword123";
```

**Instead, use environment variables:**
```javascript
// ✅ DO THIS
const dbURL = process.env.MONGODB_URI;       // Stored securely on Azure
const emailPassword = process.env.SMTP_PASSWORD; // Stored securely on Azure
```

### Where secrets are stored:

| Secret | Storage Location | Visibility |
|--------|-----------------|------------|
| **SESSION_SECRET** | Azure App Settings | Only on server (hidden) |
| **COOKIE_SECRET** | Azure App Settings | Only on server (hidden) |
| **JWT_SECRET** | Azure App Settings | Only on server (hidden) |
| **SMTP_PASSWORD** | Azure App Settings | Only on server (hidden) |
| **MONGODB_URI** | Azure App Settings | Only on server (hidden) |
| **VITE_API_URL** | Vercel Settings | Frontend visible (OK - not secret) |
| **VITE_NODE_ENV** | Vercel Settings | Frontend visible (OK - not secret) |

**Frontend variables:**
- Can be seen in browser (check DevTools)
- Should NOT contain secrets
- OK to put: API URLs, app names, public IDs

**Backend variables:**
- Never sent to browser
- Should contain all secrets
- OK to put: Passwords, encryption keys, DB credentials

---

## 📊 WHAT CHANGES DURING MIGRATION

### Your Code: NO CHANGES (already compatible)
Your Node.js code works the same on Azure as it did on Render

### Environment Variables: SAME NAMES (just new storage)
- Same variable names as your current `.env`
- Just stored in Azure instead of Render

### Frontend Configuration: UPDATED
- Update API endpoint from `render.com` to `azure`
- Update frontend `.env` for Vercel

### DNS: NO CHANGES (stays pointing to Vercel)
- Domain `dailyblogs.website` → Points to Vercel frontend
- Frontend → Calls Azure backend
- Everything works the same to users

---

## 🎯 SUCCESS CRITERIA

When finished, you should have:

✅ **Backend deployed to Azure**
- URL: `https://daily-blogs-api.azurewebsites.net`
- All environment variables configured
- Database connection working
- Health check responding

✅ **Environment variables configured**
- Vercel frontend knows where Azure backend is
- Frontend loads correctly
- API calls reach Azure backend

✅ **All changes committed**
- No uncommitted code
- All guides in /repo
- Ready for next deployment

✅ **Testing passed**
- [ ] `https://dailyblogs.website` loads
- [ ] API calls work in browser console
- [ ] Blog posts display
- [ ] Chat functionality works (if you have it)
- [ ] Email sending works (if you test it)

---

## 📞 GETTING HELP

### If something breaks:

1. **Check Logs**
   ```powershell
   az webapp log tail --resource-group daily-blogs-rg --name daily-blogs-api
   ```

2. **See Common Issues** in [RENDER_TO_AZURE_MIGRATION.md](./RENDER_TO_AZURE_MIGRATION.md#-troubleshooting)

3. **Search for error message** in [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md#-troubleshooting)

4. **Check environment variables**
   ```powershell
   az webapp config appsettings list --resource-group daily-blogs-rg --name daily-blogs-api
   ```

### Common Issues Quick Links:

- **502 Bad Gateway?** → Check app logs
- **API 404 errors?** → Check `VITE_API_URL` in Vercel
- **Email not sending?** → Check `SMTP_PASSWORD` in Azure
- **MongoDB connection fails?** → Check `MONGODB_URI` format
- **CORS errors?** → Check backend has `CORS_ORIGIN` set correctly

---

## 🗂️ FILE STRUCTURE AFTER MIGRATION

Your repo will have these new files:

```
daily-blogs/
├── ...existing files...
├── AZURE_DEPLOYMENT_GUIDE.md              ← Detailed Azure guide
├── AZURE_COMMANDS_QUICK_REFERENCE.md      ← Copy-paste commands
├── RENDER_TO_AZURE_MIGRATION.md           ← Main checklist ⭐
├── VERCEL_ENV_SETUP.md                    ← Vercel configuration
├── frontend/
│   ├── .env.local                         ← Local dev variables (NEW)
│   ├── .env.example                       ← Documentation (NEW)
│   └── vercel.json                        ← Already updated
└── backend/
    ├── .env                               ← Still used locally
    └── .env.example                       ← Documentation
```

---

## ⏱️ TIMELINE & MILESTONES

| Time | Milestone | Tools |
|------|-----------|-------|
| **0-10 min** | Azure account ready | Browser |
| **10-25 min** | Resources created | PowerShell + Azure CLI |
| **25-35 min** | Code deployed | Git + Terminal |
| **35-45 min** | Frontend updated | VS Code + Git |
| **45-60 min** | Testing complete | Browser DevTools |

---

## 🚀 NEXT STEPS AFTER MIGRATION

1. **Monitor Performance**
   - Check Azure metrics dashboard weekly
   - Monitor request counts and errors

2. **Setup Monitoring Alerts**
   - Alert if CPU > 80%
   - Alert if error rate > 1%
   - Alert if response time > 5 seconds

3. **Plan Scaling**
   - Free tier: 60 min/day
   - B1 plan: $10/month for 24/7 uptime
   - Upgrade when you're ready for production traffic

4. **Backup Strategy**
   - MongoDB Atlas handles backups
   - Consider enabling application snapshots

5. **Keep Old Render**
   - Don't delete yet (great for rollback)
   - Keep running for 1-2 weeks as backup
   - Then delete if everything works perfectly

---

## 📚 LEARNING RESOURCES

- **Azure Docs:** https://docs.microsoft.com/azure/
- **Vercel Docs:** https://vercel.com/docs
- **Node.js on Azure:** https://docs.microsoft.com/azure/app-service/app-service-web-get-started-nodejs
- **Environment Variables:** https://12factor.net/config
- **Azure CLI Reference:** https://docs.microsoft.com/cli/azure/reference-index

---

## ✨ SUMMARY

| Component | Current | After Migration |
|-----------|---------|------------------|
| **Frontend** | Vercel | Vercel (no change) |
| **Backend** | Render | Azure ✅ NEW |
| **Database** | Atlas | Atlas (no change) |
| **Frontend Domain** | dailyblogs.website | dailyblogs.website (no change) |
| **Backend URL** | daily-blogs.onrender.com | daily-blogs-api.azurewebsites.net ✅ NEW |
| **Env Variables** | Render settings | Azure App Settings ✅ NEW |
| **Frontend Env Vars** | Vercel Settings | Vercel Settings (updated) ✅ |

---

## 🎉 YOU'RE READY!

Pick a guide above and start your migration:

1. **Beginners:** Start with [RENDER_TO_AZURE_MIGRATION.md](./RENDER_TO_AZURE_MIGRATION.md)
2. **Copy-Paste:** Use [AZURE_COMMANDS_QUICK_REFERENCE.md](./AZURE_COMMANDS_QUICK_REFERENCE.md)
3. **Deep Understanding:** Read [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) first

Good luck! 🚀

