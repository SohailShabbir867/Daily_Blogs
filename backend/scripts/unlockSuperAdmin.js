// Unlock Super Admin Account
// This script resets login attempts and removes account lock

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const unlockSuperAdmin = async () => {
    try {
        console.log("🔓 Unlocking Super Admin Account...\n");

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB\n");

        // Find super admin user
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "";

        if (!superAdminEmail) {
            console.error("❌ SUPER_ADMIN_EMAIL not set in .env file");
            process.exit(1);
        }

        const user = await User.findOne({
            email: superAdminEmail.toLowerCase()
        }).select("+loginAttempts +lockUntil");

        if (!user) {
            console.error(`❌ Super admin user not found: ${superAdminEmail}`);
            process.exit(1);
        }

        console.log("👤 Found user:", user.email);
        console.log("📊 Current status:");
        console.log(`   - Login Attempts: ${user.loginAttempts || 0}`);
        console.log(`   - Lock Until: ${user.lockUntil || "Not locked"}`);
        console.log(`   - Is Super Admin: ${user.isSuperAdmin}`);
        console.log(`   - Role: ${user.role}`);
        console.log("");

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            console.log(`⏱️  Account is locked for ${remainingTime} more minutes\n`);
        } else if (user.loginAttempts > 0) {
            console.log(`⚠️  Account has ${user.loginAttempts} failed attempts but is not locked\n`);
        } else {
            console.log("✅ Account is not locked and has no failed attempts\n");
        }

        // Reset login attempts and remove lock
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        console.log("✅ Account unlocked successfully!");
        console.log("📊 New status:");
        console.log(`   - Login Attempts: 0`);
        console.log(`   - Lock Until: None`);
        console.log("");
        console.log("🎉 You can now login with your password!\n");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

unlockSuperAdmin();
