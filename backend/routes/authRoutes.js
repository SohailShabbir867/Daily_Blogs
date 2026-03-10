// Auth Routes - User authentication, registration, and session management

const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getCurrentUser,
  checkSession,
  changePassword,
  refreshSession,
  forgotPassword,
  verifyOTP,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");

// Middleware
const { isAuthenticated, guestOnly } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/errorHandler");
const {
  authLimiter,
  registrationLimiter,
} = require("../middleware/rateLimiter");

const {
  validateRegister,
  validateLogin,
  validatePasswordChange,
} = require("../utils/validators");

// POST /api/auth/register - Register new user
router.post(
  "/register",
  registrationLimiter,
  guestOnly,
  validateRegister,
  handleValidationErrors,
  register
);

// POST /api/auth/login - Authenticate user
router.post(
  "/login",
  authLimiter,
  guestOnly,
  validateLogin,
  handleValidationErrors,
  login
);

router.get("/check", checkSession);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/verify-otp", authLimiter, verifyOTP);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", authLimiter, resendVerification);

// Protected routes
// Note: logout does NOT require isAuthenticated — if the session expired,
// the logout should still succeed and clear the cookie.
router.post("/logout", logout);
router.get("/me", isAuthenticated, getCurrentUser);

router.put(
  "/change-password",
  isAuthenticated,
  validatePasswordChange,
  handleValidationErrors,
  changePassword
);

router.post("/refresh", isAuthenticated, refreshSession);

module.exports = router;
