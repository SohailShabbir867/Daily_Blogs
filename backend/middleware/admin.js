// Role-based access control middleware for admin-only routes

const { ForbiddenError } = require("../utils/errors");

// Available user roles
const ROLES = Object.freeze({
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
});

// Role hierarchy - higher index = more permissions
const ROLE_HIERARCHY = ["user", "moderator", "admin"];

// Require admin role for access
const isAdmin = (req, res, next) => {
  // Ensure user is attached (from isAuthenticated middleware)
  if (!req.user) {
    throw new ForbiddenError("Authentication required");
  }

  // Check for admin role
  if (req.user.role !== ROLES.ADMIN) {
    // Log unauthorized admin access attempt
    console.warn(
      `[ADMIN ACCESS DENIED] User ${req.user._id} (${req.user.email}) ` +
        `attempted to access admin route: ${req.method} ${req.originalUrl}`
    );

    throw new ForbiddenError(
      "Access denied. Administrator privileges required."
    );
  }

  // Log successful admin access (optional, for audit trail)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[ADMIN ACCESS] User ${req.user._id} accessed: ${req.method} ${req.originalUrl}`
    );
  }

  next();
};

// Require moderator or admin role for access
const isModerator = (req, res, next) => {
  // Ensure user is attached
  if (!req.user) {
    throw new ForbiddenError("Authentication required");
  }

  const allowedRoles = [ROLES.MODERATOR, ROLES.ADMIN];

  if (!allowedRoles.includes(req.user.role)) {
    throw new ForbiddenError("Access denied. Moderator privileges required.");
  }

  next();
};

// Create middleware that requires specific role(s)
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is attached
    if (!req.user) {
      throw new ForbiddenError("Authentication required");
    }

    // Validate allowed roles
    const validRoles = allowedRoles.filter((role) =>
      Object.values(ROLES).includes(role)
    );

    if (validRoles.length === 0) {
      console.error("requireRole called with no valid roles");
      throw new ForbiddenError("Access denied");
    }

    // Check if user's role is in allowed roles
    if (!validRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Required role(s): ${validRoles.join(", ")}`
      );
    }

    next();
  };
};

// Require minimum role level based on hierarchy (Admin > Moderator > User)
const requireMinRole = (minimumRole) => {
  return (req, res, next) => {
    // Ensure user is attached
    if (!req.user) {
      throw new ForbiddenError("Authentication required");
    }

    const userRoleIndex = ROLE_HIERARCHY.indexOf(req.user.role);
    const requiredRoleIndex = ROLE_HIERARCHY.indexOf(minimumRole);

    // Invalid role specified
    if (requiredRoleIndex === -1) {
      console.error(`Invalid minimum role specified: ${minimumRole}`);
      throw new ForbiddenError("Access denied");
    }

    // User's role level is too low
    if (userRoleIndex < requiredRoleIndex) {
      throw new ForbiddenError(
        `Access denied. Minimum role required: ${minimumRole}`
      );
    }

    next();
  };
};

// Permission mappings - maps actions to required roles
const PERMISSIONS = {
  // Blog permissions
  "blog:create": ["user", "moderator", "admin"],
  "blog:edit-own": ["user", "moderator", "admin"],
  "blog:edit-any": ["moderator", "admin"],
  "blog:delete-own": ["user", "moderator", "admin"],
  "blog:delete-any": ["moderator", "admin"],
  "blog:publish": ["moderator", "admin"],
  "blog:feature": ["admin"],

  // Comment permissions
  "comment:create": ["user", "moderator", "admin"],
  "comment:edit-own": ["user", "moderator", "admin"],
  "comment:delete-own": ["user", "moderator", "admin"],
  "comment:delete-any": ["moderator", "admin"],
  "comment:moderate": ["moderator", "admin"],

  // User permissions
  "user:view-profile": ["user", "moderator", "admin"],
  "user:edit-own": ["user", "moderator", "admin"],
  "user:view-any": ["moderator", "admin"],
  "user:edit-any": ["admin"],
  "user:delete-any": ["admin"],
  "user:manage-roles": ["admin"],

  // Admin permissions
  "admin:dashboard": ["admin"],
  "admin:analytics": ["moderator", "admin"],
  "admin:settings": ["admin"],
};

// Check if user has specific permission
const hasPermission = (permission) => {
  return (req, res, next) => {
    // Ensure user is attached
    if (!req.user) {
      throw new ForbiddenError("Authentication required");
    }

    const allowedRoles = PERMISSIONS[permission];

    // Invalid permission specified
    if (!allowedRoles) {
      console.error(`Unknown permission: ${permission}`);
      throw new ForbiddenError("Access denied");
    }

    // Check if user's role has the permission
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. You do not have permission: ${permission}`
      );
    }

    next();
  };
};

// Check if user has ANY of the specified permissions
const hasAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ForbiddenError("Authentication required");
    }

    const hasAny = permissions.some((permission) => {
      const allowedRoles = PERMISSIONS[permission];
      return allowedRoles && allowedRoles.includes(req.user.role);
    });

    if (!hasAny) {
      throw new ForbiddenError("Access denied. Insufficient permissions.");
    }

    next();
  };
};

// Check if a role is valid
const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

// Get role hierarchy level (0-based, -1 if invalid)
const getRoleLevel = (role) => {
  return ROLE_HIERARCHY.indexOf(role);
};

// Check if roleA is higher than roleB in hierarchy
const isRoleHigher = (roleA, roleB) => {
  return getRoleLevel(roleA) > getRoleLevel(roleB);
};

module.exports = {
  // Role constants
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,

  // Middleware
  isAdmin,
  isModerator,
  requireRole,
  requireMinRole,
  hasPermission,
  hasAnyPermission,

  // Helper functions
  isValidRole,
  getRoleLevel,
  isRoleHigher,
};
