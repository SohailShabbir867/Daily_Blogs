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
    // You can add auth tokens or other headers here if needed
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
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    // Handle specific status codes
    if (error.response) {
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
    }

    // Create a standardized error object
    const customError = {
      message: errorMessage,
      status: error.response?.status,
      code:
        error.response?.data?.error?.code ||
        error.response?.data?.details?.code,
      details: error.response?.data?.details,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(customError);
  }
);

export default api;
export { API_BASE_URL };
