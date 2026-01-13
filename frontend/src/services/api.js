// Axios instance configured for API requests with interceptors

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Required for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Debug: Log requests to auth endpoints
    if (config.url?.includes('/auth/')) {
      console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, {
        withCredentials: config.withCredentials,
        baseURL: config.baseURL,
      });
    }
    // For session-based auth, cookies are sent automatically
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return the data directly for convenience
    return response.data;
  },
  (error) => {
    // Handle common errors
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data;

      // Extract message from response
      errorMessage = responseData?.message ||
        responseData?.error?.message ||
        error.message ||
        "An unexpected error occurred";

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - session expired
          console.warn("Session expired or unauthorized");
          // Optionally trigger logout or redirect
          break;
        case 403:
          // Forbidden
          console.warn("Access forbidden");
          break;
        case 404:
          // Not found
          console.warn("Resource not found");
          break;
        case 429:
          // Rate limited
          console.warn("Rate limit exceeded");
          break;
        case 500:
          // Server error
          console.error("Server error");
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Request made but no response received (network error, CORS, etc.)
      errorMessage = "Cannot connect to server. Please make sure the backend server is running on http://localhost:5000";
      console.error("Network error - Server not responding:", error.message);
      console.error("Request details:", {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      });
    } else {
      // Error setting up request
      errorMessage = error.message || "An unexpected error occurred";
    }

    // Create a standardized error object
    const customError = {
      message: errorMessage,
      status: error.response?.status,
      code:
        error.response?.data?.code ||
        error.response?.data?.error?.code,
      details: error.response?.data?.details || error.response?.data,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(customError);
  }
);

export default api;
export { API_BASE_URL };
