/**
 * Setup Super Admin Script
 * Creates or updates the super admin user
 *
 * Run: node scripts/setupSuperAdmin.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SUPER_ADMIN = {
  email: process.env.SUPER_ADMIN_EMAIL || "shabbirsohail33@gmail.com",
  password: "Sohail123#",
  name: "Super Admin",
};

async function setupSuperAdmin() {
  try {
    // Connect to MongoDB
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get the User model (import after connection)
    const User = require("../models/User");

    // Check if super admin exists
    let superAdmin = await User.findOne({
      email: SUPER_ADMIN.email.toLowerCase(),
    });

    if (superAdmin) {
      // Update existing user to super admin
      console.log("🔄 User exists, updating to Super Admin...");

      // Hash the new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN.password, salt);

      await User.updateOne(
        { email: SUPER_ADMIN.email.toLowerCase() },
        {
          $set: {
            role: "admin",
            isSuperAdmin: true,
            password: hashedPassword,
            isActive: true,
          },
        }
      );

      console.log("✅ Super Admin updated successfully!");
    } else {
      // Create new super admin
      console.log("🔄 Creating new Super Admin...");

      superAdmin = new User({
        name: SUPER_ADMIN.name,
        email: SUPER_ADMIN.email.toLowerCase(),
        password: SUPER_ADMIN.password,
        role: "admin",
        isSuperAdmin: true,
        isActive: true,
        isEmailVerified: true,
      });

      await superAdmin.save();
      console.log("✅ Super Admin created successfully!");
    }

    console.log("\n========================================");
    console.log("🎉 Super Admin Setup Complete!");
    console.log("========================================");
    console.log(`Email: ${SUPER_ADMIN.email}`);
    console.log(`Password: ${SUPER_ADMIN.password}`);
    console.log("========================================\n");

    // Verify the super admin was created/updated correctly
    const verifyUser = await User.findOne({
      email: SUPER_ADMIN.email.toLowerCase(),
    });
    console.log("📋 Verification - User in database:");
    console.log(`   - Name: ${verifyUser.name}`);
    console.log(`   - Email: ${verifyUser.email}`);
    console.log(`   - Role: ${verifyUser.role}`);
    console.log(`   - isSuperAdmin: ${verifyUser.isSuperAdmin}`);
    console.log(`   - isActive: ${verifyUser.isActive}`);
  } catch (error) {
    console.error("❌ Error setting up Super Admin:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

setupSuperAdmin();
