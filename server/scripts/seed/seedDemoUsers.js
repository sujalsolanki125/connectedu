const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  profile: {
    bio: String,
    company: String,
    position: String,
  },
});

const User = mongoose.model('User', userSchema);

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Demo users
    const demoUsers = [
      {
        name: 'Student Demo',
        email: 'student@test.com',
        password: hashedPassword,
        role: 'student',
        profile: {
          bio: 'I am a student looking for placement guidance',
        },
      },
      {
        name: 'Alumni Demo',
        email: 'alumni@test.com',
        password: hashedPassword,
        role: 'alumni',
        profile: {
          bio: 'Software Engineer with 5 years of experience',
          company: 'Google',
          position: 'Senior Software Engineer',
        },
      },
      {
        name: 'Admin Demo',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        profile: {
          bio: 'Platform Administrator',
        },
      },
    ];

    // Check if users already exist and only create if they don't
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
      } else {
        await User.create(userData);
        console.log(`✓ Created user: ${userData.email}`);
      }
    }

    console.log('\n✅ Demo users seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Student:');
    console.log('  Email: student@test.com');
    console.log('  Password: 123456');
    console.log('\nAlumni:');
    console.log('  Email: alumni@test.com');
    console.log('  Password: 123456');
    console.log('\nAdmin:');
    console.log('  Email: admin@test.com');
    console.log('  Password: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
