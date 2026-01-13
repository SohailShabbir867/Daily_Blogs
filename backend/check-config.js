require('dotenv').config();

console.log('ðŸ” Checking server configuration...\n');

const issues = [];

// Check MongoDB URI
if (!process.env.MONGODB_URI) {
  issues.push('âŒ MONGODB_URI is not set');
} else if (process.env.MONGODB_URI.includes('<db_password>')) {
  issues.push('âŒ MONGODB_URI contains <db_password> placeholder - MUST BE REPLACED');
}

// Check SESSION_SECRET
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.includes('your_super_secret')) {
  issues.push('âš ï¸ SESSION_SECRET is using default value (OK for development)');
}

// Check SMTP
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  issues.push('âš ï¸ SMTP credentials not configured (email features will be disabled)');
}

if (issues.length === 0) {
  console.log('âœ… All configuration looks good!');
  process.exit(0);
} else {
  console.log('Found the following issues:\n');
  issues.forEach(issue => console.log('  ' + issue));
  console.log('\n');
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('<db_password>')) {
    console.log('ðŸš¨ CRITICAL: Server will crash until MongoDB password is configured!');
    console.log('\nTo fix:');
    console.log('1. Open: daily-blogs\\backend\\.env');
    console.log('2. Find: MONGODB_URI=mongodb+srv://mahar:<db_password>@...');
    console.log('3. Replace <db_password> with your actual MongoDB password');
    console.log('4. Save and restart the server\n');
  }
  process.exit(1);
}
