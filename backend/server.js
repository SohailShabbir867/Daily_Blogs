// Daily Blogs API Server
require("dotenv").config();

// Fix Node.js c-ares DNS resolution for MongoDB Atlas SRV records
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

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
        connectSrc: [
          "'self'",
          "http://localhost:*",
          "ws://localhost:*",
          "http://192.168.1.*:*",
          "ws://192.168.1.*:*",
          // Allow the deployed frontend to connect in production
          ...(process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
            : []),
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        ...(NODE_ENV === "production" && {
          upgradeInsecureRequests: [],
        }),
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts:
      NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    noSniff: true,
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
      // ... (keep existing validation logic)
      throw new Error("MONGODB_URI contains placeholder <db_password>");
    }

    await database.connect();
    console.log("✅ MongoDB connected\n");

    const sessionMiddleware = createSessionConfig();

    // Setup HTTP Server
    const http = require("http");
    const server = http.createServer(app);

    // Setup Socket.io
    const { Server } = require("socket.io");
    // Build allowed Socket.io origins from CORS_ORIGIN env var
    const socketOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      ...(process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
        : []),
    ];

    const io = new Server(server, {
      cors: {
        origin: socketOrigins,
        credentials: true,
        methods: ["GET", "POST"],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Share io instance with express
    app.set("io", io);

    // Socket connection handler
    io.on("connection", (socket) => {
      // console.log("Socket connected:", socket.id);

      // Join user to their own room for personal notifications
      socket.on("join_user_room", (userId) => {
        if (userId) {
          socket.join(userId);
          // console.log(`User ${userId} joined their personal room`);
        }
      });

      // Join conversation room
      socket.on("join_chat", (conversationId) => {
        if (conversationId) {
          socket.join(conversationId);
          // console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
        }
      });

      // Leave conversation room
      socket.on("leave_chat", (conversationId) => {
        if (conversationId) {
          socket.leave(conversationId);
        }
      });

      // Typing indicators
      socket.on("typing", ({ conversationId, userId }) => {
        socket.to(conversationId).emit("user_typing", { conversationId, userId });
      });

      socket.on("stop_typing", ({ conversationId, userId }) => {
        socket.to(conversationId).emit("user_stop_typing", { conversationId, userId });
      });

      socket.on("disconnect", () => {
        // console.log("Socket disconnected:", socket.id);
      });
    });

    // Register routes
    app.use(sessionMiddleware);
    console.log("✅ Session middleware configured");

    app.use("/api", apiRoutes);
    console.log("✅ API routes configured");

    app.use(notFoundHandler);
    app.use(errorHandler);

    server.listen(PORT, '0.0.0.0', () => {
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
