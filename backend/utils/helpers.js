// Helper utilities: formatting, validation, and transformation functions

// Generate a URL-friendly slug from text
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+/, "") // Remove leading hyphens
    .replace(/-+$/, "") // Remove trailing hyphens
    .substring(0, 50); // Limit length
};

// Capitalize first letter of each word
const capitalizeWords = (text) => {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Truncate text to specified length with ellipsis
const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// Check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// Check if email is valid
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Format date to human-readable string
const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(date).toLocaleDateString("en-US", {
    ...defaultOptions,
    ...options,
  });
};

// Get relative time string (e.g., "2 hours ago")
const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      const plural = count !== 1 ? "s" : "";
      return `${count} ${interval.label}${plural} ago`;
    }
  }

  return "just now";
};

// Parse pagination parameters from request query
const parsePaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Build pagination metadata for response
const buildPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    itemsPerPage: limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

// Build standardized success response
const buildSuccessResponse = (data, message = "Success", meta = {}) => {
  return {
    success: true,
    message,
    data,
    ...meta,
  };
};

// Build standardized error response
const buildErrorResponse = (message, code = "ERROR", details = {}) => {
  return {
    success: false,
    error: {
      message,
      code,
      ...details,
    },
  };
};

// Remove undefined/null properties from object
const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null)
  );
};

// Pick specific properties from object
const pickProperties = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj.hasOwnProperty(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

// Omit specific properties from object
const omitProperties = (obj, keys) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key))
  );
};

// Wrap async route handlers to catch errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Sleep for specified milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  generateSlug,
  capitalizeWords,
  truncateText,
  isValidObjectId,
  isValidEmail,
  sanitizeInput,
  formatDate,
  getRelativeTime,
  parsePaginationParams,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
  cleanObject,
  pickProperties,
  omitProperties,
  asyncHandler,
  sleep,
};
