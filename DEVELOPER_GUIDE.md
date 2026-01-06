# Daily Blogs - Developer Guide

Complete documentation for developers working on the Daily Blogs platform.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Environment Setup](#environment-setup)
4. [API Reference](#api-reference)
5. [Database Models](#database-models)
6. [Authentication](#authentication)
7. [Admin Features](#admin-features)
8. [Common Commands](#common-commands)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/daily-blogs.git
cd daily-blogs

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

```bash
# Terminal 1 - Backend (from backend folder)
npm run dev

# Terminal 2 - Frontend (from frontend folder)
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Default Credentials (after seeding)

| Role  | Email                | Password |
| ----- | -------------------- | -------- |
| Admin | admin@dailyblogs.com | Admin123 |
| User  | john@example.com     | John123  |

---

## Project Structure

```
daily-blogs/
├── frontend/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── BlogCard.jsx
│   │   │   ├── CommentSection.jsx
│   │   │   ├── RichTextEditor.jsx
│   │   │   └── NewsletterSubscription.jsx
│   │   ├── context/             # React Context providers
│   │   │   ├── AuthContext.jsx  # Authentication state
│   │   │   └── BlogContext.jsx  # Blog data state
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── BlogDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/           # Admin pages
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── CreateBlog.jsx
│   │   │       ├── EditBlog.jsx
│   │   │       ├── ManageBlogs.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       └── ContactsManagement.jsx
│   │   ├── services/            # API service modules
│   │   │   ├── api.js           # Axios instance & interceptors
│   │   │   ├── authService.js
│   │   │   ├── blogService.js
│   │   │   ├── commentService.js
│   │   │   ├── userService.js
│   │   │   └── adminService.js
│   │   └── assets/              # Static assets
│   └── package.json
│
├── backend/                     # Node.js + Express API
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── session.js           # Session configuration
│   │   └── cors.js              # CORS configuration
│   ├── controllers/             # Route handlers
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   ├── commentController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── contactController.js
│   │   └── subscriberController.js
│   ├── middleware/
│   │   ├── auth.js              # isAuthenticated middleware
│   │   ├── admin.js             # isAdmin, isSuperAdmin middleware
│   │   ├── errorHandler.js      # Global error handling
│   │   └── rateLimiter.js       # Rate limiting
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Blog.js
│   │   ├── Comment.js
│   │   ├── Contact.js
│   │   └── Subscriber.js
│   ├── routes/                  # API route definitions
│   │   ├── index.js             # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── blogRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── contactRoutes.js
│   │   └── subscriberRoutes.js
│   ├── utils/
│   │   ├── emailService.js      # Email sending (nodemailer)
│   │   ├── errors.js            # Custom error classes
│   │   ├── helpers.js           # Helper functions
│   │   ├── validators.js        # Request validators
│   │   ├── sanitize.js          # Input sanitization
│   │   └── securityLogger.js    # Security event logging
│   ├── seeds/
│   │   └── seed.js              # Database seeder
│   ├── scripts/
│   │   ├── setupSuperAdmin.js   # Create super admin user
│   │   └── clearSessions.js     # Clear expired sessions
│   ├── server.js                # Main entry point
│   └── package.json
│
└── README.md
```

---

## Environment Setup

### Backend (.env)

Create `backend/.env` with these variables:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dailyblogs

# Session (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
SESSION_SECRET=your_super_secret_session_key
SESSION_MAX_AGE=604800000

# Cookies
COOKIE_SECURE=false
COOKIE_DOMAIN=

# CORS
CLIENT_URL=http://localhost:5173

# Admin
ADMIN_EMAIL_PATTERN=admin
SUPER_ADMIN_EMAIL=your_admin_email@example.com

# Email (Gmail with App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend (.env)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Reference

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint                | Description            | Auth |
| ------ | ----------------------- | ---------------------- | ---- |
| POST   | `/auth/register`        | Register new user      | No   |
| POST   | `/auth/login`           | Login user             | No   |
| POST   | `/auth/logout`          | Logout user            | Yes  |
| GET    | `/auth/me`              | Get current user       | Yes  |
| GET    | `/auth/check`           | Check session validity | No   |
| POST   | `/auth/forgot-password` | Request password reset | No   |
| POST   | `/auth/reset-password`  | Reset password         | No   |
| POST   | `/auth/verify-email`    | Verify email with OTP  | No   |

### Blog Endpoints

| Method | Endpoint          | Description      | Auth  |
| ------ | ----------------- | ---------------- | ----- |
| GET    | `/blogs`          | Get all blogs    | No    |
| GET    | `/blogs/:slug`    | Get blog by slug | No    |
| POST   | `/blogs`          | Create blog      | Admin |
| PUT    | `/blogs/:id`      | Update blog      | Admin |
| DELETE | `/blogs/:id`      | Delete blog      | Admin |
| POST   | `/blogs/:id/like` | Toggle like      | Yes   |

### Comment Endpoints

| Method | Endpoint              | Description       | Auth |
| ------ | --------------------- | ----------------- | ---- |
| GET    | `/blogs/:id/comments` | Get blog comments | No   |
| POST   | `/blogs/:id/comments` | Create comment    | Yes  |
| PUT    | `/comments/:id`       | Update comment    | Yes  |
| DELETE | `/comments/:id`       | Delete comment    | Yes  |

### User Endpoints

| Method | Endpoint                 | Description        | Auth |
| ------ | ------------------------ | ------------------ | ---- |
| GET    | `/users/:id`             | Get public profile | No   |
| GET    | `/users/profile/me`      | Get own profile    | Yes  |
| PUT    | `/users/profile`         | Update profile     | Yes  |
| GET    | `/users/saved-blogs`     | Get saved blogs    | Yes  |
| POST   | `/users/saved-blogs/:id` | Toggle save blog   | Yes  |

### Admin Endpoints

| Method | Endpoint                   | Description          | Auth        |
| ------ | -------------------------- | -------------------- | ----------- |
| GET    | `/admin/dashboard`         | Dashboard statistics | Admin       |
| GET    | `/admin/users`             | Get all users        | Super Admin |
| PUT    | `/admin/users/:id/role`    | Update user role     | Super Admin |
| PUT    | `/admin/users/:id/status`  | Update user status   | Super Admin |
| GET    | `/admin/blogs`             | Get all blogs        | Admin       |
| PUT    | `/admin/blogs/:id/feature` | Toggle featured      | Admin       |
| GET    | `/admin/contacts`          | Get contact messages | Super Admin |
| DELETE | `/admin/contacts/:id`      | Delete contact       | Super Admin |

### Contact & Newsletter

| Method | Endpoint     | Description             | Auth |
| ------ | ------------ | ----------------------- | ---- |
| POST   | `/contact`   | Submit contact form     | No   |
| POST   | `/subscribe` | Subscribe to newsletter | No   |

---

## Database Models

### User

```javascript
{
  name: String,           // Required, 2-50 chars
  email: String,          // Required, unique
  password: String,       // Hashed with bcrypt
  role: String,           // 'user' | 'admin'
  isSuperAdmin: Boolean,  // Super admin flag
  avatar: String,         // Profile picture URL
  bio: String,            // User bio
  savedBlogs: [ObjectId], // Saved blog references
  isActive: Boolean,      // Account status
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Blog

```javascript
{
  title: String,          // Required, 5-200 chars
  slug: String,           // URL-friendly, unique
  description: String,    // Required, 20-500 chars
  content: String,        // HTML content
  image: String,          // Cover image URL
  category: String,       // Blog category
  author: ObjectId,       // Reference to User
  likes: [ObjectId],      // Users who liked
  views: Number,          // View count
  readTime: Number,       // Estimated read time
  status: String,         // 'draft' | 'published'
  visibility: String,     // 'everyone' | 'members'
  isFeatured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment

```javascript
{
  content: String,        // Required, 1-1000 chars
  blog: ObjectId,         // Reference to Blog
  author: ObjectId,       // Reference to User
  parentComment: ObjectId,// For nested replies
  likes: [ObjectId],
  isEdited: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication

### Session-Based Auth

- Uses `express-session` with MongoDB store (`connect-mongo`)
- Session stored in `sessions` collection
- Cookie-based session ID

### Middleware

```javascript
// Check if user is logged in
const { isAuthenticated } = require("./middleware/auth");

// Check if user is admin
const { isAdmin } = require("./middleware/admin");

// Check if user is super admin
const { isSuperAdmin } = require("./middleware/admin");

// Usage in routes
router.get("/protected", isAuthenticated, controller);
router.get("/admin-only", isAuthenticated, isAdmin, controller);
router.get("/super-only", isAuthenticated, isSuperAdmin, controller);
```

### User Roles

| Role        | Permissions                                  |
| ----------- | -------------------------------------------- |
| `user`      | Read blogs, comment, like, save blogs        |
| `admin`     | All user + create/edit/delete blogs          |
| Super Admin | All admin + manage users, contacts, settings |

---

## Admin Features

### Dashboard Statistics

- Total blogs, users, comments
- Recent activity
- Popular blogs

### User Management (Super Admin)

- View all users
- Change user roles
- Activate/deactivate accounts

### Blog Management

- Create, edit, delete blogs
- Feature/unfeature blogs
- Rich text editor

### Contact Management (Super Admin)

- View contact form submissions
- Delete messages

---

## Common Commands

### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server (nodemon)
npm run seed       # Seed database with sample data
```

### Frontend

```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Utility Scripts

```bash
# Create super admin user
cd backend
node scripts/setupSuperAdmin.js

# Clear expired sessions
node scripts/clearSessions.js
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

```
Error: MongoNetworkError
```

**Solution**: Check your `MONGODB_URI` in `.env` and ensure MongoDB is running.

#### 2. CORS Errors

```
Access-Control-Allow-Origin error
```

**Solution**: Ensure `CLIENT_URL` in backend `.env` matches your frontend URL.

#### 3. Session Not Persisting

**Solution**:

- Check `SESSION_SECRET` is set
- Ensure cookies are enabled in browser
- Check `COOKIE_SECURE=false` for localhost

#### 4. Email Not Sending

**Solution**:

- Use Gmail App Password, not regular password
- Generate at: https://myaccount.google.com/apppasswords
- Check SMTP settings in `.env`

#### 5. Admin Access Denied

**Solution**:

- Ensure user has `role: 'admin'`
- For super admin, ensure `isSuperAdmin: true`
- Run `node scripts/setupSuperAdmin.js` to create super admin

### Debug Tips

1. **Check backend logs** in terminal
2. **Check browser console** (F12) for frontend errors
3. **Check Network tab** for API responses
4. **Verify `.env` files** are correct
5. **Restart servers** after `.env` changes

---

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent API abuse
- **Mongo Sanitize**: NoSQL injection prevention
- **Password Hashing**: bcrypt with salt rounds
- **Session Security**: Secure cookies, httpOnly
- **Input Validation**: express-validator

---

## Technologies

### Frontend

- React 19
- React Router 7
- Tailwind CSS 4
- Axios
- Vite

### Backend

- Node.js
- Express.js 4
- MongoDB + Mongoose 8
- express-session + connect-mongo
- bcryptjs
- express-validator
- helmet, cors, morgan
- nodemailer

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License

---

_Daily Blogs Team_
