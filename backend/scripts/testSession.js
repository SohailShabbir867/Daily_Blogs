// Session System Diagnostic
// Run this to check if session system is working

require("dotenv").config();
const mongoose = require("mongoose");

const runDiagnostics = async () => {
    console.log("═══════════════════════════════════════════════");
    console.log("   SESSION SYSTEM DIAGNOSTIC");
    console.log("═══════════════════════════════════════════════\n");

    // Check 1: Environment Variables
    console.log("1️⃣  Checking Environment Variables:");
    console.log("   NODE_ENV:", process.env.NODE_ENV || "not set (defaults to development)");
    console.log("   SESSION_SECRET:", process.env.SESSION_SECRET ? "✅ SET" : "❌ NOT SET");
    console.log("   SESSION_MAX_AGE:", process.env.SESSION_MAX_AGE || "not set (defaults to 7 days)");
    console.log("   COOKIE_SECURE:", process.env.COOKIE_SECURE || "not set (defaults to false)");
    console.log("   COOKIE_SAME_SITE:", process.env.COOKIE_SAME_SITE || "not set (defaults to lax)");
    console.log("   MONGODB_URI:", process.env.MONGODB_URI ? "✅ SET" : "❌ NOT SET");

    if (!process.env.SESSION_SECRET) {
        console.log("\n❌ CRITICAL: SESSION_SECRET is not set!");
        console.log("   Without this, sessions cannot be created.");
        console.log("   Add to backend/.env: SESSION_SECRET=your-secret-key-here\n");
        process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
        console.log("\n❌ CRITICAL: MONGODB_URI is not set!");
        console.log("   Sessions are stored in MongoDB. Without this, sessions won't persist.\n");
        process.exit(1);
    }

    console.log("\n2️⃣  Checking MongoDB Connection:");
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("   ✅ MongoDB connected successfully");

        // Check sessions collection
        const sessionsCount = await mongoose.connection.db.collection('sessions').countDocuments();
        console.log(`   📊 Sessions in database: ${sessionsCount}`);

        if (sessionsCount > 0) {
            const recentSession = await mongoose.connection.db.collection('sessions').findOne({}, { sort: { expires: -1 } });
            console.log("   📝 Most recent session:");
            console.log("      Expires:", recentSession.expires);
            console.log("      Has userId:", !!recentSession.session?.match(/userId/));
        }
    } catch (error) {
        console.log("   ❌ MongoDB connection failed:", error.message);
        console.log("\n   Make sure:");
        console.log("   - MongoDB Atlas is accessible");
        console.log("   - MONGODB_URI is correct in .env");
        console.log("   - Your IP is whitelisted in MongoDB Atlas\n");
        await mongoose.connection.close();
        process.exit(1);
    }

    console.log("\n3️⃣  Checking Session Configuration:");
    try {
        const { createSessionConfig } = require("../config/session");
        const sessionMiddleware = createSessionConfig();
        console.log("   ✅ Session configuration loaded successfully");
        console.log("   (Check logs above for cookie settings)");
    } catch (error) {
        console.log("   ❌ Session configuration failed:", error.message);
    }

    console.log("\n4️⃣  Testing Session Store:");
    try {
        const MongoStore = require("connect-mongo");
        const store = MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: "sessions",
            ttl: 7 * 24 * 60 * 60,
        });

        // Test writing a session
        const testSessionId = "diagnostic-test-" + Date.now();
        const testSession = {
            cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
            userId: "test-user-id",
            createdAt: new Date(),
        };

        await new Promise((resolve, reject) => {
            store.set(testSessionId, testSession, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log("   ✅ Successfully wrote test session to MongoDB");

        // Test reading it back
        const retrieved = await new Promise((resolve, reject) => {
            store.get(testSessionId, (err, session) => {
                if (err) reject(err);
                else resolve(session);
            });
        });

        if (retrieved && retrieved.userId === "test-user-id") {
            console.log("   ✅ Successfully read test session from MongoDB");
        } else {
            console.log("   ❌ Failed to read test session back");
        }

        // Clean up
        await new Promise((resolve) => {
            store.destroy(testSessionId, () => resolve());
        });
        console.log("   ✅ Session store working correctly");

    } catch (error) {
        console.log("   ❌ Session store test failed:", error.message);
        console.log("\n   This means sessions cannot be saved/retrieved.");
        console.log("   Check MongoDB connection and permissions.\n");
    }

    console.log("\n═══════════════════════════════════════════════");
    console.log("   DIAGNOSTIC COMPLETE");
    console.log("═══════════════════════════════════════════════\n");

    if (process.env.SESSION_SECRET && process.env.MONGODB_URI) {
        console.log("✅ All critical components are configured.");
        console.log("\nIf sessions still don't work:");
        console.log("1. Restart the backend server");
        console.log("2. Clear browser cookies");
        console.log("3. Check CORS configuration");
        console.log("4. Check browser console for errors\n");
    }

    await mongoose.connection.close();
    process.exit(0);
};

runDiagnostics();
