// Test MongoDB Connection
// Run this to diagnose MongoDB connection issues
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('\\n========================================');
        console.log('MongoDB Connection Test');
        console.log('========================================\\n');

        // Show connection string (hide password)
        const uri = process.env.MONGODB_URI;
        const maskedUri = uri.replace(/:[^:@]+@/, ':****@');
        console.log('Connection URI:', maskedUri);
        console.log('');

        console.log('🔄 Attempting to connect...');
        console.log('   (This may take up to 30 seconds)\\n');

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000,
        });

        console.log('✅ SUCCESS! MongoDB Connected!');
        console.log('📦 Database:', mongoose.connection.db.databaseName);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('');
        console.log('Your MongoDB connection is working correctly!');
        console.log('You can now start the server with: npm run dev');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.log('\\n❌ CONNECTION FAILED!\\n');
        console.error('Error:', error.message);
        console.log('');
        console.log('========================================');
        console.log('Common Solutions:');
        console.log('========================================\\n');
        console.log('1. WHITELIST YOUR IP ADDRESS');
        console.log('   → Go to: https://cloud.mongodb.com/');
        console.log('   → Click: Network Access > Add IP Address');
        console.log('   → Choose: "Allow Access from Anywhere" (0.0.0.0/0)');
        console.log('   → Wait: 1-2 minutes for changes to apply\\n');

        console.log('2. VERIFY CREDENTIALS');
        console.log('   → Username: mahar');
        console.log('   → Password: mahar');
        console.log('   → Check MongoDB Atlas > Database Access\\n');

        console.log('3. CHECK CLUSTER STATUS');
        console.log('   → Ensure cluster is not paused');
        console.log('   → Go to: Clusters in MongoDB Atlas\\n');

        console.log('4. NETWORK ISSUES');
        console.log('   → Disable VPN if you have one');
        console.log('   → Check firewall settings');
        console.log('   → Try different network (mobile hotspot)\\n');

        console.log('========================================\\n');

        await mongoose.connection.close().catch(() => { });
        process.exit(1);
    }
}

console.log('Starting MongoDB connection test...');
testConnection();
