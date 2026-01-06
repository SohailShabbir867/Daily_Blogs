// Centralized error handling middleware for the application

const { ApiError } = require("../utils/errors");

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  logError(err, req);

  // Handle specific error types
  let error = err;

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    error = new ApiError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(messages.join(". "), 400);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      409
    );
  }

  // JSON Web Token Errors (if using JWT in future)
  if (err.name === "JsonWebTokenError") {
    error = new ApiError("Invalid token. Please log in again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError("Your session has expired. Please log in again.", 401);
  }

  // Express-validator errors
  if (Array.isArray(err.errors)) {
    const messages = err.errors.map((e) => e.msg);
    error = new ApiError(messages.join(". "), 400);
  }

  // Multer file upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new ApiError("File too large. Maximum size is 5MB.", 400);
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    error = new ApiError("Unexpected file field.", 400);
  }

  // Default to 500 if no status code set
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Build error response
  const response = {
    success: false,
    status: "error",
    message,
    ...(error.code && { code: error.code }),
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.originalError = err.message !== message ? err.message : undefined;
  }

  // Add validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }

  // Send response
  res.status(statusCode).json(response);
};

// Log error details for debugging
const logError = (err, req) => {
  const timestamp = new Date().toISOString();
  const userId = req.user?._id || "anonymous";
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection?.remoteAddress;

  // Determine error severity
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  // Build log entry
  const logEntry = {
    timestamp,
    level: isServerError ? "ERROR" : "WARN",
    method,
    url,
    userId,
    ip,
    statusCode,
    message: err.message,
    name: err.name,
  };

  // Add stack trace for server errors
  if (isServerError) {
    logEntry.stack = err.stack;
  }

  // Log based on environment
  if (process.env.NODE_ENV === "development") {
    console.error("\n🔴 Error:", JSON.stringify(logEntry, null, 2));
    if (isServerError) {
      console.error("Stack:", err.stack);
    }
  } else {
    // In production, use structured logging
    if (isServerError) {
      console.error(JSON.stringify(logEntry));
    } else {
      console.warn(JSON.stringify(logEntry));
    }
  }
};

// Handle 404 Not Found errors (use after all routes)
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(`Cannot ${req.method} ${req.originalUrl}`, 404);
  error.code = "ROUTE_NOT_FOUND";
  next(error);
};

// Wrap async route handlers to catch errors
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const { validationResult } = require("express-validator");

// Middleware to check for validation errors (use after express-validator chains)
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(
      "[VALIDATION ERROR] Request body:",
      JSON.stringify(req.body, null, 2)
    );
    console.log(
      "[VALIDATION ERROR] Errors:",
      JSON.stringify(errors.array(), null, 2)
    );
    const error = new ApiError("Validation failed", 400);
    error.code = "VALIDATION_ERROR";
    error.errors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    return next(error);
  }

  next();
};

// Setup handlers for unhandled rejections and exceptions
const setupUnhandledErrorHandlers = (server) => {
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("🔴 UNHANDLED REJECTION!");
    console.error("Reason:", reason);

    // Give server time to finish ongoing requests, then exit
    server.close(() => {
      console.error("Server closed due to unhandled rejection");
      process.exit(1);
    });

    // Force exit if server doesn't close in 10 seconds
    setTimeout(() => {
      console.error("Forcing exit...");
      process.exit(1);
    }, 10000);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("🔴 UNCAUGHT EXCEPTION!");
    console.error("Error:", error.name, error.message);
    console.error("Stack:", error.stack);

    // Exit immediately for uncaught exceptions
    process.exit(1);
  });

  // Handle SIGTERM
  process.on("SIGTERM", () => {
    console.log("👋 SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });

  // Handle SIGINT (Ctrl+C)
  process.on("SIGINT", () => {
    console.log("👋 SIGINT received. Shutting down gracefully...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  catchAsync,
  handleValidationErrors,
  setupUnhandledErrorHandlers,
  logError,
};
