// Session-based authentication middleware for protecting routes

const User = require("../models/User");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");
const { asyncHandler } = require("../utils/helpers");

// Check if user is authenticated via session, attaches user to request
const isAuthenticated = asyncHandler(async (req, res, next) => {
  // Check if session exists and has user ID
  if (!req.session || !req.session.userId) {
    throw new UnauthorizedError("Please log in to access this resource");
  }

  // Find user — only select fields needed for auth checks and attaching to req.user
  const user = await User.findById(req.session.userId)
    .select("_id name email role isSuperAdmin isCR hasFileAccess isChatSupport isActive isEmailVerified avatar bio savedBlogs createdAt")
    .lean();

  // Check if user still exists
  if (!user) {
    // Destroy invalid session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
    });
    throw new UnauthorizedError("User no longer exists. Please log in again");
  }

  // Check if user is active
  if (!user.isActive) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
    });
    throw new ForbiddenError("Your account has been deactivated");
  }

  // Attach user to request object
  req.user = user;

  // Update last active timestamp (non-blocking)
  User.findByIdAndUpdate(
    user._id,
    { lastActive: new Date() },
    { timestamps: false }
  ).catch((err) => {
    console.error("Failed to update last active:", err.message);
  });

  next();
});

// Optional authentication - attaches user if logged in, doesn't throw if not
const optionalAuth = asyncHandler(async (req, res, next) => {
  // If no session, continue without user
  if (!req.session || !req.session.userId) {
    req.user = null;
    return next();
  }

  try {
    // Try to find user
    const user = await User.findById(req.session.userId)
      .select("-password")
      .lean();

    // Attach user if found and active
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }
  } catch (error) {
    // Log error but don't fail the request
    console.error("Optional auth error:", error.message);
    req.user = null;
  }

  next();
});

// Ensure user is NOT authenticated (for login/register pages)
const guestOnly = (req, res, next) => {
  if (req.session && req.session.userId) {
    throw new ForbiddenError("You are already logged in");
  }
  next();
};

// Require admin role
const isAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  if (req.user.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
  next();
};

// Require super admin access
const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  if (!req.user.isSuperAdmin) {
    throw new ForbiddenError("Super admin access required");
  }
  next();
};

// Require CR role (or super admin who inherits all roles)
const isCR = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  // CR inherits admin, super admin inherits CR
  const hasCRAccess =
    req.user.isCR === true ||
    req.user.role === "cr" ||
    req.user.isSuperAdmin === true;
  if (!hasCRAccess) {
    throw new ForbiddenError("CR (Class Representative) access required");
  }
  next();
};

// Require admin OR cr (or super admin)
// Used for file upload routes — CR can upload, admin cannot, super admin can
const isAdminOrCR = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  const hasAccess =
    req.user.role === "admin" ||
    req.user.role === "cr" ||
    req.user.isCR === true ||
    req.user.isSuperAdmin === true;
  if (!hasAccess) {
    throw new ForbiddenError("Admin or CR access required");
  }
  next();
};

// Refresh session expiry on each request
const refreshSession = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Touch session to refresh expiry
    req.session.touch();
  }
  next();
};

// Create middleware to check resource ownership
const isOwner = (getResourceUserId, resourceName = "resource") => {
  return asyncHandler(async (req, res, next) => {
    // Must be authenticated first
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Get the resource owner's user ID
    const resourceUserId = await getResourceUserId(req);

    if (!resourceUserId) {
      throw new ForbiddenError(`${resourceName} not found`);
    }

    // Check if current user is the owner or an admin
    const isOwnerOrAdmin =
      resourceUserId.toString() === req.user._id.toString() ||
      req.user.role === "admin";

    if (!isOwnerOrAdmin) {
      throw new ForbiddenError(
        `You do not have permission to modify this ${resourceName}`
      );
    }

    next();
  });
};

// Get current session information
const getSessionInfo = (req) => {
  if (!req.session) {
    return { authenticated: false };
  }

  return {
    authenticated: !!req.session.userId,
    sessionId: req.session.id,
    userId: req.session.userId || null,
    createdAt: req.session.createdAt || null,
    expiresAt: req.session.cookie?.expires || null,
    maxAge: req.session.cookie?.maxAge || null,
  };
};

module.exports = {
  isAuthenticated,
  optionalAuth,
  guestOnly,
  isAdmin,
  isSuperAdmin,
  isCR,
  isAdminOrCR,
  refreshSession,
  isOwner,
  getSessionInfo,
};
