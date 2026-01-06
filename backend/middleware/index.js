/**
 * ================================================================
 * MIDDLEWARE INDEX
 * ================================================================
 *
 * Central export point for all middleware modules.
 * Provides easy access to all middleware functions.
 *
 * @module middleware
 * @author Daily Blogs Team
 * @version 1.0.0
 */

// Authentication middleware
const {
  isAuthenticated,
  optionalAuth,
  guestOnly,
  refreshSession,
  isOwner,
  getSessionInfo,
} = require("./auth");

// Admin/Role middleware
const {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  isAdmin,
  isModerator,
  requireRole,
  requireMinRole,
  hasPermission,
  hasAnyPermission,
  isValidRole,
  getRoleLevel,
  isRoleHigher,
} = require("./admin");

// Error handling middleware
const {
  errorHandler,
  notFoundHandler,
  catchAsync,
  handleValidationErrors,
  setupUnhandledErrorHandlers,
  logError,
} = require("./errorHandler");

// Rate limiting middleware
const {
  defaultLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  writeLimiter,
  searchLimiter,
  createRateLimiter,
  slidingWindowLimiter,
} = require("./rateLimiter");

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Authentication
  isAuthenticated,
  optionalAuth,
  guestOnly,
  refreshSession,
  isOwner,
  getSessionInfo,

  // Roles & Permissions
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  isAdmin,
  isModerator,
  requireRole,
  requireMinRole,
  hasPermission,
  hasAnyPermission,
  isValidRole,
  getRoleLevel,
  isRoleHigher,

  // Error Handling
  errorHandler,
  notFoundHandler,
  catchAsync,
  handleValidationErrors,
  setupUnhandledErrorHandlers,
  logError,

  // Rate Limiting
  defaultLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  writeLimiter,
  searchLimiter,
  createRateLimiter,
  slidingWindowLimiter,
};
