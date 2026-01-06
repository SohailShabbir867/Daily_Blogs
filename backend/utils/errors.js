// Custom error classes for consistent API error handling with HTTP status codes

// Base class for all API errors
class ApiError extends Error {
  constructor(message, statusCode, code = "API_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
      },
    };
  }
}

// 400 Bad Request
class BadRequestError extends ApiError {
  constructor(message = "Bad request", code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

// 401 Unauthorized
class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required", code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

// 403 Forbidden
class ForbiddenError extends ApiError {
  constructor(message = "Access denied", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

// 404 Not Found
class NotFoundError extends ApiError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

// 409 Conflict
class ConflictError extends ApiError {
  constructor(message = "Resource conflict", code = "CONFLICT") {
    super(message, 409, code);
  }
}

// 422 Validation Error
class ValidationError extends ApiError {
  constructor(message = "Validation failed", errors = []) {
    super(message, 422, "VALIDATION_ERROR");
    this.errors = errors;
  }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        errors: this.errors,
        timestamp: this.timestamp,
      },
    };
  }
}

// 429 Rate Limit Exceeded
class RateLimitError extends ApiError {
  constructor(
    message = "Too many requests. Please try again later.",
    retryAfter = 60
  ) {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.retryAfter = retryAfter;
  }
}

// 500 Internal Server Error
class InternalServerError extends ApiError {
  constructor(message = "An unexpected error occurred") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}

// 503 Service Unavailable
class ServiceUnavailableError extends ApiError {
  constructor(message = "Service temporarily unavailable") {
    super(message, 503, "SERVICE_UNAVAILABLE");
  }
}

// Factory function to create NotFoundError for a specific resource
const createNotFoundError = (resource, identifier) => {
  return new NotFoundError(`${resource} with ID '${identifier}' not found`);
};

// Factory function to create ValidationError from express-validator results
const createValidationError = (validationErrors) => {
  const errors = validationErrors.map((err) => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value,
  }));

  return new ValidationError("Validation failed", errors);
};

module.exports = {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  createNotFoundError,
  createValidationError,
};
