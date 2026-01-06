// Admin Routes - Admin-only operations for user, blog, and comment management

const express = require("express");
const router = express.Router();
const {
  adminGetAllUsers,
  adminGetUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/userController");

const {
  adminGetAllBlogs,
  adminGetBlog,
  adminUpdateBlog,
  adminDeleteBlog,
  toggleFeatured,
  bulkUpdateStatus,
} = require("../controllers/blogController");

const {
  adminGetAllComments,
  toggleFlagComment,
  bulkDeleteComments,
} = require("../controllers/commentController");

// Middleware
const { isAuthenticated } = require("../middleware/auth");
const { isAdmin, isModerator } = require("../middleware/admin");
const { handleValidationErrors } = require("../middleware/errorHandler");

// Validators
const { validateObjectId, validatePagination } = require("../utils/validators");

router.use(isAuthenticated);

// GET /api/admin/stats - Admin statistics
router.get("/stats", isAdmin, async (req, res) => {
  const User = require("../models/User");
  const Blog = require("../models/Blog");
  const Comment = require("../models/Comment");

  try {
    const [totalUsers, totalBlogs, totalComments, adminCount] =
      await Promise.all([
        User.countDocuments({ isActive: true }),
        Blog.countDocuments({ status: "published" }),
        Comment.countDocuments({ isDeleted: false }),
        User.countDocuments({ role: "admin", isActive: true }),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBlogs,
        totalComments,
        adminCount,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
});

// GET /api/admin/dashboard - Dashboard statistics
router.get("/dashboard", isAdmin, async (req, res) => {
  const User = require("../models/User");
  const Blog = require("../models/Blog");
  const Comment = require("../models/Comment");

  // Get various statistics
  const [userStats, blogStats, commentStats, recentUsers, recentBlogs] =
    await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            activeToday: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$lastActive",
                      new Date(Date.now() - 24 * 60 * 60 * 1000),
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            newThisWeek: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$createdAt",
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Blog.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalViews: { $sum: "$viewCount" },
            totalLikes: { $sum: "$likeCount" },
          },
        },
      ]),
      Comment.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            flagged: { $sum: { $cond: ["$isFlagged", 1, 0] } },
            deleted: { $sum: { $cond: ["$isDeleted", 1, 0] } },
          },
        },
      ]),
      User.find()
        .select("name email avatar createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Blog.find()
        .select("title slug status createdAt author")
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  // Format stats
  const stats = {
    users: userStats[0] || { total: 0, activeToday: 0, newThisWeek: 0 },
    blogs: {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      totalViews: 0,
      totalLikes: 0,
    },
    comments: commentStats[0] || { total: 0, flagged: 0, deleted: 0 },
  };

  blogStats.forEach((stat) => {
    if (stat._id) {
      stats.blogs[stat._id] = stat.count;
    }
    stats.blogs.total += stat.count;
    stats.blogs.totalViews += stat.totalViews || 0;
    stats.blogs.totalLikes += stat.totalLikes || 0;
  });

  res.json({
    success: true,
    data: {
      stats,
      recentUsers,
      recentBlogs,
    },
  });
});

// GET /api/admin/users - Get all users
router.get(
  "/users",
  isAdmin,
  validatePagination,
  handleValidationErrors,
  adminGetAllUsers
);

// GET /api/admin/users/:id - Get single user
router.get(
  "/users/:id",
  isAdmin,
  validateObjectId("id"),
  handleValidationErrors,
  adminGetUser
);

// PUT /api/admin/users/:id/role - Update user role
router.put(
  "/users/:id/role",
  isAdmin,
  validateObjectId("id"),
  handleValidationErrors,
  updateUserRole
);

// PUT /api/admin/users/:id/status - Toggle user status
router.put(
  "/users/:id/status",
  isAdmin,
  validateObjectId("id"),
  handleValidationErrors,
  toggleUserStatus
);

// DELETE /api/admin/users/:id - Delete user
router.delete(
  "/users/:id",
  isAdmin,
  validateObjectId("id"),
  handleValidationErrors,
  deleteUser
);

// GET /api/admin/blogs - Get all blogs (admins see own, super admins see all)
router.get(
  "/blogs",
  isAdmin,
  validatePagination,
  handleValidationErrors,
  adminGetAllBlogs
);

// GET /api/admin/blogs/:id - Get single blog for editing
router.get(
  "/blogs/:id",
  isAdmin,
  validateObjectId("id"),
  handleValidationErrors,
  adminGetBlog
);

// PUT /api/admin/blogs/:id - Update blog post
router.put(
  "/blogs/:id",
  isAdmin,
  validateObjectId("id"),
  handleValidationErrors,
  adminUpdateBlog
);

// DELETE /api/admin/blogs/:id - Delete blog post
router.delete(
  "/blogs/:id",
  isAdmin,
  validateObjectId("id"),
  handleValidationErrors,
  adminDeleteBlog
);

// PUT /api/admin/blogs/:id/feature - Toggle featured status
router.put(
  "/blogs/:id/feature",
  isAdmin,
  validateObjectId("id"),
  handleValidationErrors,
  toggleFeatured
);

// PUT /api/admin/blogs/bulk-status - Bulk update blog status
router.put("/blogs/bulk-status", isAdmin, bulkUpdateStatus);

// GET /api/admin/comments - Get all comments
router.get(
  "/comments",
  isModerator,
  validatePagination,
  handleValidationErrors,
  adminGetAllComments
);

// PUT /api/admin/comments/:id/flag - Flag/unflag comment
router.put(
  "/comments/:id/flag",
  isModerator,
  validateObjectId("id"),
  handleValidationErrors,
  toggleFlagComment
);

// DELETE /api/admin/comments/bulk - Bulk delete comments
router.delete("/comments/bulk", isAdmin, bulkDeleteComments);

// Super Admin User Management
const {
  getAllUsers: superAdminGetAllUsers,
  getUser: superAdminGetUser,
  deleteUser: superAdminDeleteUser,
  promoteToAdmin,
  demoteToUser,
  toggleUserStatus: superAdminToggleUserStatus,
} = require("../controllers/adminController");
const { isSuperAdmin } = require("../middleware/auth");

router.get("/manage/users", isSuperAdmin, superAdminGetAllUsers);
router.get("/manage/users/:id", isSuperAdmin, superAdminGetUser);
router.delete("/manage/users/:id", isSuperAdmin, superAdminDeleteUser);
router.patch("/manage/users/:id/promote", isSuperAdmin, promoteToAdmin);
router.patch("/manage/users/:id/demote", isSuperAdmin, demoteToUser);
router.patch(
  "/manage/users/:id/toggle-status",
  isSuperAdmin,
  superAdminToggleUserStatus
);

// Notification Routes (Super Admin only)
const {
  sendNotification,
  sendMaintenanceNotification,
  sendErrorNotification,
  getRecipientCount,
} = require("../controllers/notificationController");

// GET /api/admin/notifications/recipient-count - Get count of recipients
router.get("/notifications/recipient-count", isSuperAdmin, getRecipientCount);

// POST /api/admin/notifications/send - Send notification to users
router.post("/notifications/send", isSuperAdmin, sendNotification);

// POST /api/admin/notifications/maintenance - Send maintenance notification
router.post(
  "/notifications/maintenance",
  isSuperAdmin,
  sendMaintenanceNotification
);

// POST /api/admin/notifications/error-alert - Send error alert to admins
router.post("/notifications/error-alert", isSuperAdmin, sendErrorNotification);

module.exports = router;
