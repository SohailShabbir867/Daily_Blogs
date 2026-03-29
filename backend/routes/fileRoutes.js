// File Routes — private study file management (PDF/PPT) for CR users

const express = require("express");
const router = express.Router();

const {
  getFiles,
  getSubjects,
  getFile,
  accessFile,
  createFile,
  updateFile,
  deleteFile,
  getMyFiles,
  toggleFileStatus,
  adminGetAllFiles,
} = require("../controllers/fileController");

const { isAuthenticated, isCR, isSuperAdmin } = require("../middleware/auth");

// Simple in-memory rate limiter for the password-access endpoint
// Prevents brute-force attacks on file passwords
const accessAttempts = new Map();
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;               // max 10 attempts per IP per window

const accessRateLimiter = (req, res, next) => {
  const key = req.ip + ":" + req.params.id;
  const now = Date.now();
  const record = accessAttempts.get(key);

  if (record) {
    // Reset window if expired
    if (now - record.startTime > RATE_WINDOW_MS) {
      accessAttempts.set(key, { count: 1, startTime: now });
      return next();
    }
    if (record.count >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again after 15 minutes.",
      });
    }
    record.count += 1;
  } else {
    accessAttempts.set(key, { count: 1, startTime: now });
  }

  // Cleanup old entries periodically (every 100 requests)
  if (accessAttempts.size > 1000) {
    for (const [k, v] of accessAttempts) {
      if (now - v.startTime > RATE_WINDOW_MS) accessAttempts.delete(k);
    }
  }

  next();
};

// ── IMPORTANT: Specific routes MUST come before parameterised routes (:id) ──

// ── Super Admin Only Routes ───────────────────────────────────────────────────
// GET /api/files/admin/all    Get all files including inactive
router.get("/admin/all", isAuthenticated, isSuperAdmin, adminGetAllFiles);

// ── CR + Super Admin Routes ───────────────────────────────────────────────────
// GET /api/files/cr/my        Files uploaded by this CR
router.get("/cr/my", isAuthenticated, isCR, getMyFiles);

// POST /api/files             Upload new file
router.post("/", isAuthenticated, isCR, createFile);

// ── Public Routes ─────────────────────────────────────────────────────────────
// These return metadata ONLY — never fileUrl or password

// GET /api/files              List active files (metadata, paginated)
router.get("/", getFiles);

// GET /api/files/subjects     All unique subjects for filter
router.get("/subjects", getSubjects);

// POST /api/files/:id/access  Verify password → return file URL
// Rate limited: max 10 attempts per 15 min per IP per file
router.post("/:id/access", accessRateLimiter, accessFile);

// GET /api/files/:id          Single file metadata (MUST be after /subjects & /cr/my & /admin/all)
router.get("/:id", getFile);

// PUT /api/files/:id          Update file metadata
router.put("/:id", isAuthenticated, isCR, updateFile);

// DELETE /api/files/:id       Delete file
router.delete("/:id", isAuthenticated, isCR, deleteFile);

// PATCH /api/files/:id/toggle Enable/disable a file (Super Admin)
router.patch("/:id/toggle", isAuthenticated, isSuperAdmin, toggleFileStatus);

module.exports = router;
