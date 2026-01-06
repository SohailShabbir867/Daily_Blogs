// Comment model - handles user comments on blog posts with nested replies, likes, and moderation

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog reference is required"],
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },

    userName: {
      type: String,
      required: true,
    },

    userAvatar: {
      type: String,
      default: null,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    depth: {
      type: Number,
      default: 0,
      max: 3, // Limit nesting depth
    },

    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    isApproved: {
      type: Boolean,
      default: true, // Auto-approve by default
    },

    isSpam: {
      type: Boolean,
      default: false,
    },

    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        if (ret.isDeleted) {
          ret.text = "[Comment deleted]";
          ret.userName = "[Deleted]";
        }
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

commentSchema.index({ blog: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ isApproved: 1, isSpam: 1, isDeleted: 1 });

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
  match: { isDeleted: false },
});

commentSchema.virtual("canHaveReplies").get(function () {
  return this.depth < 3 && !this.isDeleted;
});

// Update like count before saving
commentSchema.pre("save", function (next) {
  this.likeCount = this.likes.length;
  next();
});

// Set edit timestamp when text is modified
commentSchema.pre("save", function (next) {
  if (this.isModified("text") && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Calculate depth for replies
commentSchema.pre("save", async function (next) {
  if (this.isNew && this.parentComment) {
    try {
      const parent = await this.constructor.findById(this.parentComment);
      if (parent) {
        this.depth = parent.depth + 1;
        if (this.depth > 3) {
          return next(new Error("Maximum comment nesting depth exceeded"));
        }
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Update blog comment count after saving
commentSchema.post("save", async function (doc) {
  try {
    const Blog = mongoose.model("Blog");
    const count = await this.constructor.countDocuments({
      blog: doc.blog,
      isDeleted: false,
    });

    await Blog.findByIdAndUpdate(doc.blog, { commentCount: count });
  } catch (error) {
    console.error("Error updating blog comment count:", error.message);
  }
});

// Toggle like for a user
commentSchema.methods.toggleLike = async function (userId) {
  const existingLikeIndex = this.likes.findIndex(
    (like) => like.user.toString() === userId.toString()
  );

  if (existingLikeIndex > -1) {
    this.likes.splice(existingLikeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }

  this.likeCount = this.likes.length;
  await this.save();

  return existingLikeIndex === -1;
};

// Soft delete the comment
commentSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();

  const Blog = mongoose.model("Blog");
  const count = await this.constructor.countDocuments({
    blog: this.blog,
    isDeleted: false,
  });
  await Blog.findByIdAndUpdate(this.blog, { commentCount: count });
};

// Report comment for moderation
commentSchema.methods.report = async function () {
  this.reportCount += 1;
  if (this.reportCount >= 3) {
    this.isSpam = true;
    this.isApproved = false;
  }

  await this.save();
};

// Find comments for a blog with pagination
commentSchema.statics.findByBlog = async function (blogId, options = {}) {
  const { page = 1, limit = 20, includeReplies = true } = options;
  const skip = (page - 1) * limit;

  const query = {
    blog: blogId,
    isDeleted: false,
    parentComment: null,
  };

  let commentsQuery = this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name avatar");

  if (includeReplies) {
    commentsQuery = commentsQuery.populate({
      path: "replies",
      options: { sort: { createdAt: 1 } },
      populate: {
        path: "user",
        select: "name avatar",
      },
    });
  }

  const [comments, total] = await Promise.all([
    commentsQuery.lean(),
    this.countDocuments(query),
  ]);

  return {
    comments,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

// Find comments by user
commentSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .populate("blog", "title slug");
};

// Get comments needing moderation
commentSchema.statics.findForModeration = function () {
  return this.find({
    $or: [
      { isApproved: false },
      { isSpam: true },
      { reportCount: { $gte: 1 } },
    ],
    isDeleted: false,
  })
    .sort({ reportCount: -1, createdAt: -1 })
    .populate("user", "name email")
    .populate("blog", "title");
};

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
