// Rate limiting middleware to protect API endpoints from abuse

const rateLimit = require("express-rate-limit");
const { ApiError } = require("../utils/errors");

// Default rate limiter: 100 requests per 15 minutes per IP
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    status: "error",
    message:
      "Too many requests from this IP, please try again after 15 minutes",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  // Custom handler for rate limit exceeded
  handler: (req, res, next, options) => {
    const error = new ApiError(options.message.message, 429);
    error.code = "RATE_LIMIT_EXCEEDED";
    next(error);
  },

  // Skip rate limiting for certain requests
  skip: (req) => {
    // Skip for localhost in development
    if (process.env.NODE_ENV === "development") {
      return req.ip === "127.0.0.1" || req.ip === "::1";
    }
    return false;
  },
});

// Auth limiter: 5 requests per 15 minutes per IP (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    status: "error",
    message: "Too many login attempts, please try again after 15 minutes",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,

  // Custom key generator - can be based on email for login attempts
  keyGenerator: (req) => {
    // Use email + IP for login attempts
    if (req.body && req.body.email) {
      return `${req.ip}-${req.body.email.toLowerCase()}`;
    }
    return req.ip;
  },

  handler: (req, res, next, options) => {
    const error = new ApiError(options.message.message, 429);
    error.code = "AUTH_RATE_LIMIT_EXCEEDED";
    next(error);
  },

  // Skip for successful logins (optional)
  skipSuccessfulRequests: false,
});

// Password reset limiter: 3 requests per hour per IP
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    status: "error",
    message: "Too many password reset attempts, please try again after an hour",
    code: "PASSWORD_RESET_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, next, options) => {
    const error = new ApiError(options.message.message, 429);
    error.code = "PASSWORD_RESET_LIMIT_EXCEEDED";
    next(error);
  },
});

// Registration limiter: 10 requests per hour per IP
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 registrations per hour
  message: {
    success: false,
    status: "error",
    message:
      "Too many accounts created from this IP, please try again after an hour",
    code: "REGISTRATION_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, next, options) => {
    const error = new ApiError(options.message.message, 429);
    error.code = "REGISTRATION_LIMIT_EXCEEDED";
    next(error);
  },
});

// Write limiter: 30 requests per minute per IP (for data modifications)
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 write operations per minute
  message: {
    success: false,
    status: "error",
    message: "Too many write operations, please slow down",
    code: "WRITE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,

  // Only apply to POST, PUT, PATCH, DELETE
  skip: (req) => {
    return (
      req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS"
    );
  },

  handler: (req, res, next, options) => {
    const error = new ApiError(options.message.message, 429);
    error.code = "WRITE_LIMIT_EXCEEDED";
    next(error);
  },
});

// Search limiter: 20 requests per minute per IP
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 searches per minute
  message: {
    success: false,
    status: "error",
    message: "Too many search requests, please slow down",
    code: "SEARCH_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, next, options) => {
    const error = new ApiError(options.message.message, 429);
    error.code = "SEARCH_LIMIT_EXCEEDED";
    next(error);
  },
});

// Create a custom rate limiter with specific settings
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = "Too many requests, please try again later",
    code = "RATE_LIMIT_EXCEEDED",
    keyGenerator = (req) => req.ip,
    skip = () => false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      status: "error",
      message,
      code,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skip,
    handler: (req, res, next, opts) => {
      const error = new ApiError(opts.message.message, 429);
      error.code = code;
      next(error);
    },
  });
};

// In-memory store for sliding window rate limiting (use Redis in production)
const slidingWindowStore = new Map();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of slidingWindowStore.entries()) {
    if (now > data.windowStart + data.windowMs) {
      slidingWindowStore.delete(key);
    }
  }
}, 60 * 1000);

// Sliding window rate limiter for more accurate rate limiting
const slidingWindowLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 60,
    message = "Rate limit exceeded",
    keyGenerator = (req) => req.ip,
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let data = slidingWindowStore.get(key);

    if (!data) {
      data = {
        count: 0,
        windowStart: now,
        windowMs,
      };
      slidingWindowStore.set(key, data);
    }

    // Check if window has expired
    if (now > data.windowStart + windowMs) {
      data.count = 0;
      data.windowStart = now;
    }

    data.count++;

    // Set rate limit headers
    res.set("X-RateLimit-Limit", max);
    res.set("X-RateLimit-Remaining", Math.max(0, max - data.count));
    res.set(
      "X-RateLimit-Reset",
      new Date(data.windowStart + windowMs).toISOString()
    );

    if (data.count > max) {
      const error = new ApiError(message, 429);
      error.code = "RATE_LIMIT_EXCEEDED";
      return next(error);
    }

    next();
  };
};

module.exports = {
  defaultLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  writeLimiter,
  searchLimiter,
  createRateLimiter,
  slidingWindowLimiter,
  chatMessageLimiter: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 messages per minute per user
    message: {
      success: false,
      status: "error",
      message: "Too many messages sent. Please slow down.",
      code: "CHAT_RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Rate limit per user ID instead of IP
      return req.user?._id?.toString() || req.ip;
    },
    handler: (req, res, next, options) => {
      const error = new ApiError(options.message.message, 429);
      error.code = "CHAT_RATE_LIMIT_EXCEEDED";
      next(error);
    },
  }),
};
