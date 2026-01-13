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

    // Validate environment variables before attempting connection
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined in .env file");
    }

    if (process.env.MONGODB_URI.includes("<db_password>")) {
      console.error("\n");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("🚨 CRITICAL: MongoDB password not configured!");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("");
      console.error("The server cannot start because the MongoDB password is not set.");
      console.error("");
      console.error("📝 TO FIX:");
      console.error("   1. Open: daily-blogs\\backend\\.env");
      console.error("   2. Find this line:");
      console.error("      MONGODB_URI=mongodb+srv://mahar:<db_password>@project.e5k7hmj.mongodb.net/?appName=Project");
      console.error("");
      console.error("   3. Replace <db_password> with your actual MongoDB Atlas password");
      console.error("      Example: MONGODB_URI=mongodb+srv://mahar:MyPassword123@project.e5k7hmj.mongodb.net/?appName=Project");
      console.error("");
      console.error("   4. Save the file");
      console.error("   5. Restart the server");
      console.error("");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("\n");
      throw new Error("MONGODB_URI contains placeholder <db_password>. Please replace it with your actual MongoDB Atlas password.");
    }

    await database.connect();
    console.log("✅ MongoDB connected\n");

    const sessionMiddleware = createSessionConfig();
    setupSessionAndRoutes(sessionMiddleware);

    app.use(notFoundHandler);
    app.use(errorHandler);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on:`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Network: http://<your-ip>:${PORT}`);
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
    console.error("\n❌ Failed to start server:", error.message);
    console.error("\nStack trace:", error.stack);
    console.error("\n💡 Troubleshooting tips:");
    console.error("   1. Check that all required environment variables are set in .env");
    console.error("   2. Verify MongoDB connection string is correct");
    console.error("   3. Ensure MongoDB Atlas allows connections from your IP");
    console.error("   4. Check that the port (5000) is not already in use\n");
    process.exit(1);
  }
};

startServer();

module.exports = app;
