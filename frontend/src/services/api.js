// Axios instance configured for API requests with interceptors

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000, // 35s — accounts for Render free tier cold start (~30s wake-up time)
  withCredentials: true, // Required for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // For session-based auth, cookies are sent automatically
    return config;
  },
  (error) => {
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

      // Handle specific status codes (silent handling)
      switch (error.response.status) {
        case 401:
        case 403:
        case 404:
        case 429:
        case 500:
          // These are handled by the error object returned
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Request made but no response received (network error, CORS, etc.)
      errorMessage = "Cannot connect to server. Please check your internet connection.";
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
