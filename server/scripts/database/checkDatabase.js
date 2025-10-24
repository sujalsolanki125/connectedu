const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', error.message);
    console.error('\n⚠️  Common Fixes:');
    console.error('1. Whitelist your IP in MongoDB Atlas');
    console.error('2. Check your MONGO_URI in .env file');
    console.error('3. Ensure your MongoDB cluster is active');
    console.error('\nSee MONGODB_SETUP.md for detailed instructions.\n');
    return false;
  }
};

const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
}));

const checkDatabase = async () => {
  const connected = await connectDB();
  
  if (!connected) {
    process.exit(1);
  }

  try {
    const users = await User.find({}).select('name email role createdAt');
    
    console.log('📊 Database Status Report');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Total Users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database!');
      console.log('\n📝 Next Steps:');
      console.log('Run the seeder script to create demo users:');
      console.log('  node seedDemoUsers.js\n');
    } else {
      console.log('👥 Registered Users:\n');
      
      users.forEach((user, index) => {
        const roleEmoji = user.role === 'student' ? '🎓' : user.role === 'alumni' ? '👨‍💼' : '👑';
        console.log(`${index + 1}. ${roleEmoji} ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        if (user.createdAt) {
          console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
        }
        console.log('');
      });
      
      // Check for demo accounts
      const demoEmails = ['student@test.com', 'alumni@test.com', 'admin@test.com'];
      const existingDemos = users.filter(u => demoEmails.includes(u.email));
      
      if (existingDemos.length === 3) {
        console.log('✅ All demo accounts are present!');
        console.log('\n🔐 Demo Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email: student@test.com | Password: 123456');
        console.log('Email: alumni@test.com  | Password: 123456');
        console.log('Email: admin@test.com   | Password: 123456');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        console.log('⚠️  Some demo accounts are missing!');
        console.log('\nMissing accounts:');
        demoEmails.forEach(email => {
          if (!users.find(u => u.email === email)) {
            console.log(`  - ${email}`);
          }
        });
        console.log('\nRun: node seedDemoUsers.js to create them\n');
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkDatabase();
