// PrivateFile model — stores metadata for password-protected PDFs/PPTs uploaded by CRs
// Actual files are stored on Cloudinary. Only the secure URL + metadata is stored here.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const privateFileSchema = new mongoose.Schema(
  {
    // ── Core Info ─────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "File title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    // ── Academic Metadata ─────────────────────────────────────────────────────
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },

    section: {
      type: String,
      trim: true,
      maxlength: [50, "Section cannot exceed 50 characters"],
      default: "",
    },

    lectureNumber: {
      type: Number,
      min: [1, "Lecture number must be at least 1"],
      default: null,
    },

    professorName: {
      type: String,
      trim: true,
      maxlength: [100, "Professor name cannot exceed 100 characters"],
      default: "",
    },

    lectureDate: {
      type: Date,
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },

    // ── File Info (from Cloudinary) ────────────────────────────────────────────
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },

    fileType: {
      type: String,
      enum: {
        values: ["pdf", "ppt", "pptx", "doc", "docx", "other"],
        message: "Invalid file type",
      },
      required: [true, "File type is required"],
    },

    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },

    fileSizeBytes: {
      type: Number,
      default: 0,
    },

    cloudinaryPublicId: {
      type: String,
      default: "",
    },

    // ── Access Control ────────────────────────────────────────────────────────
    isPasswordProtected: {
      type: Boolean,
      default: true,
    },

    // Bcrypt-hashed access password. select:false means it never leaks in API responses.
    accessPassword: {
      type: String,
      select: false,
    },

    // ── Tracking ──────────────────────────────────────────────────────────────
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader is required"],
    },

    accessCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Never expose hash in any JSON response
        delete ret.accessPassword;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes for fast queries
privateFileSchema.index({ subject: 1, isActive: 1 });
privateFileSchema.index({ uploadedBy: 1 });
privateFileSchema.index({ createdAt: -1 });

// Hash access password before saving
privateFileSchema.pre("save", async function (next) {
  if (!this.isModified("accessPassword") || !this.accessPassword) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.accessPassword = await bcrypt.hash(this.accessPassword, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Verify the password a user entered against the stored hash
privateFileSchema.methods.verifyPassword = async function (candidatePassword) {
  if (!this.isPasswordProtected) return true;
  if (!this.accessPassword) return false;
  return bcrypt.compare(candidatePassword, this.accessPassword);
};

// Virtual: human-readable file size
privateFileSchema.virtual("fileSizeDisplay").get(function () {
  const bytes = this.fileSizeBytes || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
});

const PrivateFile = mongoose.model("PrivateFile", privateFileSchema);

module.exports = PrivateFile;
