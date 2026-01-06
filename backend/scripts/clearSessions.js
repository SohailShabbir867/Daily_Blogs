/**
 * Clear Sessions Script
 * Clears all sessions from the database
 *
 * Run: node scripts/clearSessions.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

async function clearSessions() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Drop the sessions collection
    const db = mongoose.connection.db;

    try {
      await db.collection("sessions").drop();
      console.log("✅ Sessions collection cleared!");
    } catch (err) {
      if (err.code === 26) {
        console.log("ℹ️  Sessions collection doesn't exist (already empty)");
      } else {
        throw err;
      }
    }

    console.log(
      "\n🎉 Done! Please restart the backend server and login again.\n"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearSessions();
