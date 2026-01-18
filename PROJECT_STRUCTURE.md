# Daily Blogs - Project Structure Guide

Quick reference to find any feature in the codebase.

## 📂 Frontend Structure

### Pages (`frontend/src/pages/`)

#### 🏠 Main Pages
- `Home.jsx` - Homepage with featured blogs
- `About.jsx` - About page
- `Contact.jsx` - Contact form

#### 🔐 Authentication
- `Login.jsx` - User login
- `Register.jsx` - New user registration (+ Terms acceptance)
- `ForgotPassword.jsx` - Request password reset
- `ResetPassword.jsx` - Reset password with token
- `VerifyEmail.jsx` - Email verification
- `VerifyOTP.jsx` - OTP verification

#### 📝 Blogs
- `BlogDetails.jsx` - Single blog view with comments
- `SavedBlogs.jsx` - User's saved/bookmarked blogs

#### 📋 Legal
- `PrivacyPolicy.jsx` - Privacy policy (SEO optimized)
- `TermsOfService.jsx` - Terms and conditions (SEO optimized)

#### 👑 Admin (`pages/admin/`)
- `AdminDashboard.jsx` - Admin overview & stats
- `BlogManagement.jsx` - Manage all blogs
- `CreateBlog.jsx` - Rich text editor for new blogs
- `EditBlog.jsx` - Edit existing blogs
- `UserManagement.jsx` - Manage users (Super Admin only)
- `ContactMessages.jsx` - View contact submissions
- `SubscriberManagement.jsx` - Manage newsletter subscribers

### Components (`frontend/src/components/`)

#### Layout
- `Navbar.jsx` - Top navigation with auth state
- `Footer.jsx` - Footer with links
- `BlogCard.jsx` - Reusable blog preview card

#### Features
- `RichTextEditor.jsx` - MS Word-like editor with code blocks
- `CommentSection.jsx` - Blog comments with replies
- `NewsletterSubscription.jsx` - Email subscription widget

#### 💬 Chat (`components/Chat/`)
- `ChatWidget.jsx` - Floating chat button
- `ChatWindow.jsx` - Chat interface with encryption
- `ConversationList.jsx` - Admin inbox (view conversations)
- `SupportAdminList.jsx` - User view (select admin to chat)

### Context (`frontend/src/context/`)
- `AuthContext.jsx` - User authentication state
- `ChatContext.jsx` - Socket.IO & chat state
- `ThemeContext.jsx` - Theme management

### Services (`frontend/src/services/`)
- `api.js` - Axios instance with interceptors
- `authService.js` - Auth API calls
- `blogService.js` - Blog CRUD operations
- `commentService.js` - Comment operations
- `contactService.js` - Contact form
- `subscriberService.js` - Newsletter subscriptions
- `userService.js` - User profile management

---

## 📂 Backend Structure

### Routes (`backend/routes/`)
- `adminRoutes.js` - Admin-only endpoints
- `authRoutes.js` - Login, register, password reset
- `blogRoutes.js` - Blog CRUD
- `chatRoutes.js` - Chat & conversations (encrypted)
- `commentRoutes.js` - Comments & replies
- `contactRoutes.js` - Contact form submissions
- `subscriberRoutes.js` - Newsletter management
- `userRoutes.js` - User profile & settings
- `index.js` - Route aggregator

### Controllers (`backend/controllers/`)
- `adminController.js` - Admin dashboard stats
- `authController.js` - Authentication logic
- `blogController.js` - Blog operations
- `chatController.js` - Chat & messages (with encryption)
- `commentController.js` - Comment handling
- `contactController.js` - Contact form processing
- `notificationController.js` - Email notifications
- `subscriberController.js` - Newsletter subscribers
- `userController.js` - User management

### Models (`backend/models/`)
- `User.js` - User schema (+ terms acceptance, chat support)
- `Blog.js` - Blog posts
- `Comment.js` - Blog comments
- `Conversation.js` - Chat conversations (5-day TTL)
- `Message.js` - Chat messages (AES-256 encrypted, auto-delete)
- `Contact.js` - Contact submissions
- `Subscriber.js` - Newsletter emails
- `Session.js` - User sessions

### Middleware (`backend/middleware/`)
- `auth.js` - Authentication & authorization
- `errorHandler.js` - Global error handling
- `rateLimiter.js` - Rate limiting
- `upload.js` - File upload (images)
- `validator.js` - Input validation

### Utils (`backend/utils/`)
- `encryption.js` - AES-256-GCM for chat (NEW)
- `emailService.js` - SMTP email sending
- `errors.js` - Custom error classes
- `helpers.js` - Common utilities
- `logger.js` - Logging functionality
- `validators.js` - Validation schemas

---

## 🔍 Quick Find

**Need to modify:**

| Feature | Frontend | Backend |
|---------|----------|---------|
| **Login/Auth** | `pages/Login.jsx` | `controllers/authController.js` |
| **Registration** | `pages/Register.jsx` | `controllers/authController.js` |
| **Blog Editor** | `pages/admin/CreateBlog.jsx` | `controllers/blogController.js` |
| **Rich Text Editor** | `components/RichTextEditor.jsx` | - |
| **Chat System** | `components/Chat/*` | `controllers/chatController.js` |
| **Encryption** | - | `utils/encryption.js` |
| **Comments** | `components/CommentSection.jsx` | `controllers/commentController.js` |
| **Admin Dashboard** | `pages/admin/AdminDashboard.jsx` | `controllers/adminController.js` |
| **User Management** | `pages/admin/UserManagement.jsx` | `controllers/userController.js` |
| **Legal Pages** | `pages/TermsOfService.jsx`, `PrivacyPolicy.jsx` | - |

---

## 🎨 Styling
- `App.css` - Global styles (code blocks, prose, tables)
- `index.css` - Tailwind imports
- Tailwind CSS - Utility-first framework

---

## 🔐 Security Features

| Feature | Location |
|---------|----------|
| Password Hashing | `models/User.js` (bcrypt) |
| Chat Encryption | `utils/encryption.js` (AES-256-GCM) |
| Input Sanitization | `middleware/validator.js`, DOMPurify in editor |
| Rate Limiting | `middleware/rateLimiter.js` |
| XSS Protection | Helmet middleware in `server.js` |
| CSRF Protection | Session-based auth |

---

## 📊 Key Features Map

### ✅ Implemented & Working
- User authentication (email verification, OTP)
- Blog creation with rich text editor
- Comment system with replies
- Chat system (encrypted, auto-delete)
- Admin dashboard
- Newsletter subscriptions
- Contact form
- Terms & Privacy pages (SEO optimized)

### 🔒 Security
- AES-256-GCM message encryption
- Bcrypt password hashing
- Session-based auth
- Rate limiting
- Input validation
- Terms acceptance on registration
