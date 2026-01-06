/**
 * ================================================================
 * VALIDATION SCHEMAS
 * ================================================================
 *
 * Express-validator validation chains for request validation.
 * Provides reusable validation rules for all API endpoints.
 *
 * @module utils/validators
 * @author Daily Blogs Team
 * @version 1.0.0
 */

const { body, param, query } = require("express-validator");
const { isValidObjectId } = require("./helpers");

// ============================================
// COMMON VALIDATORS
// ============================================

/**
 * Validate MongoDB ObjectId parameter
 */
const validateObjectId = (paramName = "id") => {
  return param(paramName)
    .trim()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error(`Invalid ${paramName} format`);
      }
      return true;
    });
};

/**
 * Validate pagination query parameters
 */
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
];

// ============================================
// AUTH VALIDATORS
// ============================================

/**
 * Validate user registration data
 */
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

/**
 * Validate user login data
 */
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Validate password change
 */
const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("New password must contain at least one number")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),

  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// ============================================
// BLOG VALIDATORS
// ============================================

/**
 * Valid blog categories
 */
const VALID_CATEGORIES = [
  "Development",
  "Design",
  "Career",
  "React",
  "JavaScript",
  "Best Practices",
  "Accessibility",
  "Tutorial",
  "News",
  "Other",
];

/**
 * Validate blog creation data
 */
const validateCreateBlog = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 20, max: 500 })
    .withMessage("Description must be between 20 and 500 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`),

  body("image")
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      // Allow URLs or base64 data URIs
      const isUrl = /^https?:\/\/.+/i.test(value);
      const isBase64 = /^data:image\/[a-z]+;base64,/i.test(value);
      if (!isUrl && !isBase64) {
        throw new Error("Image must be a valid URL or base64 image");
      }
      return true;
    }),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Each tag must be between 2 and 30 characters"),

  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be either draft or published"),
];

/**
 * Validate blog update data
 */
const validateUpdateBlog = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage("Description must be between 20 and 500 characters"),

  body("content")
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),

  body("category")
    .optional()
    .trim()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`),

  body("image")
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      // Allow URLs or base64 data URIs
      const isUrl = /^https?:\/\/.+/i.test(value);
      const isBase64 = /^data:image\/[a-z]+;base64,/i.test(value);
      if (!isUrl && !isBase64) {
        throw new Error("Image must be a valid URL or base64 image");
      }
      return true;
    }),

  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be draft, published, or archived"),
];

/**
 * Validate blog query filters
 */
const validateBlogQuery = [
  ...validatePagination,

  query("category")
    .optional()
    .trim()
    .isIn(["All", ...VALID_CATEGORIES])
    .withMessage("Invalid category"),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term too long"),

  query("sortBy")
    .optional()
    .isIn(["publishedAt", "createdAt", "likeCount", "viewCount", "title"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc", "1", "-1"])
    .withMessage("Sort order must be asc or desc"),
];

// ============================================
// COMMENT VALIDATORS
// ============================================

/**
 * Validate comment creation
 */
const validateCreateComment = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Comment must be between 1 and 2000 characters"),

  body("parentComment")
    .optional()
    .custom((value) => {
      if (value && !isValidObjectId(value)) {
        throw new Error("Invalid parent comment ID");
      }
      return true;
    }),
];

/**
 * Validate comment update
 */
const validateUpdateComment = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Comment must be between 1 and 2000 characters"),
];

// ============================================
// USER VALIDATORS
// ============================================

/**
 * Validate user profile update
 */
const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
    ),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("avatar")
    .optional()
    .trim()
    .isURL()
    .withMessage("Avatar must be a valid URL"),
];

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Common
  validateObjectId,
  validatePagination,

  // Auth
  validateRegister,
  validateLogin,
  validatePasswordChange,

  // Blog
  validateCreateBlog,
  validateUpdateBlog,
  validateBlogQuery,
  VALID_CATEGORIES,

  // Comment
  validateCreateComment,
  validateUpdateComment,

  // User
  validateUpdateProfile,
};
