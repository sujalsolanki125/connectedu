require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

async function checkTestUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find users with @test.com email
    const testUsers = await User.find({ 
      email: { $regex: /@test\.com$/i } 
    }).select('name email role createdAt');

    console.log('\n=== Test Users Found ===');
    console.log(`Total: ${testUsers.length}\n`);
    
    if (testUsers.length > 0) {
      testUsers.forEach(user => {
        console.log(`- ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Created: ${user.createdAt}`);
        console.log('');
      });

      // Ask if they should be deleted
      console.log('\n⚠️  To delete these test accounts, run:');
      console.log('node deleteTestUsers.js');
    } else {
      console.log('✅ No test users found. Database is clean!');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTestUsers();
