// User Routes - Profile management and saved blogs

const express = require("express");
const router = express.Router();
const {
  getPublicProfile,
  updateProfile,
  getMyProfile,
  getSavedBlogs,
  toggleSaveBlog,
  checkBlogSaved,
} = require("../controllers/userController");

const { isAuthenticated } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/errorHandler");
const { writeLimiter } = require("../middleware/rateLimiter");
const {
  validateObjectId,
  validateUpdateProfile,
} = require("../utils/validators");

router.get("/profile/me", isAuthenticated, getMyProfile);

router.put(
  "/profile",
  isAuthenticated,
  writeLimiter,
  validateUpdateProfile,
  handleValidationErrors,
  updateProfile
);

// Saved blogs routes
router.get("/saved-blogs", isAuthenticated, getSavedBlogs);

router.post(
  "/saved-blogs/:blogId",
  isAuthenticated,
  writeLimiter,
  validateObjectId("blogId"),
  handleValidationErrors,
  toggleSaveBlog
);

router.get(
  "/saved-blogs/:blogId/status",
  isAuthenticated,
  validateObjectId("blogId"),
  handleValidationErrors,
  checkBlogSaved
);

// Public route (must be last - /:id is catch-all)
router.get(
  "/:id",
  validateObjectId("id"),
  handleValidationErrors,
  getPublicProfile
);

module.exports = router;
