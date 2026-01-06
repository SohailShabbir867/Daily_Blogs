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

    // Mongoose connection options
    const options = {
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket operations
      family: 4, // Use IPv4, skip trying IPv6
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

      // Retry logic
      if (this.retryCount < MAX_RETRY_ATTEMPTS) {
        this.retryCount++;
        console.log(
          `🔄 Retrying connection (${
            this.retryCount
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
