/**
 * Subscriber Model
 * Stores email subscriptions for blog notifications
 * Only authenticated users can subscribe with their registered email
 */

const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    // Reference to the user who subscribed
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    // Track when terms were accepted
    acceptedTermsAt: {
      type: Date,
      required: [true, "Terms acceptance is required"],
    },
    unsubscribeToken: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user lookup
subscriberSchema.index({ userId: 1 });

// Generate unsubscribe token before saving
subscriberSchema.pre("save", function (next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = require("crypto").randomBytes(32).toString("hex");
  }
  next();
});

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

module.exports = Subscriber;
