// Database Configuration - MongoDB connection with retry logic and graceful shutdown

const mongoose = require("mongoose");

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.retryCount = 0;
  }

  async connect() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    // Check if MongoDB URI contains placeholder password
    if (mongoUri.includes("<db_password>")) {
      console.error("\n");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ CRITICAL ERROR: MongoDB password not configured!");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("");
      console.error("The MONGODB_URI in your .env file contains <db_password> placeholder.");
      console.error("Please replace <db_password> with your actual MongoDB Atlas password.");
      console.error("");
      console.error("Current value:");
      console.error("  MONGODB_URI=mongodb+srv://mahar:<db_password>@project.e5k7hmj.mongodb.net/?appName=Project");
      console.error("");
      console.error("Should be:");
      console.error("  MONGODB_URI=mongodb+srv://mahar:YOUR_ACTUAL_PASSWORD@project.e5k7hmj.mongodb.net/?appName=Project");
      console.error("");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("\n");
      throw new Error("MONGODB_URI contains placeholder <db_password>. Please replace it with your actual MongoDB Atlas password in the .env file.");
    }

    // Mongoose connection options
    const options = {
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 30000, // Increased timeout for server selection (30s)
      socketTimeoutMS: 45000, // Timeout for socket operations
      family: 4, // Use IPv4, skip trying IPv6
      // DNS resolution options to help with SRV lookup issues
      directConnection: false,
    };

    try {
      console.log("🔄 Attempting to connect to MongoDB...");

      await mongoose.connect(mongoUri, options);

      this.isConnected = true;
      this.retryCount = 0;

      console.log("✅ MongoDB connected successfully");
      console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
    } catch (error) {
      console.error("❌ MongoDB connection error:", error.message);

      // Check for DNS timeout error and provide specific guidance
      if (error.message.includes("ETIMEOUT") || error.message.includes("queryTxt")) {
        console.error("\n");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("🔧 DNS RESOLUTION ERROR DETECTED");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("");
        console.error("Your DNS server cannot resolve MongoDB Atlas addresses.");
        console.error("");
        console.error("QUICK FIX - Change DNS to Google DNS:");
        console.error("  1. Press Win+R, type 'ncpa.cpl', press Enter");
        console.error("  2. Right-click your network adapter > Properties");
        console.error("  3. Select 'Internet Protocol Version 4 (TCP/IPv4)' > Properties");
        console.error("  4. Set DNS servers to: 8.8.8.8 and 8.8.4.4");
        console.error("  5. Run 'ipconfig /flushdns' in Command Prompt");
        console.error("  6. Restart this server");
        console.error("");
        console.error("See FIX-DNS-ISSUE.md for more solutions.");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("\n");
      }

      // Retry logic
      if (this.retryCount < MAX_RETRY_ATTEMPTS) {
        this.retryCount++;
        console.log(
          `🔄 Retrying connection (${this.retryCount
          }/${MAX_RETRY_ATTEMPTS}) in ${RETRY_DELAY_MS / 1000}s...`
        );

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return this.connect();
      }

      throw new Error(
        `Failed to connect to MongoDB after ${MAX_RETRY_ATTEMPTS} attempts`
      );
    }
  }

  setupEventHandlers() {
    const db = mongoose.connection;

    // Connection successful
    db.on("connected", () => {
      console.log("📡 Mongoose connected to database");
      this.isConnected = true;
    });

    // Connection error
    db.on("error", (error) => {
      console.error("❌ Mongoose connection error:", error.message);
      this.isConnected = false;
    });

    // Disconnected
    db.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected from database");
      this.isConnected = false;
    });

    // Reconnected
    db.on("reconnected", () => {
      console.log("🔄 Mongoose reconnected to database");
      this.isConnected = true;
    });

    // Handle application termination
    process.on("SIGINT", this.gracefulShutdown.bind(this, "SIGINT"));
    process.on("SIGTERM", this.gracefulShutdown.bind(this, "SIGTERM"));
  }

  async gracefulShutdown(signal) {
    try {
      console.log(`\n🛑 ${signal} received. Closing MongoDB connection...`);

      await mongoose.connection.close();

      console.log("✅ MongoDB connection closed gracefully");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during graceful shutdown:", error.message);
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  getConnection() {
    return mongoose.connection;
  }
}

// Export singleton instance
module.exports = new DatabaseConnection();
