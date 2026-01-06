// Comment Routes - Viewing, creating, updating, and deleting comments

const express = require("express");
const router = express.Router();
const {
  getComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
} = require("../controllers/commentController");

const { isAuthenticated } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/errorHandler");
const { writeLimiter } = require("../middleware/rateLimiter");
const {
  validateObjectId,
  validateUpdateComment,
} = require("../utils/validators");

router.get("/:id", validateObjectId("id"), handleValidationErrors, getComment);

// Like/unlike a comment
router.post(
  "/:id/like",
  isAuthenticated,
  writeLimiter,
  validateObjectId("id"),
  handleValidationErrors,
  toggleLikeComment
);

router.put(
  "/:id",
  isAuthenticated,
  writeLimiter,
  validateObjectId("id"),
  validateUpdateComment,
  handleValidationErrors,
  updateComment
);

router.delete(
  "/:id",
  isAuthenticated,
  validateObjectId("id"),
  handleValidationErrors,
  deleteComment
);

module.exports = router;
