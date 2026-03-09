// User Controller - Handles user profile management, saved blogs, and admin user operations

const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const {
  asyncHandler,
  buildSuccessResponse,
  parsePaginationParams,
} = require("../utils/helpers");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require("../utils/errors");

// Get user's public profile
const getPublicProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select("name avatar bio createdAt")
    .lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Get user's published blog count
  const blogCount = await Blog.countDocuments({
    author: id,
    status: "published",
  });

  res.json(
    buildSuccessResponse(
      {
        user: {
          ...user,
          blogCount,
        },
      },
      "Profile retrieved successfully"
    )
  );
});

// Update current user's profile
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, bio, avatar } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Update allowed fields
  if (name !== undefined) {
    user.name = name.trim();
  }

  if (bio !== undefined) {
    user.bio = bio.trim();
  }

  if (avatar !== undefined) {
    if (avatar && !/^https?:\/\//i.test(avatar)) {
      throw new BadRequestError("Avatar must be a valid http or https URL");
    }
    user.avatar = avatar;
  }

  await user.save();

  console.log(`[USER] Profile updated: ${user.email}`);

  res.json(
    buildSuccessResponse(
      { user: user.getSafeProfile() },
      "Profile updated successfully"
    )
  );
});

// Get current user's full profile with stats
const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .select("-password")
    .populate("savedBlogs", "title slug image publishedAt category")
    .lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Get user statistics
  const [blogStats, commentCount] = await Promise.all([
    Blog.aggregate([
      { $match: { author: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalLikes: { $sum: "$likeCount" },
          totalViews: { $sum: "$viewCount" },
        },
      },
    ]),
    Comment.countDocuments({ author: userId, isDeleted: false }),
  ]);

  // Format stats
  const stats = {
    blogs: {
      published: 0,
      draft: 0,
      total: 0,
      totalLikes: 0,
      totalViews: 0,
    },
    comments: commentCount,
    savedBlogs: user.savedBlogs?.length || 0,
  };

  blogStats.forEach((stat) => {
    if (stat._id === "published") {
      stats.blogs.published = stat.count;
    } else if (stat._id === "draft") {
      stats.blogs.draft = stat.count;
    }
    stats.blogs.total += stat.count;
    stats.blogs.totalLikes += stat.totalLikes || 0;
    stats.blogs.totalViews += stat.totalViews || 0;
  });

  res.json(
    buildSuccessResponse(
      {
        user,
        stats,
      },
      "Profile retrieved successfully"
    )
  );
});

// Get user's saved blogs
const getSavedBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const userId = req.user._id;

  // Fetch saved blog IDs first to compute accurate total count
  const userBasic = await User.findById(userId).select("savedBlogs").lean();
  if (!userBasic) throw new NotFoundError("User not found");

  const totalCount = await Blog.countDocuments({
    _id: { $in: userBasic.savedBlogs || [] },
    status: "published",
  });

  const user = await User.findById(userId)
    .populate({
      path: "savedBlogs",
      match: { status: "published" },
      select:
        "title slug description image category publishedAt author likeCount",
      populate: {
        path: "author",
        select: "name avatar",
      },
      options: {
        sort: { publishedAt: -1 },
        skip,
        limit,
      },
    })
    .lean();
  const totalPages = Math.ceil(totalCount / limit);

  res.json(
    buildSuccessResponse(
      {
        blogs: user.savedBlogs || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
      "Saved blogs retrieved successfully"
    )
  );
});

// Toggle save/unsave a blog
const toggleSaveBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  // Verify blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new NotFoundError("Blog not found");
  }

  const user = await User.findById(userId);

  // Check if already saved
  const savedIndex = user.savedBlogs.findIndex(
    (id) => id.toString() === blogId
  );

  let saved;
  if (savedIndex > -1) {
    // Remove from saved
    user.savedBlogs.splice(savedIndex, 1);
    saved = false;
  } else {
    // Add to saved
    user.savedBlogs.push(blogId);
    saved = true;
  }

  await user.save();

  console.log(
    `[USER] Blog ${saved ? "saved" : "unsaved"}: ${blogId} by ${user.email}`
  );

  res.json(
    buildSuccessResponse(
      {
        saved,
        savedCount: user.savedBlogs.length,
      },
      saved ? "Blog saved" : "Blog removed from saved"
    )
  );
});

// Check if a blog is saved
const checkBlogSaved = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId).select("savedBlogs").lean();

  const saved = user.savedBlogs.some((id) => id.toString() === blogId);

  res.json(buildSuccessResponse({ saved }, "Save status retrieved"));
});

// Get all users (admin)
const adminGetAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const { role, search, isActive } = req.query;

  // Build query
  const query = {};

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (search) {
    // Escape regex metacharacters to prevent ReDoS
    const safeSearch = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [users, totalCount, roleStats] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
    User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Format role stats
  const stats = {
    total: 0,
    user: 0,
    moderator: 0,
    admin: 0,
    active: 0,
    inactive: 0,
  };

  roleStats.forEach((stat) => {
    stats[stat._id] = stat.count;
    stats.total += stat.count;
  });

  // Get active/inactive counts
  const [activeCount] = await User.aggregate([
    { $match: { isActive: true } },
    { $count: "count" },
  ]);
  stats.active = activeCount?.count || 0;
  stats.inactive = stats.total - stats.active;

  res.json(
    buildSuccessResponse(
      {
        users,
        stats,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
      "Users retrieved"
    )
  );
});

// Get single user by ID (admin)
const adminGetUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password").lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Get user activity
  const [blogCount, commentCount, recentBlogs] = await Promise.all([
    Blog.countDocuments({ author: id }),
    Comment.countDocuments({ author: id }),
    Blog.find({ author: id })
      .select("title slug status createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  res.json(
    buildSuccessResponse(
      {
        user,
        activity: {
          blogCount,
          commentCount,
          recentBlogs,
        },
      },
      "User retrieved"
    )
  );
});

// Update user role (admin)
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Prevent self-role change
  if (id === req.user._id.toString()) {
    throw new ForbiddenError("You cannot change your own role");
  }

  const validRoles = ["user", "moderator", "admin"];
  if (!validRoles.includes(role)) {
    throw new BadRequestError("Invalid role");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const previousRole = user.role;
  user.role = role;
  await user.save();

  console.log(
    `[ADMIN] User role changed: ${user.email} from ${previousRole} to ${role}`
  );

  res.json(
    buildSuccessResponse(
      { user: user.getSafeProfile() },
      `User role updated to ${role}`
    )
  );
});

// Toggle user active status (admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deactivation
  if (id === req.user._id.toString()) {
    throw new ForbiddenError("You cannot deactivate your own account");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  console.log(
    `[ADMIN] User ${user.isActive ? "activated" : "deactivated"}: ${user.email}`
  );

  res.json(
    buildSuccessResponse(
      {
        user: user.getSafeProfile(),
        isActive: user.isActive,
      },
      `User ${user.isActive ? "activated" : "deactivated"} successfully`
    )
  );
});

// Delete user (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (id === req.user._id.toString()) {
    throw new ForbiddenError("You cannot delete your own account");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Prevent deleting other admins
  if (user.role === "admin") {
    throw new ForbiddenError("Cannot delete admin accounts");
  }

  // Delete or anonymize user's content
  const { deleteContent } = req.query;

  if (deleteContent === "true") {
    // Delete all user's blogs and comments
    await Promise.all([
      Blog.deleteMany({ author: id }),
      Comment.deleteMany({ author: id }),
    ]);
  } else {
    // Anonymize blogs and comments (soft approach)
    await Promise.all([
      Blog.updateMany({ author: id }, { $set: { author: null } }),
      Comment.updateMany({ author: id }, { $set: { author: null } }),
    ]);
  }

  // Delete the user
  await user.deleteOne();

  console.log(`[ADMIN] User deleted: ${user.email} (ID: ${id})`);

  res.json(
    buildSuccessResponse(
      { message: "User deleted successfully" },
      "User removed"
    )
  );
});

module.exports = {
  // Public
  getPublicProfile,

  // Authenticated
  updateProfile,
  getMyProfile,
  getSavedBlogs,
  toggleSaveBlog,
  checkBlogSaved,

  // Admin
  adminGetAllUsers,
  adminGetUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
};
