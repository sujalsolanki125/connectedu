require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

async function deleteTestUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete users with @test.com email
    const result = await User.deleteMany({ 
      email: { $regex: /@test\.com$/i } 
    });

    console.log('\n=== Test Users Deleted ===');
    console.log(`Deleted ${result.deletedCount} test user(s)`);
    console.log('✅ Database cleanup complete!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteTestUsers();
