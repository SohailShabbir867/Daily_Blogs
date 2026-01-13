# MongoDB Setup Guide for Daily Blogs

## ✅ Setup Complete

Your MongoDB connection has been successfully configured!

### Current Configuration

- **MongoDB URI**: `mongodb+srv://mahar:mahar@project.e5k7hmj.mongodb.net/dailyblogs`
- **Database**: dailyblogs
- **Status**: ✅ Connected and verified

## 🚀 Running the Application

### Backend Server (Port 5000)

```bash
cd backend
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
✅ Session middleware configured
✅ API routes configured
✅ Server running on http://localhost:5000
```

### Frontend Server (Port 5173)

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## 🔧 Configuration Details

### Backend Environment Variables

The following are configured in `backend/.env`:

- `MONGODB_URI` - ✅ Configured with password
- `SESSION_SECRET` - ⚠️ Using default (recommended to change for production)
- `SUPER_ADMIN_EMAIL` - Set to `shabbirsohail33@gmail.com`
- `SMTP_USER` & `SMTP_PASS` - ⚠️ Needs configuration for email features

### What's Working

✅ MongoDB connection
✅ Backend API server
✅ Frontend development server
✅ Session management
✅ All routes and middleware

### What Needs Configuration (Optional)

For full functionality, you may want to configure:

1. **Email Service** (for password reset, OTP verification):
   - `SMTP_USER` - Your Gmail address
   - `SMTP_PASS` - Gmail App Password (not regular password)
   - Get App Password: https://myaccount.google.com/apppasswords

2. **Session Secret** (for production):
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and replace `SESSION_SECRET` in `.env`

## 🔐 Security Notes

- ✅ `.env` file is gitignored (passwords safe)
- ✅ HTTPS/secure cookies disabled for local development
- ⚠️ For production deployment:
  - Generate strong `SESSION_SECRET`
  - Configure email service
  - Enable `COOKIE_SECURE=true`
  - Update `CLIENT_URL` to production domain

## 🐛 Troubleshooting

### If backend fails to connect:

1. **Check MongoDB Atlas**:
   - Verify cluster is running
   - Check IP whitelist (0.0.0.0/0 allows all IPs)
   - Verify username and password

2. **Check credentials**:
   - Username: `mahar`
   - Password: `mahar`
   - Database: `dailyblogs`

3. **Test connection string**:
   - MongoDB Compass can test the connection
   - Use the exact URI from `.env` file

### If port is already in use:

- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (5173): Vite will auto-increment to 5174

## 📝 Database Seeding (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@dailyblogs.com` / `Admin123`
- Regular user: `john@example.com` / `John123`
- Sample blog posts

## 🎉 You're All Set!

Both servers are configured and ready to run. Start both servers in separate terminals to use the full application.
