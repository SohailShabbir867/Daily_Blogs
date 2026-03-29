// User model - handles user accounts, authentication, and profile data
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    role: {
      type: String,
      enum: {
        values: ["user", "admin", "cr"],
        message: "Role must be user, admin, or cr",
      },
      default: "user",
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    isChatSupport: {
      type: Boolean,
      default: false,
    },

    // CR (Class Representative) — can upload and manage private files
    isCR: {
      type: Boolean,
      default: false,
    },

    // Granted by Super Admin or CR — user can see the Study Files navbar link
    hasFileAccess: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    savedBlogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      select: false,
    },

    passwordResetOTP: {
      type: String,
      select: false,
    },

    otpExpires: {
      type: Date,
      select: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    termsAcceptedAt: {
      type: Date,
      required: [true, "You must accept the Terms and Conditions"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1 });

userSchema.virtual("displayName").get(function () {
  return this.name || this.email.split("@")[0];
});

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);

    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Auto-assign admin role based on email pattern
userSchema.pre("save", function (next) {
  if (this.isNew) {
    const emailLower = this.email.toLowerCase();
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "")
      .toLowerCase()
      .trim();

    if (superAdminEmail && emailLower === superAdminEmail) {
      this.role = "admin";
      this.isSuperAdmin = true;
    } else {
      const adminPatterns = (process.env.ADMIN_EMAIL_PATTERNS || "admin")
        .split(",")
        .map((p) => p.trim().toLowerCase());

      const isAdmin = adminPatterns.some((pattern) =>
        emailLower.includes(pattern)
      );

      if (isAdmin) {
        this.role = "admin";
      }
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

userSchema.methods.changedPasswordAfter = function (timestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return timestamp < changedTimestamp;
  }
  return false;
};

// Increment login attempts for brute force protection
userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 },
  });
};

// Get user profile without sensitive data
userSchema.methods.getSafeProfile = function () {
  return {
    id: this._id,
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    role: this.role,
    isSuperAdmin: this.isSuperAdmin,
    isCR: this.isCR,
    hasFileAccess: this.hasFileAccess,
    isChatSupport: this.isChatSupport,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    savedBlogs: this.savedBlogs,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

userSchema.methods.toggleSavedBlog = async function (blogId) {
  const index = this.savedBlogs.indexOf(blogId);

  if (index === -1) {
    this.savedBlogs.push(blogId);
  } else {
    this.savedBlogs.splice(index, 1);
  }

  await this.save();
  return index === -1;
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select("+password");
};

userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

userSchema.statics.findAdmins = function () {
  return this.find({ role: "admin", isActive: true });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
