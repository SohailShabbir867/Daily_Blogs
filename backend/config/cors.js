// CORS Configuration - Cross-Origin Resource Sharing settings for the API

const cors = require("cors");

const createCorsConfig = () => {
  const defaultOrigins = "http://localhost:5173,http://localhost:5174";
  const allowedOrigins = (process.env.CORS_ORIGIN || defaultOrigins)
    .split(",")
    .map((origin) => origin.trim());

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      // Allow ngrok URLs for testing
      if (origin.includes("ngrok") || origin.includes("ngrok-free.app")) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: process.env.CORS_CREDENTIALS !== "false",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-CSRF-Token",
      "ngrok-skip-browser-warning",
    ],
    exposedHeaders: ["X-Total-Count", "X-Page", "X-Per-Page", "X-Total-Pages"],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  return cors(corsOptions);
};

module.exports = createCorsConfig;
