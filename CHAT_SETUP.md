# Chat System - Quick Setup Guide

## 🚀 How to Enable Chat for Admins

Since the chat system is now complete, here's how to enable it:

### Option 1: Super Admin Dashboard (Recommended)

1. Login as Super Admin
2. Go to **Admin → User Management**
3. Find an admin user
4. Toggle "Chat Support" to **ON**
5. Admin will now appear in support team list

### Option 2: Direct Database (For Testing)

```javascript
// In MongoDB Compass or mongosh:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isChatSupport: true, isActive: true } },
);
```

### Option 3: API Call

```bash
# As super admin
PATCH http://localhost:5000/api/chat/admin-status/:adminId
Body: { "enabled": true }
```

---

## 📋 Testing Checklist

### 1. Enable Chat Support

- [ ] At least one admin has `isChatSupport: true`
- [ ] Admin is `isActive: true`

### 2. Test as User

- [ ] Login as regular user
- [ ] See chat button (bottom-right)
- [ ] Click chat button
- [ ] See admin in support team list
- [ ] Select admin
- [ ] Chat window opens

### 3. Send Messages

- [ ] Type message
- [ ] See character counter (near 2000)
- [ ] Send message
- [ ] Message appears instantly
- [ ] Try typing - sees typing indicator

### 4. Test as Admin

- [ ] Login as admin (who has chat support enabled)
- [ ] Open chat
- [ ] See user's conversation (if any)
- [ ] Respond to user
- [ ] User sees message instantly

### 5. Real-Time Features

- [ ] Typing indicators work
- [ ] Messages appear without refresh
- [ ] Unread badge shows correct count
- [ ] Connection status indicator works

### 6. Responsive Design

- [ ] Open on mobile device
- [ ] Chat window resizes correctly
- [ ] Back button appears on mobile
- [ ] Touch targets are large enough

---

## 🔧 How to Verify 7-Day Auto-Deletion

### Check TTL Indexes (MongoDB Compass or mongosh)

```javascript
// Check Message indexes
db.messages.getIndexes();
// Should see: { "createdAt": 1 }, { expireAfterSeconds: 604800 }

// Check Conversation indexes
db.conversations.getIndexes();
// Should see: { "lastActivityAt": 1 }, { expireAfterSeconds: 604800 }
```

### Manual Test (Optional)

```javascript
// Create a test message with old date
db.messages.insertOne({
  conversationId: ObjectId("..."),
  sender: ObjectId("..."),
  content: "Test message",
  createdAt: new Date("2020-01-01"), // 4+ years ago
  updatedAt: new Date(),
});

// Wait 60 seconds, MongoDB will delete it
// Check after 1 minute:
db.messages.find({ content: "Test message" });
// Should return nothing (deleted by TTL)
```

---

## 🎨 Customization

### Colors (if needed)

All chat components use Tailwind classes. To change colors:

```javascript
// ChatWidget.jsx, ChatWindow.jsx, SupportAdminList.jsx
// Find: emerald-500, emerald-600
// Replace with: blue-500, blue-600 (or any color)
```

### Auto-Delete Duration

To change from 7 days to another duration:

```javascript
// backend/models/Message.js
messageSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 14 * 24 * 60 * 60, // 14 days
  },
);

// backend/models/Conversation.js
conversationSchema.index(
  { lastActivityAt: 1 },
  {
    expireAfterSeconds: 14 * 24 * 60 * 60, // 14 days
  },
);
```

**Note:** After changing, restart server. MongoDB will apply new TTL on next run.

---

## 🐛 Troubleshooting

### Chat button not showing

- ✅ Check: User is logged in (`user` exists in AuthContext)
- ✅ Check: Browser console for errors
- ✅ Check: ChatWidget imported in App.jsx

### No admins in support list

- ✅ Check: At least one admin has `isChatSupport: true`
- ✅ Check: Admin is `isActive: true`
- ✅ Run: `GET /api/chat/support-admins` (should return admins)

### Messages not sending

- ✅ Check: Socket.IO connected (green dot on chat button)
- ✅ Check: Backend running on port 5000
- ✅ Check: CORS configured (`http://localhost:5173`)
- ✅ Check: Browser console for errors

### Socket not connecting

- ✅ Check: `VITE_API_URL` in frontend `.env` (should be `http://localhost:5000/api`)
- ✅ Check: Backend Socket.IO is running
- ✅ Check: Firewall allows port 5000

### Messages not deleting after 7 days

- ✅ Check: TTL indexes exist (`db.messages.getIndexes()`)
- ✅ MongoDB TTL monitor runs every 60 seconds
- ✅ Documents deleted when `createdAt + 7 days < now`

---

## 📊 Performance Notes

- **TTL Background Task**: MongoDB checks every 60 seconds
- **Socket Connections**: Each user = 1 connection
- **Message History**: Limited by 7-day TTL
- **Database Size**: Auto-managed by TTL indexes

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Remove development console.logs
- [ ] Set `NODE_ENV=production`
- [ ] Configure production CORS origins
- [ ] Set up SSL/TLS (HTTPS)
- [ ] Configure production Socket.IO URL
- [ ] Test on production MongoDB
- [ ] Verify TTL indexes on production DB
- [ ] Set up monitoring for socket connections
- [ ] Configure rate limiting for chat endpoints
- [ ] Test with high concurrent users

---

## 🎯 Feature Summary

| Feature               | Status | Notes                  |
| --------------------- | ------ | ---------------------- |
| Real-time messaging   | ✅     | Socket.IO              |
| 7-day auto-deletion   | ✅     | MongoDB TTL            |
| Responsive design     | ✅     | Mobile + Desktop       |
| Typing indicators     | ✅     | Real-time              |
| Unread badges         | ✅     | With animations        |
| Security (XSS)        | ✅     | Pre-save sanitization  |
| Character limit       | ✅     | 2000 chars             |
| Browser notifications | ✅     | With permission        |
| Error handling        | ✅     | User-friendly messages |
| Loading states        | ✅     | Spinners               |
| Connection status     | ✅     | Visual indicator       |

---

**Chat system is ready to use! 🚀**
