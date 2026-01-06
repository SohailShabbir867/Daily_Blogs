// Session Configuration - Express-session with MongoDB store

const session = require("express-session");
const MongoStore = require("connect-mongo");

const createSessionConfig = () => {
  // Validate required environment variables
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI environment variable is required for session store"
    );
  }

  const isProduction = process.env.NODE_ENV === "production";

  const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    name: process.env.SESSION_NAME || "dailyblogs_sid",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
      ttl: parseInt(process.env.SESSION_MAX_AGE) / 1000 || 7 * 24 * 60 * 60,
      autoRemove: "native",
      touchAfter: 24 * 3600,
    }),
    cookie: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
      httpOnly: process.env.COOKIE_HTTP_ONLY !== "false",
      secure: isProduction || process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAME_SITE || "lax",
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
    rolling: true,
    proxy: isProduction,
  };

  console.log("📦 Session store configured with MongoDB");

  return session(sessionOptions);
};

const setupStoreErrorHandler = (store) => {
  store.on("error", (error) => {
    console.error("❌ Session store error:", error.message);
  });
};

module.exports = {
  createSessionConfig,
  setupStoreErrorHandler,
};
