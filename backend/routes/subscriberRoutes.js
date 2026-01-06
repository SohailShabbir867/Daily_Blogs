/**
 * Subscriber Routes
 * Handles newsletter subscription endpoints
 */

const express = require("express");
const router = express.Router();

const {
  subscribe,
  unsubscribe,
  getSubscribers,
  getSubscriberStats,
} = require("../controllers/subscriberController");

const { isAuthenticated } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");

// Authenticated user routes - requires login
router.post("/", isAuthenticated, subscribe);

// Public routes - unsubscribe via token
router.get("/unsubscribe/:token", unsubscribe);

// Admin routes
router.get("/list", isAuthenticated, isAdmin, getSubscribers);
router.get("/stats", isAuthenticated, isAdmin, getSubscriberStats);

module.exports = router;
