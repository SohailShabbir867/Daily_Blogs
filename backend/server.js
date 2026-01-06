// Daily Blogs API Server
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");

const database = require("./config/database");
const { createSessionConfig } = require("./config/session");
const createCorsConfig = require("./config/cors");
const apiRoutes = require("./routes");
const {
  errorHandler,
  notFoundHandler,
  setupUnhandledErrorHandlers,
} = require("./middleware/errorHandler");
const { defaultLimiter } = require("./middleware/rateLimiter");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "http://localhost:*"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: NODE_ENV === "production" ? [] : null,
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts:
      NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    noSniff: true,
    xssFilter: true,
  })
);

app.use(createCorsConfig());
app.use(mongoSanitize());
app.use("/api", defaultLimiter);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET || "cookie-secret"));
app.use(compression());

// Logging
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { skip: (req, res) => res.statusCode < 400 }));
}

// Session and routes setup after DB connection
const setupSessionAndRoutes = (sessionMiddleware) => {
  app.use(sessionMiddleware);
  console.log("✅ Session middleware configured");
  app.use("/api", apiRoutes);
  console.log("✅ API routes configured");
};

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Daily Blogs API Server",
    version: "1.0.0",
    environment: NODE_ENV,
  });
});

// Initialize and start the server
const startServer = async () => {
  try {
    console.log("\n🚀 Starting Daily Blogs Server...\n");

    await database.connect();
    console.log("✅ MongoDB connected\n");

    const sessionMiddleware = createSessionConfig();
    setupSessionAndRoutes(sessionMiddleware);

    app.use(notFoundHandler);
    app.use(errorHandler);

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📍 Environment: ${NODE_ENV}\n`);
    });

    setupUnhandledErrorHandlers(server);

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down...`);
      server.close(async () => {
        await database.gracefulShutdown(signal);
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 30000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
