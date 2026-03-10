// Blog model - Schema for blog posts with content, categories, likes, and SEO features

const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: "text",
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Blog description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
      index: "text",
    },

    content: {
      type: String,
      required: [true, "Blog content is required"],
      minlength: [50, "Content must be at least 50 characters"],
    },

    image: {
      type: String,
      default: null,
    },

    thumbnail: {
      type: String,
      default: null,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },

    authorName: {
      type: String,
      required: [true, "Author name is required"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Technology",
          "Coding & Programming",
          "Web Development",
          "Study Material",
          "Movies & Entertainment",
          "Games & Gaming",
          "Government Schemes",
          "Jobs & Career",
          "Visa & Immigration",
          "Linux & Tools",
          "Tutorial",
          "News",
          "Design",
          "Best Practices",
          "Other",
        ],
        message: "Invalid category selected",
      },
      index: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

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

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    readTime: {
      type: Number,
      default: 5,
      min: 1,
    },

    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Status must be draft, published, or archived",
      },
      default: "draft",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    metaTitle: {
      type: String,
      maxlength: [70, "Meta title cannot exceed 70 characters"],
    },

    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },

    allowComments: {
      type: Boolean,
      default: true,
    },

    visibility: {
      type: String,
      enum: {
        values: ["everyone", "registered"],
        message: "Visibility must be 'everyone' or 'registered'",
      },
      default: "everyone",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ status: 1, category: 1, publishedAt: -1 }); // category-filtered listing
blogSchema.index({ status: 1, isFeatured: 1, publishedAt: -1 }); // featured listing
blogSchema.index({ status: 1, isTrending: 1, publishedAt: -1 }); // trending listing
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ title: "text", description: "text", content: "text" });

blogSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "blog",
});

blogSchema.virtual("isPublished").get(function () {
  return this.status === "published";
});

blogSchema.virtual("excerpt").get(function () {
  return (
    this.description.substring(0, 150) +
    (this.description.length > 150 ? "..." : "")
  );
});

// Generate slug from title
blogSchema.pre("save", async function (next) {
  if (this.isModified("title") || this.isNew) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    let slug = baseSlug;
    let counter = 1;

    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  next();
});

// Calculate read time based on content length (200 words per minute)
blogSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

// Set publishedAt when status changes to published
blogSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

blogSchema.pre("save", function (next) {
  this.likeCount = this.likes.length;
  next();
});

// Toggle like for a user
blogSchema.methods.toggleLike = function (userId) {
  const existingLikeIndex = this.likes.findIndex(
    (like) => like.user.toString() === userId.toString()
  );

  if (existingLikeIndex > -1) {
    this.likes.splice(existingLikeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }

  this.likeCount = this.likes.length;
  return { liked: existingLikeIndex === -1, likeCount: this.likeCount };
};

blogSchema.methods.hasUserLiked = function (userId) {
  return this.likes.some((like) => like.user.toString() === userId.toString());
};

blogSchema.methods.incrementViews = async function () {
  this.viewCount += 1;
  await this.save({ validateBeforeSave: false });
};

blogSchema.methods.updateCommentCount = async function (delta) {
  this.commentCount = Math.max(0, this.commentCount + delta);
  await this.save({ validateBeforeSave: false });
};

// Find published blogs with pagination
blogSchema.statics.findPublished = async function (options = {}) {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    sortBy = "publishedAt",
    sortOrder = -1,
  } = options;

  const query = { status: "published" };

  if (category && category !== "All") {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    this.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("author", "name avatar")
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    blogs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

blogSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, status: "published" }).populate(
    "author",
    "name avatar bio"
  );
};

blogSchema.statics.getFeatured = function (limit = 5) {
  return this.find({ status: "published", isFeatured: true })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate("author", "name avatar");
};

blogSchema.statics.findByAuthor = function (authorId, includeAll = false) {
  const query = { author: authorId };

  if (!includeAll) {
    query.status = "published";
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate("author", "name avatar");
};

blogSchema.statics.getCategoryStats = function () {
  return this.aggregate([
    { $match: { status: "published" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
