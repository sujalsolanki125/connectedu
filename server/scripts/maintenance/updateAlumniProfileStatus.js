const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const User = require('./models/userModel');

const updateAlumniProfileStatus = async () => {
  try {
    await connectDB();

    console.log('\n🔧 Updating all alumni users to set isProfileComplete = true...\n');

    // Update all alumni users to have isProfileComplete = true
    const result = await User.updateMany(
      { role: 'alumni' },
      { $set: { isProfileComplete: true } }
    );

    console.log(`✅ Updated ${result.modifiedCount} alumni users`);
    console.log(`📊 Total alumni matched: ${result.matchedCount}`);

    // Show all alumni users
    const allAlumni = await User.find({ role: 'alumni' }).select('name email isProfileComplete role');
    
    console.log('\n📋 All Alumni Users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    allAlumni.forEach((alumni, index) => {
      console.log(`\n${index + 1}. ${alumni.name}`);
      console.log(`   Email: ${alumni.email}`);
      console.log(`   Profile Complete: ${alumni.isProfileComplete}`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ All alumni users are now set to isProfileComplete = true');
    console.log('🔄 Please refresh your Student Dashboard to see all alumni!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating alumni profile status:', error);
    process.exit(1);
  }
};

updateAlumniProfileStatus();
