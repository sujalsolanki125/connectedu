const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixAdmin = async () => {
  try {
    // Connect to MongoDB with longer timeout
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('\n✅ MongoDB Connected\n');
    console.log('='.repeat(60));

    const adminEmail = 'connected.platform1250@gmail.com';
    const adminPassword = '@Sujalconnected1250';

    // Access users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find the user
    const existingUser = await usersCollection.findOne({ email: adminEmail });

    if (!existingUser) {
      console.log('❌ User not found in database!');
      console.log('\n💡 Creating new admin user...\n');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Insert new admin
      await usersCollection.insertOne({
        name: 'ConnectEd Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isProfileComplete: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          resume: {},
          categoryRatings: {
            knowledge: 0,
            communication: 0,
            helpfulness: 0,
            punctuality: 0
          }
        }
      });
      
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ User found!');
      console.log('\nCurrent details:');
      console.log('  Name:', existingUser.name);
      console.log('  Email:', existingUser.email);
      console.log('  Role:', existingUser.role);
      
      console.log('\n🔄 Updating to admin with new password...\n');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Update user
      await usersCollection.updateOne(
        { email: adminEmail },
        {
          $set: {
            password: hashedPassword,
            role: 'admin',
            isProfileComplete: true,
            name: 'ConnectEd Admin',
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Admin account updated successfully!');
    }

    // Verify the update
    const updatedUser = await usersCollection.findOne({ email: adminEmail });
    console.log('\n📝 VERIFIED ADMIN DETAILS:');
    console.log('='.repeat(60));
    console.log('Name:', updatedUser.name);
    console.log('Email:', updatedUser.email);
    console.log('Role:', updatedUser.role);
    console.log('Profile Complete:', updatedUser.isProfileComplete);
    console.log('Password Hash:', updatedUser.password.substring(0, 30) + '...');
    
    // Test password
    const passwordMatch = await bcrypt.compare(adminPassword, updatedUser.password);
    console.log('\n🔐 Password Verification:', passwordMatch ? '✅ SUCCESS' : '❌ FAILED');
    
    console.log('\n🎉 SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📧 Login at: http://localhost:3000/login');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
    process.exit(0);
  }
};

fixAdmin();
