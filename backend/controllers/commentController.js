// Comment Controller - Handles comments CRUD and moderation

const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const { escapeHtml } = require("../utils/sanitize");
const {
  asyncHandler,
  buildSuccessResponse,
  parsePaginationParams,
} = require("../utils/helpers");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

// Get comments for a blog post
const getComments = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { page, limit, skip } = parsePaginationParams(req.query);

  // Verify blog exists
  const blogExists = await Blog.exists({ _id: blogId });
  if (!blogExists) {
    throw new NotFoundError("Blog post not found");
  }

  // Get top-level comments (not replies)
  const query = {
    blog: blogId,
    parentComment: null,
    isDeleted: false,
  };

  const [comments, totalCount] = await Promise.all([
    Comment.find(query)
      .populate("user", "name avatar")
      .populate({
        path: "replies",
        match: { isDeleted: false },
        populate: {
          path: "user",
          select: "name avatar",
        },
        options: { sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json(
    buildSuccessResponse(
      {
        comments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
      "Comments retrieved successfully"
    )
  );
});

// Get a single comment with its replies
const getComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id)
    .populate("user", "name avatar")
    .populate({
      path: "replies",
      match: { isDeleted: false },
      populate: {
        path: "user",
        select: "name avatar",
      },
    })
    .lean();

  if (!comment || comment.isDeleted) {
    throw new NotFoundError("Comment not found");
  }

  res.json(buildSuccessResponse({ comment }, "Comment retrieved successfully"));
});

// Create a new comment
const createComment = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { text, parentComment } = req.body;

  const blog = await Blog.findOne({ _id: blogId, status: "published" });
  if (!blog) {
    throw new NotFoundError("Blog post not found");
  }

  const commentData = {
    text: escapeHtml(text.trim()),
    blog: blogId,
    user: req.user._id,
    userName: req.user.name,
  };

  // Handle reply
  if (parentComment) {
    const parent = await Comment.findById(parentComment);

    if (!parent || parent.isDeleted) {
      throw new NotFoundError("Parent comment not found");
    }

    if (parent.blog.toString() !== blogId) {
      throw new BadRequestError("Parent comment does not belong to this blog");
    }

    // Check reply depth (max 3 levels)
    if (parent.depth >= 2) {
      throw new BadRequestError("Maximum reply depth reached");
    }

    commentData.parentComment = parentComment;
    commentData.depth = parent.depth + 1;
  }

  // Create comment
  const comment = await Comment.create(commentData);

  // If it's a reply, add to parent's replies array
  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment, {
      $push: { replies: comment._id },
    });
  }

  // Increment blog's comment count
  await Blog.findByIdAndUpdate(blogId, {
    $inc: { commentCount: 1 },
  });

  await comment.populate("user", "name avatar");

  console.log(`[COMMENT] New comment on blog ${blogId}`);

  res
    .status(201)
    .json(buildSuccessResponse({ comment }, "Comment posted successfully"));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const comment = await Comment.findById(id);

  if (!comment || comment.isDeleted) {
    throw new NotFoundError("Comment not found");
  }

  // Check ownership
  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ForbiddenError("You can only edit your own comments");
  }

  // Check if comment is too old to edit (e.g., 24 hours)
  const hoursSinceCreation =
    (Date.now() - comment.createdAt) / (1000 * 60 * 60);

  if (hoursSinceCreation > 24) {
    throw new ForbiddenError(
      "Comments can only be edited within 24 hours of posting"
    );
  }

  // Update comment
  comment.text = escapeHtml(text.trim());
  comment.isEdited = true;
  comment.editedAt = new Date();
  await comment.save();

  await comment.populate("user", "name avatar");

  console.log(`[COMMENT] Comment updated: ${id}`);

  res.json(buildSuccessResponse({ comment }, "Comment updated successfully"));
});

// Delete a comment (soft delete)
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment || comment.isDeleted) {
    throw new NotFoundError("Comment not found");
  }

  const isOwner = comment.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin" || req.user.isSuperAdmin;

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError("You can only delete your own comments");
  }

  // Soft delete
  comment.isDeleted = true;
  comment.deletedAt = new Date();
  comment.deletedBy = req.user._id;
  await comment.save();

  // Decrement blog's comment count
  await Blog.findByIdAndUpdate(comment.blog, {
    $inc: { commentCount: -1 },
  });

  console.log(`[COMMENT] Comment deleted: ${id}`);

  res.json(
    buildSuccessResponse(
      { message: "Comment deleted successfully" },
      "Comment removed"
    )
  );
});

// Get all comments (admin view)
const adminGetAllComments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const { blogId, userId, flagged, search } = req.query;

  const query = {};

  if (blogId) query.blog = blogId;
  if (userId) query.user = userId;
  if (flagged === "true") query.isFlagged = true;
  if (search) {
    const safeSearch = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.text = { $regex: safeSearch, $options: "i" };
  }

  const [comments, totalCount, stats] = await Promise.all([
    Comment.find(query)
      .populate("user", "name email avatar")
      .populate("blog", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(query),
    Comment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          flagged: {
            $sum: { $cond: ["$isFlagged", 1, 0] },
          },
          deleted: {
            $sum: { $cond: ["$isDeleted", 1, 0] },
          },
        },
      },
    ]),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json(
    buildSuccessResponse(
      {
        comments,
        stats: stats[0] || { total: 0, flagged: 0, deleted: 0 },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
      "Comments retrieved"
    )
  );
});

// Flag/unflag a comment for moderation
const toggleFlagComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const comment = await Comment.findById(id);

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  comment.isFlagged = !comment.isFlagged;

  if (comment.isFlagged) {
    comment.flagReason = reason || "Flagged by moderator";
    comment.flaggedBy = req.user._id;
    comment.flaggedAt = new Date();
  } else {
    comment.flagReason = undefined;
    comment.flaggedBy = undefined;
    comment.flaggedAt = undefined;
  }

  await comment.save();

  console.log(
    `[ADMIN] Comment ${comment.isFlagged ? "flagged" : "unflagged"}: ${id}`
  );

  res.json(
    buildSuccessResponse(
      { comment },
      `Comment ${comment.isFlagged ? "flagged" : "unflagged"} successfully`
    )
  );
});

// Bulk delete comments (admin)
const bulkDeleteComments = asyncHandler(async (req, res) => {
  const { commentIds } = req.body;

  if (!Array.isArray(commentIds) || commentIds.length === 0) {
    throw new BadRequestError("Please provide comment IDs");
  }

  const result = await Comment.updateMany(
    { _id: { $in: commentIds } },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user._id,
      },
    }
  );

  console.log(`[ADMIN] Bulk delete: ${result.modifiedCount} comments`);

  res.json(
    buildSuccessResponse(
      { deletedCount: result.modifiedCount },
      `${result.modifiedCount} comments deleted`
    )
  );
});

// Toggle like on a comment
const toggleLikeComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(id);

  if (!comment || comment.isDeleted) {
    throw new NotFoundError("Comment not found");
  }

  const existingLikeIndex = comment.likes.findIndex(
    (like) => like.user.toString() === userId.toString()
  );

  let liked;
  if (existingLikeIndex > -1) {
    // Unlike
    comment.likes.splice(existingLikeIndex, 1);
    liked = false;
  } else {
    // Like
    comment.likes.push({ user: userId, likedAt: new Date() });
    liked = true;
  }

  await comment.save();

  res.json(
    buildSuccessResponse(
      { liked, likeCount: comment.likes.length },
      liked ? "Comment liked" : "Comment unliked"
    )
  );
});

module.exports = {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  adminGetAllComments,
  toggleFlagComment,
  bulkDeleteComments,
  toggleLikeComment,
};
