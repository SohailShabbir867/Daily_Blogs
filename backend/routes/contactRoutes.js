// Contact Routes - Public contact form and admin management

const express = require("express");
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContact,
  updateContactStatus,
  deleteContact,
  getContactStats,
} = require("../controllers/contactController");
const { isAuthenticated, isSuperAdmin } = require("../middleware/auth");
const { contactLimiter } = require("../middleware/rateLimiter");

// Public route - submit contact form (5/hr per IP to prevent spam)
router.post("/", contactLimiter, submitContact);

// Super admin only routes
router.get("/", isAuthenticated, isSuperAdmin, getAllContacts);
router.get("/stats", isAuthenticated, isSuperAdmin, getContactStats);
router.get("/:id", isAuthenticated, isSuperAdmin, getContact);
router.patch("/:id", isAuthenticated, isSuperAdmin, updateContactStatus);
router.delete("/:id", isAuthenticated, isSuperAdmin, deleteContact);

module.exports = router;
