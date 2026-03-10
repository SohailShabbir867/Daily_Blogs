/**
 * Manual email verification script
 * Use when a user is stuck unverified due to email sending failure.
 *
 * Run: node scripts/verifyUser.js shabbirsohail33@gmail.com
 */

require("dotenv").config();
const mongoose = require("mongoose");

const email = process.argv[2];

if (!email) {
    console.error("Usage: node scripts/verifyUser.js <email>");
    process.exit(1);
}

async function verifyUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected");

        const result = await mongoose.connection.db.collection("users").updateOne(
            { email: email.toLowerCase() },
            {
                $set: { isEmailVerified: true },
                $unset: { emailVerificationToken: "", emailVerificationExpires: "" },
            }
        );

        if (result.matchedCount === 0) {
            console.error(`❌ No user found with email: ${email}`);
        } else if (result.modifiedCount === 0) {
            console.log(`ℹ️  User ${email} was already verified.`);
        } else {
            console.log(`✅ User ${email} is now verified — they can log in.`);
        }
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

verifyUser();
