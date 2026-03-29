// Admin Controller - User management and admin dashboard functions

const User = require("../models/User");
const Blog = require("../models/Blog");
const Contact = require("../models/Contact");
const { asyncHandler, buildSuccessResponse } = require("../utils/helpers");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

// Get all users (super admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const role = req.query.role;
  const search = req.query.search;
  const skip = (page - 1) * limit;

  const filter = {};

  if (role && role !== "all") {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json(
    buildSuccessResponse(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Users retrieved"
    )
  );
});

// Get single user details
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Get user's blog count
  const blogCount = await Blog.countDocuments({ author: user._id });

  res.json(
    buildSuccessResponse({ user: { ...user, blogCount } }, "User retrieved")
  );
});

// Delete user (super admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const userToDelete = await User.findById(req.params.id);

  if (!userToDelete) {
    throw new NotFoundError("User not found");
  }

  // Prevent deleting super admin
  if (userToDelete.isSuperAdmin) {
    throw new ForbiddenError("Cannot delete a super admin");
  }

  // Prevent deleting yourself
  if (userToDelete._id.toString() === req.user._id.toString()) {
    throw new ForbiddenError("Cannot delete your own account");
  }

  await User.findByIdAndDelete(req.params.id);

  console.log(
    `[ADMIN] User deleted: ${userToDelete.email} by ${req.user.email}`
  );

  res.json(
    buildSuccessResponse(
      { message: "User deleted successfully" },
      "User deleted"
    )
  );
});

// Promote user to admin (super admin only)
const promoteToAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.role === "admin") {
    throw new BadRequestError("User is already an admin");
  }

  user.role = "admin";
  await user.save();

  console.log(
    `[ADMIN] User promoted to admin: ${user.email} by ${req.user.email}`
  );

  res.json(
    buildSuccessResponse(
      { user: user.getSafeProfile(), message: "User promoted to admin" },
      "Role updated"
    )
  );
});

// Demote admin to user (super admin only)
const demoteToUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.isSuperAdmin) {
    throw new ForbiddenError("Cannot demote a super admin");
  }

  if (user.role === "user") {
    throw new BadRequestError("User is already a regular user");
  }

  user.role = "user";
  await user.save();

  console.log(
    `[ADMIN] Admin demoted to user: ${user.email} by ${req.user.email}`
  );

  res.json(
    buildSuccessResponse(
      { user: user.getSafeProfile(), message: "Admin demoted to user" },
      "Role updated"
    )
  );
});

// Toggle user active status
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.isSuperAdmin) {
    throw new ForbiddenError("Cannot deactivate a super admin");
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ForbiddenError("Cannot deactivate your own account");
  }

  user.isActive = !user.isActive;
  await user.save();

  console.log(
    `[ADMIN] User ${user.isActive ? "activated" : "deactivated"}: ${
      user.email
    } by ${req.user.email}`
  );

  res.json(
    buildSuccessResponse(
      {
        user: user.getSafeProfile(),
        message: `User ${user.isActive ? "activated" : "deactivated"}`,
      },
      "Status updated"
    )
  );
});

// Get dashboard stats (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBlogs, totalContacts, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Contact.countDocuments({ isRead: false }),
      User.find()
        .select("name email createdAt role")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  res.json(
    buildSuccessResponse(
      {
        stats: {
          totalUsers,
          totalBlogs,
          unreadContacts: totalContacts,
          usersByRole: usersByRole.reduce((acc, r) => {
            acc[r._id] = r.count;
            return acc;
          }, {}),
        },
        recentUsers,
      },
      "Dashboard stats retrieved"
    )
  );
});

// Assign CR role (super admin only)
const makeCR = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");
  if (user.isSuperAdmin) throw new ForbiddenError("Cannot change super admin role");

  user.role = "cr";
  user.isCR = true;
  await user.save();

  console.log(`[ADMIN] User assigned CR role: ${user.email} by ${req.user.email}`);

  res.json(
    buildSuccessResponse(
      { user: user.getSafeProfile(), message: "CR role assigned" },
      "Role updated"
    )
  );
});

// Remove CR role — revert to regular user (super admin only)
const removeCR = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");
  if (user.isSuperAdmin) throw new ForbiddenError("Cannot change super admin role");

  user.role = "user";
  user.isCR = false;
  await user.save();

  console.log(`[ADMIN] CR role removed from: ${user.email} by ${req.user.email}`);

  res.json(
    buildSuccessResponse(
      { user: user.getSafeProfile(), message: "CR role removed" },
      "Role updated"
    )
  );
});

// Grant file access to a user (Super Admin or CR)
const grantFileAccess = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { hasFileAccess: true },
    { new: true, runValidators: false }
  );
  if (!user) throw new NotFoundError("User not found");

  console.log(`[FILE-ACCESS] Granted to: ${user.email} by ${req.user.email}`);
  res.json(
    buildSuccessResponse(
      { user: user.getSafeProfile(), message: "File access granted" },
      "Access updated"
    )
  );
});

// Revoke file access from a user (Super Admin or CR)
const revokeFileAccess = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) throw new NotFoundError("User not found");
  if (target.isSuperAdmin) throw new ForbiddenError("Cannot revoke super admin access");

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { hasFileAccess: false },
    { new: true, runValidators: false }
  );

  console.log(`[FILE-ACCESS] Revoked from: ${user.email} by ${req.user.email}`);
  res.json(
    buildSuccessResponse(
      { user: user.getSafeProfile(), message: "File access revoked" },
      "Access updated"
    )
  );
});

module.exports = {
  getAllUsers,
  getUser,
  deleteUser,
  promoteToAdmin,
  demoteToUser,
  toggleUserStatus,
  getDashboardStats,
  makeCR,
  removeCR,
  grantFileAccess,
  revokeFileAccess,
};
