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

const createAdminUser = async () => {
  try {
    console.log('\n🔧 CREATING ADMIN USER\n');
    console.log('='.repeat(60));

    const adminEmail = 'connected.platform1250@gmail.com';
    const adminPassword = '@Sujalconnected1250';
    const adminName = 'Admin';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('─'.repeat(60));
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Name:', existingAdmin.name);
      console.log('Profile Complete:', existingAdmin.isProfileComplete);
      
      // Update password if needed
      console.log('\n🔄 Updating admin password...');
      existingAdmin.password = adminPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isProfileComplete = true;
      await existingAdmin.save();
      console.log('✅ Admin password updated successfully!');
    } else {
      // Create new admin user
      console.log('\n➕ Creating new admin user...');
      
      const adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isProfileComplete: true,
        lastLogin: new Date(),
      });

      console.log('✅ Admin user created successfully!');
      console.log('─'.repeat(60));
      console.log('ID:', adminUser._id);
      console.log('Name:', adminUser.name);
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
    }

    console.log('\n🎉 ADMIN SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📝 Admin Login Credentials:');
    console.log('─'.repeat(60));
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Login URL: http://localhost:3000/login');
    console.log('\n✅ You can now login as admin!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();
