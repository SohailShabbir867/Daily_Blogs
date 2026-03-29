# 🌐 DNS Records Configuration Guide

## Current Setup

- **Frontend:** Vercel (dailyblogs.website)
- **Backend:** Render (daily-blogs-api.onrender.com)
- **Domain Registrar:** Based on your screenshot

---

## ✅ DNS Records Required

### 1. **Main Domain - Point to Vercel**

| Field       | Type                          | Value                   | TTL  |
| ----------- | ----------------------------- | ----------------------- | ---- |
| **Name**    | `@` (or `dailyblogs.website`) |                         |      |
| **Type**    | `A`                           | `76.76.19.21`           | 3600 |
| **OR Type** | `CNAME`                       | `cname.vercel-dns.com.` | 3600 |

> **Note:** Use CNAME if your registrar allows it (preferred for Vercel). Otherwise use A record.

---

### 2. **Subdomain for API (Optional but Recommended)**

| Field    | Type    | Value                          | TTL  |
| -------- | ------- | ------------------------------ | ---- |
| **Name** | `api`   |                                |      |
| **Type** | `CNAME` | `daily-blogs-api.onrender.com` | 3600 |

**Result:** `https://api.dailyblogs.website` → Render backend

_Note: Not required if using proxying via vercel.json_

---

### 3. **Subdomain for CDN (Optional)**

| Field    | Type    | Value                                | TTL  |
| -------- | ------- | ------------------------------------ | ---- |
| **Name** | `cdn`   |                                      |      |
| **Type** | `CNAME` | `cdn.dailyblogs.website.edgecdn.com` | 3600 |

---

## 🔐 Email Configuration (if using subdomain)

| Field    | Type | Value                     | Priority | TTL  |
| -------- | ---- | ------------------------- | -------- | ---- |
| **Name** | `@`  |                           |          |      |
| **Type** | `MX` | `mail.yourmailserver.com` | 10       | 3600 |

---

## ✅ SSL/TLS Verification Records

### For Vercel SSL Certificate:

Vercel automatically issues certificates. If needed to add TXT record for verification:

| Field    | Type              | Value                           |
| -------- | ----------------- | ------------------------------- |
| **Name** | `_acme-challenge` | [Vercel-provided token]         |
| **Type** | `TXT`             | [Certificate validation string] |

_Check Vercel dashboard → Settings → Domains → SSL for the exact values_

---

## ✅ Google Search Console DNS Verification

To verify domain ownership to Google:

1. Go to: https://search.google.com/search-console
2. Add property: `https://dailyblogs.website`
3. Google will provide a TXT record to add:

| Field    | Type                        | Value                                    |
| -------- | --------------------------- | ---------------------------------------- |
| **Name** | `@` or `dailyblogs.website` | `google-site-verification=[code]`        |
| **Type** | `TXT`                       | (Google will provide the full TXT value) |

---

## 📋 Step-by-Step DNS Setup Process

### Step 1: Access Your Domain Registrar

- Log into your domain registrar (GoDaddy, Namecheap, etc.)
- Navigate to **DNS Settings** or **DNS Management**

### Step 2: Update @ (Root) Record - Point to Vercel

**If registrar supports CNAME on @ (root):**

```
@ CNAME cname.vercel-dns.com.
```

**If not (most registrars don't), use A record:**

```
@ A 76.76.19.21
```

### Step 3: Add www Subdomain (Optional)

```
www CNAME cname.vercel-dns.com.
```

Or just:

```
www A 76.76.19.21
```

### Step 4: Verify in Vercel Dashboard

1. Go to: https://vercel.com
2. Select your project: `daily-blogs` (frontend)
3. Settings → Domains
4. Check status - should show **✓ Valid Configuration**

---

## 🔍 Verification Commands

### Check if DNS propagated (PowerShell):

```powershell
# Check A record
nslookup dailyblogs.website

# Check CNAME record
nslookup -type=cname dailyblogs.website

# Check MX record (email)
nslookup -type=mx dailyblogs.website

# Check TXT record (verification)
nslookup -type=txt dailyblogs.website

# Check all records
nslookup -type=any dailyblogs.website
```

### Expected Output:

```
dailyblogs.website canonical name = cname.vercel-dns.com.
cname.vercel-dns.com.   canonical name = alias.vercel-dns.com.
alias.vercel-dns.com.    internet address = 76.76.19.21
```

---

## ⏱️ DNS Propagation Timeline

| Time        | Status                                |
| ----------- | ------------------------------------- |
| Immediate   | Changes propagate to root nameservers |
| 5-30 min    | Most DNS resolvers updated            |
| 2-4 hours   | Full global propagation (typical)     |
| 24-48 hours | All edge cases resolved               |

**During propagation:** You may experience intermittent access. This is normal.

---

## ✅ Verification Steps

After setting DNS records:

### 1. Test Sitemap Accessibility

```powershell
# Via PowerShell (or browser)
Invoke-WebRequest -Uri "https://dailyblogs.website/sitemap.xml"
Invoke-WebRequest -Uri "https://dailyblogs.website/robots.txt"
```

### 2. Test Backend API

```powershell
Invoke-WebRequest -Uri "https://dailyblogs.website/api/health"
```

### 3. Verify SSL Certificate

- Open `https://dailyblogs.website` in browser
- Click lock icon → "View Certificate"
- Should show **Secure** with **Vercel cert**

### 4. Check with Google

- Copy URL: `https://dailyblogs.website`
- Search: `site:dailyblogs.website`
- If DNS works, you'll see pages indexed

---

## 🚨 Troubleshooting Common DNS Issues

### Issue: "DNS name not found" or "Can't resolve domain"

**Solution:**

- Wait 2-4 hours for propagation
- Clear browser cache: `Ctrl+Shift+Delete`
- Try from different network (mobile data vs WiFi)
- Use different DNS: 8.8.8.8, 1.1.1.1

### Issue: Shows Vercel 404, not your site

**Solution:**

- Domain not added to Vercel project yet
- Go to Vercel → Settings → Domains → Add domain
- Verify DNS records in Vercel dashboard

### Issue: SSL certificate error

**Solution:**

- Wait 24 hours after DNS setup
- Vercel auto-issues certificate after DNS validates
- Manually trigger cert: Vercel → Settings → SSL/TLS

### Issue: Backend API not accessible via api.dailyblogs.website

**Solution:**

- Update vercel.json with rewrites (already done ✓)
- Use `/api/*` routes which proxy to backend
- Or manually add CNAME record for `api` subdomain

---

## 📌 Important Notes

1. **Vercel Deployment:** Make sure domain is added in Vercel dashboard
2. **SSL Certificates:** Automatically managed by Vercel (no extra config needed)
3. **Email:** If using Gmail, no MX records needed. If custom email, add MX record
4. **Refresh Rate:** Set TTL to 3600 (1 hour) initially, reduce to 300 (5 min) after verification
5. **Backups:** Take screenshot of current DNS config before making changes

---

## ✅ Current Status Summary

| Component             | Status               | Action                  |
| --------------------- | -------------------- | ----------------------- |
| Frontend Deployment   | ✓ Vercel             | None                    |
| Backend Deployment    | ✓ Render             | None                    |
| Database              | ✓ Atlas              | None                    |
| DNS A/CNAME Record    | ⏳ Need verification | Add to registrar        |
| SSL Certificate       | ✓ Auto-provisioned   | None                    |
| Sitemap Proxy         | ✅ Fixed             | Deploy changes          |
| robots.txt            | ✅ Updated           | Deploy changes          |
| Google Search Console | ❌ Not verified      | Add TXT record & submit |
