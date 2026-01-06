// Blog Routes - CRUD, likes, search, and filtering

const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getCategories,
  toggleLike,
  getLikeStatus,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
} = require("../controllers/blogController");

const {
  getComments,
  createComment,
} = require("../controllers/commentController");
const { isAuthenticated, optionalAuth } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/errorHandler");
const { writeLimiter, searchLimiter } = require("../middleware/rateLimiter");

// Validators
const {
  validateCreateBlog,
  validateUpdateBlog,
  validateBlogQuery,
  validateObjectId,
  validateCreateComment,
} = require("../utils/validators");

// GET /api/blogs - Get all published blogs with pagination
router.get(
  "/",
  searchLimiter,
  validateBlogQuery,
  handleValidationErrors,
  getBlogs
);

router.get("/featured", getFeaturedBlogs);
router.get("/categories", getCategories);
router.get("/:identifier", optionalAuth, getBlogBySlug);

// Blog comments
router.get(
  "/:blogId/comments",
  validateObjectId("blogId"),
  handleValidationErrors,
  getComments
);

router.post(
  "/:blogId/comments",
  isAuthenticated,
  writeLimiter,
  validateObjectId("blogId"),
  validateCreateComment,
  handleValidationErrors,
  createComment
);

// Authenticated routes
router.get("/user/my-blogs", isAuthenticated, getMyBlogs);

router.post(
  "/",
  isAuthenticated,
  writeLimiter,
  validateCreateBlog,
  handleValidationErrors,
  createBlog
);

router.put(
  "/:id",
  isAuthenticated,
  writeLimiter,
  validateObjectId("id"),
  validateUpdateBlog,
  handleValidationErrors,
  updateBlog
);

router.delete(
  "/:id",
  isAuthenticated,
  validateObjectId("id"),
  handleValidationErrors,
  deleteBlog
);

// Like routes
router.post(
  "/:id/like",
  isAuthenticated,
  writeLimiter,
  validateObjectId("id"),
  handleValidationErrors,
  toggleLike
);

router.get(
  "/:id/like-status",
  isAuthenticated,
  validateObjectId("id"),
  handleValidationErrors,
  getLikeStatus
);

module.exports = router;
