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

  // Check if MongoDB URI contains placeholder password
  if (process.env.MONGODB_URI.includes("<db_password>")) {
    throw new Error("MONGODB_URI contains placeholder <db_password>. Please replace it with your actual MongoDB Atlas password in the .env file.");
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
      // In production (HTTPS + cross-domain), cookies MUST be secure:true and sameSite:"none"
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    },
    rolling: true,
    proxy: isProduction,
  };

  console.log("📦 Session store configured with MongoDB");
  console.log(`🍪 Cookie settings:`);
  console.log(`   - maxAge: ${sessionOptions.cookie.maxAge}ms (${sessionOptions.cookie.maxAge / (1000 * 60 * 60 * 24)} days)`);
  console.log(`   - httpOnly: ${sessionOptions.cookie.httpOnly}`);
  console.log(`   - secure: ${sessionOptions.cookie.secure}`);
  console.log(`   - sameSite: ${sessionOptions.cookie.sameSite}`);
  console.log(`   - rolling: ${sessionOptions.rolling}`);

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
