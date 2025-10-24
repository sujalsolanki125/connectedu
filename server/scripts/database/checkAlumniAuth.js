const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

const User = require('./models/userModel');

const checkAlumniAuth = async () => {
  try {
    console.log('\n🔍 CHECKING ALUMNI AUTHENTICATION ISSUE\n');
    console.log('='.repeat(60));

    // Find the alumni user
    const alumni = await User.findOne({ email: 'alumni@test.com' });

    if (!alumni) {
      console.log('❌ Alumni user not found!');
      console.log('Please create alumni account first.');
      process.exit(1);
    }

    console.log('\n✅ Alumni User Found:');
    console.log('─'.repeat(60));
    console.log('ID:', alumni._id);
    console.log('Name:', alumni.name);
    console.log('Email:', alumni.email);
    console.log('Role:', alumni.role);
    console.log('Profile Complete:', alumni.isProfileComplete);
    console.log('Has Google ID:', !!alumni.googleId);
    console.log('Has Password:', !!alumni.password);

    console.log('\n📊 Profile Data:');
    console.log('─'.repeat(60));
    console.log('First Name:', alumni.profile?.firstName || 'Not set');
    console.log('Last Name:', alumni.profile?.lastName || 'Not set');
    console.log('College:', alumni.profile?.collegeName || 'Not set');
    console.log('Company:', alumni.profile?.currentCompany || 'Not set');
    console.log('Position:', alumni.profile?.currentPosition || 'Not set');

    console.log('\n🎓 Alumni Features Data:');
    console.log('─'.repeat(60));
    console.log('Interview Experiences:', alumni.interviewExperiences?.length || 0);
    console.log('Workshops:', alumni.workshops?.length || 0);
    console.log('Achievements:');
    console.log('  - Total Mentees:', alumni.achievements?.totalMentees || 0);
    console.log('  - Sessions Conducted:', alumni.achievements?.sessionsConducted || 0);
    console.log('  - Resources Shared:', alumni.achievements?.resourcesShared || 0);

    console.log('\n⚠️ DIAGNOSIS:');
    console.log('─'.repeat(60));

    if (alumni.role !== 'alumni') {
      console.log('❌ ISSUE: User role is NOT "alumni"');
      console.log('   Current role:', alumni.role);
      console.log('   FIX: Update role to "alumni" in database');
    } else {
      console.log('✅ Role is correct: alumni');
    }

    if (!alumni.isProfileComplete) {
      console.log('⚠️  Profile is not complete');
      console.log('   User should complete profile first');
    } else {
      console.log('✅ Profile is complete');
    }

    console.log('\n🔐 TOKEN TEST:');
    console.log('─'.repeat(60));
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: alumni._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    console.log('Generated Test Token:');
    console.log(token);
    console.log('\nDecoded Token:');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('User ID:', decoded.id);
    console.log('Expires:', new Date(decoded.exp * 1000).toLocaleString());

    console.log('\n🧪 API TEST COMMAND:');
    console.log('─'.repeat(60));
    console.log('Test the API with this curl command:\n');
    console.log(`curl -X GET "http://localhost:5000/api/alumni-features/my-workshops" \\`);
    console.log(`  -H "Authorization: Bearer ${token}"`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnosis Complete!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

checkAlumniAuth();
