// Routes Index - Central router combining all route modules

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const blogRoutes = require("./blogRoutes");
const commentRoutes = require("./commentRoutes");
const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const contactRoutes = require("./contactRoutes");
const subscriberRoutes = require("./subscriberRoutes");
const chatRoutes = require("./chatRoutes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Daily Blogs API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/comments", commentRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/contact", contactRoutes);
router.use("/subscribe", subscriberRoutes);
router.use("/chat", chatRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Daily Blogs API",
    version: "1.0.0",
    documentation: "/api/docs",
    endpoints: {
      auth: "/api/auth",
      blogs: "/api/blogs",
      comments: "/api/comments",
      users: "/api/users",
      admin: "/api/admin",
      contact: "/api/contact",
      subscribe: "/api/subscribe",
      chat: "/api/chat",
      health: "/api/health",
    },
  });
});

module.exports = router;
