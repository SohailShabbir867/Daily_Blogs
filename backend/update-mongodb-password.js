// Helper script to update MongoDB password in .env file
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

console.log('\n🔧 MongoDB Password Updater\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('This script will help you update the MongoDB password in your .env file.');
console.log('\n📝 IMPORTANT:');
console.log('   - This is your MongoDB Atlas DATABASE password (not your Google App password)');
console.log('   - If you don\'t know it, you can reset it in MongoDB Atlas:');
console.log('     1. Go to https://cloud.mongodb.com');
console.log('     2. Navigate to: Database Access → Select user "mahar" → Edit → Reset Password');
console.log('     3. Copy the new password');
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

rl.question('Enter your MongoDB Atlas password: ', (password) => {
  if (!password || password.trim() === '') {
    console.error('\n❌ Password cannot be empty!');
    rl.close();
    process.exit(1);
  }

  try {
    // Read the .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if password placeholder exists
    if (!envContent.includes('<db_password>')) {
      console.log('\n⚠️  No password placeholder found. The password might already be set.');
      rl.question('Do you want to update it anyway? (y/n): ', (answer) => {
        if (answer.toLowerCase() !== 'y') {
          console.log('\n❌ Update cancelled.');
          rl.close();
          process.exit(0);
        }
        updatePassword(envContent, password.trim());
      });
    } else {
      updatePassword(envContent, password.trim());
    }
  } catch (error) {
    console.error('\n❌ Error reading .env file:', error.message);
    rl.close();
    process.exit(1);
  }
});

function updatePassword(envContent, password) {
  try {
    // Escape special characters in password for URL encoding
    const encodedPassword = encodeURIComponent(password);
    
    // Replace the placeholder
    const updatedContent = envContent.replace(
      /MONGODB_URI=mongodb\+srv:\/\/mahar:<db_password>@/g,
      `MONGODB_URI=mongodb+srv://mahar:${encodedPassword}@`
    );
    
    // Write back to file
    fs.writeFileSync(envPath, updatedContent, 'utf8');
    
    console.log('\n✅ MongoDB password updated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your server (nodemon should auto-restart)');
    console.log('   2. The server should now connect to MongoDB');
    console.log('\n');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Error updating .env file:', error.message);
    rl.close();
    process.exit(1);
  }
}
