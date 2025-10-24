const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

const User = require('./models/userModel');

const verifyAndFixAdmin = async () => {
  try {
    console.log('\n🔍 CHECKING ADMIN ACCOUNT\n');
    console.log('='.repeat(60));

    const adminEmail = 'connected.platform1250@gmail.com';
    const adminPassword = '@Sujalconnected1250';

    // Find the user
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log('\n❌ Admin user not found! Creating new one...\n');
      
      // Create new admin with hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      adminUser = await User.create({
        name: 'ConnectEd Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isProfileComplete: true,
        lastLogin: new Date(),
      });

      console.log('✅ NEW ADMIN CREATED!');
    } else {
      console.log('✅ Admin user found!');
      console.log('─'.repeat(60));
      console.log('Current Details:');
      console.log('  Name:', adminUser.name);
      console.log('  Email:', adminUser.email);
      console.log('  Role:', adminUser.role);
      console.log('  Profile Complete:', adminUser.isProfileComplete);
      
      // Update to ensure it's admin with proper password
      console.log('\n🔄 Updating admin account...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      adminUser.isProfileComplete = true;
      adminUser.name = 'ConnectEd Admin';
      await adminUser.save();
      
      console.log('✅ Admin account updated!');
    }

    // Verify the password works
    console.log('\n🔐 VERIFYING PASSWORD...');
    const passwordMatch = await bcrypt.compare(adminPassword, adminUser.password);
    
    if (passwordMatch) {
      console.log('✅ Password verification SUCCESSFUL!');
    } else {
      console.log('❌ Password verification FAILED!');
    }

    console.log('\n📝 FINAL ADMIN DETAILS:');
    console.log('='.repeat(60));
    console.log('Name:', adminUser.name);
    console.log('Email:', adminUser.email);
    console.log('Password:', adminPassword);
    console.log('Role:', adminUser.role);
    console.log('Profile Complete:', adminUser.isProfileComplete);
    console.log('Password Hash:', adminUser.password.substring(0, 30) + '...');
    console.log('\n✅ You can now login at: http://localhost:3000/login');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
};

verifyAndFixAdmin();
