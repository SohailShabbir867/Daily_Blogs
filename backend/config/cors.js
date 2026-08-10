// CORS Configuration - Cross-Origin Resource Sharing settings for the API

const cors = require("cors");

const createCorsConfig = () => {
  const defaultOrigins = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174";
  const allowedOrigins = (process.env.CORS_ORIGIN || defaultOrigins)
    .split(",")
    .map((origin) => origin.trim());

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      // Allow localhost, 127.0.0.1, and local network IPs in development
      if (process.env.NODE_ENV === "development") {
        // Allow localhost and 127.0.0.1
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
          return callback(null, true);
        }
        // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const localNetworkRegex = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/;
        if (localNetworkRegex.test(origin)) {
          return callback(null, true);
        }
      }
      // Allow ngrok URLs for testing
      if (origin.includes("ngrok") || origin.includes("ngrok-free.app")) {
        return callback(null, true);
      }
      // Allow all Vercel deployments from this project's team.
      // Every preview URL ends with the constant team suffix: sohail-shabbirs-projects-f49a5b68.vercel.app
      if (
        origin.endsWith(".vercel.app") &&
        (origin.includes("daily-blogs") || origin.endsWith("-f49a5b68.vercel.app"))
      ) {
        return callback(null, true);
      }
      // Allow production custom domains
      if (
        origin === "https://blog.developersohail.online" ||
        origin === "https://developersohail.online" ||
        origin === "https://www.developersohail.online" ||
        origin === "https://dailyblogs.website" ||
        origin === "https://www.dailyblogs.website"
      ) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
        console.warn(`   Allowed origins: ${allowedOrigins.join(", ")}`);
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
