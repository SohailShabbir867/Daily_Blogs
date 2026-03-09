// Blog Controller - Handles blog CRUD, likes, search, filtering, and admin management

const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const { notifyAllSubscribers } = require("../utils/emailService");
const { sanitizeBlogContent } = require("../utils/sanitize");
const {
  asyncHandler,
  buildSuccessResponse,
  parsePaginationParams,
  isValidObjectId,
} = require("../utils/helpers");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

// Get all published blogs with pagination and filtering
const getBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const {
    category,
    search,
    sortBy = "publishedAt",
    sortOrder = "desc",
  } = req.query;

  // Build query
  const query = { status: "published" };

  // Category filter
  if (category && category !== "All") {
    query.category = category;
  }

  // Search filter — escape regex metacharacters to prevent ReDoS attacks
  if (search) {
    const safeSearch = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
      { tags: { $in: [new RegExp(safeSearch, "i")] } },
    ];
  }

  // Build sort object
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortDirection };

  // Execute query with pagination
  const [blogs, totalCount] = await Promise.all([
    Blog.find(query)
      .populate("author", "name avatar")
      .select("-content") // Exclude full content for list view
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(query),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);

  res.json(
    buildSuccessResponse(
      {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Blogs retrieved successfully"
    )
  );
});

// Get a single blog by slug or ID
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  // Try to find by slug first, then by ID
  let blog = await Blog.findOne({ slug: identifier, status: "published" })
    .populate("author", "name avatar bio")
    .lean();

  // If not found by slug, try by ID only when identifier looks like a valid ObjectId
  if (!blog && isValidObjectId(identifier)) {
    blog = await Blog.findOne({ _id: identifier, status: "published" })
      .populate("author", "name avatar bio")
      .lean();
  }

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  // Check visibility - if blog is for registered users only
  if (blog.visibility === "registered") {
    // Check if user is logged in (session exists)
    if (!req.session || !req.session.userId) {
      // Return limited info for non-logged-in users
      return res.status(401).json({
        success: false,
        requiresAuth: true,
        message: "Please login to read this article",
        data: {
          blog: {
            _id: blog._id,
            title: blog.title,
            slug: blog.slug,
            description: blog.description,
            image: blog.image,
            category: blog.category,
            author: blog.author,
            publishedAt: blog.publishedAt,
            readTime: blog.readTime,
            visibility: blog.visibility,
            // Don't include full content
          },
        },
      });
    }
  }

  // Increment view count (non-blocking)
  Blog.findByIdAndUpdate(blog._id, { $inc: { viewCount: 1 } }).catch((err) => {
    console.error("Failed to increment view count:", err.message);
  });

  // Get related blogs
  const relatedBlogs = await Blog.find({
    _id: { $ne: blog._id },
    status: "published",
    $or: [{ category: blog.category }, { tags: { $in: blog.tags } }],
  })
    .select("title slug image publishedAt category visibility")
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  // Get comment count
  const commentCount = await Comment.countDocuments({
    blog: blog._id,
    isDeleted: false,
  });

  res.json(
    buildSuccessResponse(
      {
        blog: {
          ...blog,
          commentCount,
        },
        relatedBlogs,
      },
      "Blog retrieved successfully"
    )
  );
});

// Get featured blogs
const getFeaturedBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({
    status: "published",
    isFeatured: true,
  })
    .populate("author", "name avatar")
    .select("-content")
    .sort({ publishedAt: -1 })
    .limit(5)
    .lean();

  res.json(
    buildSuccessResponse({ blogs }, "Featured blogs retrieved successfully")
  );
});

// Get trending blogs
const getTrendingBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({
    status: "published",
    isTrending: true,
  })
    .populate("author", "name avatar")
    .select("-content")
    .sort({ publishedAt: -1 })
    .limit(10)
    .lean();

  res.json(
    buildSuccessResponse({ blogs }, "Trending blogs retrieved successfully")
  );
});

// Get blog categories with counts
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Blog.getCategoryStats();

  res.json(
    buildSuccessResponse({ categories }, "Categories retrieved successfully")
  );
});

// Toggle like on a blog
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  const result = blog.toggleLike(userId);
  await blog.save();

  res.json(
    buildSuccessResponse(
      {
        liked: result.liked,
        likeCount: result.likeCount,
      },
      result.liked ? "Blog liked" : "Like removed"
    )
  );
});

// Check if user has liked a blog
const getLikeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const blog = await Blog.findById(id).select("likes likeCount");

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  const liked = blog.likes.some(
    (like) => like.toString() === userId.toString()
  );

  res.json(
    buildSuccessResponse(
      {
        liked,
        likeCount: blog.likeCount,
      },
      "Like status retrieved"
    )
  );
});

// Create a new blog post
const createBlog = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    content,
    category,
    image,
    tags,
    status,
    visibility,
  } = req.body;

  // Sanitize HTML content to prevent XSS
  const sanitizedContent = sanitizeBlogContent(content);

  const blog = await Blog.create({
    title,
    description,
    content: sanitizedContent,
    category,
    image,
    tags: tags || [],
    author: req.user._id,
    authorName: req.user.name, // Set author name from authenticated user
    status: status || "draft",
    visibility: visibility || "everyone", // Default to everyone
    publishedAt: status === "published" ? new Date() : null,
  });

  // Populate author for response
  await blog.populate("author", "name avatar");

  console.log(`[BLOG] New blog created: "${blog.title}" by ${req.user.email}`);

  // Send email notifications to subscribers if blog is published
  if (status === "published") {
    // Send notifications in background (non-blocking)
    notifyAllSubscribers(blog.toObject(), req.user.name || req.user.email)
      .then((result) => {
        console.log(
          `[BLOG] Subscriber notifications sent: ${result.sent} sent, ${result.failed} failed`
        );
      })
      .catch((err) => {
        console.error(
          `[BLOG] Failed to send subscriber notifications:`,
          err.message
        );
      });
  }

  res
    .status(201)
    .json(buildSuccessResponse({ blog }, "Blog created successfully"));
});

// Update a blog post
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  // Check ownership - admins can only edit their own blogs
  // Super admins can edit any blog
  const isOwner = blog.author.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.isSuperAdmin === true;

  if (!isOwner && !isSuperAdmin) {
    throw new ForbiddenError("You can only edit your own blog posts");
  }

  // Track if this is a new publish (for notifications)
  const isNewPublish =
    updates.status === "published" && blog.status !== "published";

  // Handle status change to published
  if (isNewPublish) {
    updates.publishedAt = new Date();
  }

  // Update allowed fields
  const allowedUpdates = [
    "title",
    "description",
    "content",
    "category",
    "image",
    "tags",
    "status",
    "visibility",
  ];

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      // Sanitize content field to prevent XSS
      if (field === "content") {
        blog[field] = sanitizeBlogContent(updates[field]);
      } else {
        blog[field] = updates[field];
      }
    }
  });

  // Save with validation
  await blog.save();
  await blog.populate("author", "name avatar");

  console.log(`[BLOG] Blog updated: "${blog.title}" (ID: ${blog._id})`);

  // Send notifications if blog was just published
  if (isNewPublish) {
    notifyAllSubscribers(blog.toObject(), req.user.name || req.user.email)
      .then((result) => {
        console.log(
          `[BLOG] Subscriber notifications sent: ${result.sent} sent, ${result.failed} failed`
        );
      })
      .catch((err) => {
        console.error(
          `[BLOG] Failed to send subscriber notifications:`,
          err.message
        );
      });
  }

  res.json(buildSuccessResponse({ blog }, "Blog updated successfully"));
});

// Delete a blog post
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  // Check ownership - admins can only delete their own blogs
  // Super admins can delete any blog
  const isOwner = blog.author.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.isSuperAdmin === true;

  if (!isOwner && !isSuperAdmin) {
    throw new ForbiddenError("You can only delete your own blog posts");
  }

  // Delete associated comments
  await Comment.deleteMany({ blog: blog._id });

  // Delete the blog
  await blog.deleteOne();

  console.log(`[BLOG] Blog deleted: "${blog.title}" (ID: ${blog._id})`);

  res.json(
    buildSuccessResponse(
      { message: "Blog deleted successfully" },
      "Blog removed"
    )
  );
});

// Get user's own blogs
const getMyBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const { status } = req.query;

  // Build query
  const query = { author: req.user._id };

  if (status) {
    query.status = status;
  }

  const [blogs, totalCount] = await Promise.all([
    Blog.find(query)
      .select("-content")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json(
    buildSuccessResponse(
      {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
      "Your blogs retrieved successfully"
    )
  );
});

// Get all blogs (including drafts) - Admin only
const adminGetAllBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const { status, category, search } = req.query;

  // Build query
  const query = {};

  // Regular admins can only see their own blogs
  // Super admins can see all blogs
  if (!req.user.isSuperAdmin) {
    query.author = req.user._id;
  }

  if (status) {
    query.status = status;
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { "author.name": { $regex: search, $options: "i" } },
    ];
  }

  // Build stats query (same filter as main query for consistency)
  const statsQuery = req.user.isSuperAdmin ? {} : { author: req.user._id };

  const [blogs, totalCount, stats] = await Promise.all([
    Blog.find(query)
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(query),
    Blog.aggregate([
      { $match: statsQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Format stats
  const statsFormatted = {
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  };

  stats.forEach((stat) => {
    statsFormatted[stat._id] = stat.count;
    statsFormatted.total += stat.count;
  });

  // Add canEdit and canDelete flags to each blog for the frontend
  const blogsWithPermissions = blogs.map((blog) => {
    // Check if author exists (in case user was deleted)
    const isOwner = blog.author && blog.author._id ? blog.author._id.toString() === req.user._id.toString() : false;
    const isSuperAdmin = req.user.isSuperAdmin === true;
    return {
      ...blog,
      canEdit: isOwner || isSuperAdmin,
      canDelete: isOwner || isSuperAdmin,
      isOwner,
    };
  });

  res.json(
    buildSuccessResponse(
      {
        blogs: blogsWithPermissions,
        stats: statsFormatted,
        isSuperAdmin: req.user.isSuperAdmin === true,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
      req.user.isSuperAdmin ? "All blogs retrieved" : "Your blogs retrieved"
    )
  );
});

// Toggle blog featured status - Admin only
const toggleFeatured = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  blog.isFeatured = !blog.isFeatured;
  await blog.save();

  console.log(
    `[ADMIN] Blog ${blog.isFeatured ? "featured" : "unfeatured"}: "${blog.title
    }"`
  );

  res.json(
    buildSuccessResponse(
      {
        blog,
        isFeatured: blog.isFeatured,
      },
      `Blog ${blog.isFeatured ? "featured" : "unfeatured"} successfully`
    )
  );
});

// Toggle blog trending status - Super Admin only
const toggleTrending = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  blog.isTrending = !blog.isTrending;
  await blog.save();

  console.log(
    `[ADMIN] Blog ${blog.isTrending ? "marked as trending" : "removed from trending"}: "${blog.title}"`
  );

  res.json(
    buildSuccessResponse(
      {
        blog,
        isTrending: blog.isTrending,
      },
      `Blog ${blog.isTrending ? "marked as trending" : "removed from trending"} successfully`
    )
  );
});

// Bulk update blog status - Admin only
const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { blogIds, status } = req.body;

  if (!Array.isArray(blogIds) || blogIds.length === 0) {
    throw new BadRequestError("Please provide blog IDs");
  }

  const validStatuses = ["draft", "published", "archived"];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError("Invalid status");
  }

  const updateData = { status };

  // Set publishedAt for newly published blogs
  if (status === "published") {
    updateData.publishedAt = new Date();
  }

  // Build query - regular admins can only update their own blogs
  // Super admins can update any blog
  const query = { _id: { $in: blogIds } };
  if (!req.user.isSuperAdmin) {
    query.author = req.user._id;
  }

  const result = await Blog.updateMany(query, { $set: updateData });

  console.log(
    `[ADMIN] Bulk status update: ${result.modifiedCount} blogs set to "${status}"`
  );

  res.json(
    buildSuccessResponse(
      {
        modifiedCount: result.modifiedCount,
        status,
      },
      `${result.modifiedCount} blogs updated`
    )
  );
});

// Admin delete blog - respects ownership for regular admins
const adminDeleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id).populate("author", "name email");

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  // Check ownership - regular admins can only delete their own blogs
  // Super admins can delete any blog
  const isOwner =
    blog.author && blog.author._id.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.isSuperAdmin === true;

  if (!isOwner && !isSuperAdmin) {
    throw new ForbiddenError("You can only delete your own blog posts");
  }

  // Delete associated comments
  await Comment.deleteMany({ blog: blog._id });

  // Delete the blog
  await blog.deleteOne();

  console.log(
    `[ADMIN] Blog deleted: "${blog.title}" (ID: ${blog._id}) by ${req.user.email}`
  );

  res.json(
    buildSuccessResponse(
      { message: "Blog deleted successfully" },
      "Blog removed"
    )
  );
});

// Admin update blog - respects ownership for regular admins
const adminUpdateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  // Check ownership - regular admins can only edit their own blogs
  // Super admins can edit any blog
  const isOwner = blog.author.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.isSuperAdmin === true;

  if (!isOwner && !isSuperAdmin) {
    throw new ForbiddenError("You can only edit your own blog posts");
  }

  // Track if this is a new publish (for notifications)
  const isNewPublish =
    updates.status === "published" && blog.status !== "published";

  // Handle status change to published
  if (isNewPublish) {
    updates.publishedAt = new Date();
  }

  // Update allowed fields
  const allowedUpdates = [
    "title",
    "description",
    "content",
    "category",
    "image",
    "tags",
    "status",
  ];

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      // Sanitize content field to prevent XSS
      if (field === "content") {
        blog[field] = sanitizeBlogContent(updates[field]);
      } else {
        blog[field] = updates[field];
      }
    }
  });

  // Save with validation
  await blog.save();
  await blog.populate("author", "name avatar");

  console.log(
    `[ADMIN] Blog updated: "${blog.title}" (ID: ${blog._id}) by ${req.user.email}`
  );

  // Send notifications if blog was just published
  if (isNewPublish) {
    notifyAllSubscribers(blog.toObject(), req.user.name || req.user.email)
      .then((result) => {
        console.log(
          `[BLOG] Subscriber notifications sent: ${result.sent} sent, ${result.failed} failed`
        );
      })
      .catch((err) => {
        console.error(
          `[BLOG] Failed to send subscriber notifications:`,
          err.message
        );
      });
  }

  res.json(buildSuccessResponse({ blog }, "Blog updated successfully"));
});

// Get a single blog by ID for admin editing
const adminGetBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id)
    .populate("author", "name email avatar")
    .lean();

  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  // Check ownership for regular admins (handle orphaned blogs)
  const isOwner = blog.author && blog.author._id ? blog.author._id.toString() === req.user._id.toString() : false;
  const isSuperAdmin = req.user.isSuperAdmin === true;

  if (!isOwner && !isSuperAdmin) {
    throw new ForbiddenError(
      "You can only view your own blog posts in edit mode"
    );
  }

  res.json(
    buildSuccessResponse(
      {
        blog,
        canEdit: isOwner || isSuperAdmin,
        canDelete: isOwner || isSuperAdmin,
        isOwner,
      },
      "Blog retrieved successfully"
    )
  );
});

module.exports = {
  // Public
  getBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getTrendingBlogs,
  getCategories,

  // Authenticated
  toggleLike,
  getLikeStatus,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,

  // Admin
  adminGetAllBlogs,
  adminGetBlog,
  adminUpdateBlog,
  adminDeleteBlog,
  toggleFeatured,
  toggleTrending,
  bulkUpdateStatus,
};
