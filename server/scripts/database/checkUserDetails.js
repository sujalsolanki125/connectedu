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

const checkUserDetails = async () => {
  try {
    await connectDB();

    console.log('\n🔍 Checking User Details...\n');

    // Check student account
    const student = await User.findOne({ email: 'sujalkumarofficial2005@gmail.com' });
    if (student) {
      console.log('✅ STUDENT ACCOUNT FOUND:');
      console.log(`   Name: ${student.name}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   ID: ${student._id}`);
      console.log(`   Role: ${student.role}`);
      console.log('');
    } else {
      console.log('❌ Student account NOT found!\n');
    }

    // Check alumni account
    const alumni = await User.findOne({ email: 'gamerytsujal001@gmail.com' });
    if (alumni) {
      console.log('✅ ALUMNI ACCOUNT FOUND:');
      console.log(`   Name: ${alumni.name}`);
      console.log(`   Email: ${alumni.email}`);
      console.log(`   ID: ${alumni._id}`);
      console.log(`   Role: ${alumni.role}`);
      console.log(`   Workshops: ${alumni.workshops?.length || 0}`);
      
      if (alumni.workshops && alumni.workshops.length > 0) {
        console.log('\n   📚 Workshops Created:');
        alumni.workshops.forEach((w, i) => {
          console.log(`   ${i + 1}. ${w.title}`);
          console.log(`      ID: ${w._id}`);
          console.log(`      Bookings: ${w.bookings?.length || 0}`);
          
          if (w.bookings && w.bookings.length > 0) {
            console.log('      Students who booked:');
            w.bookings.forEach((b, j) => {
              console.log(`         ${j + 1}. ${b.studentName} (${b.studentEmail})`);
              console.log(`            Student ID: ${b.studentId}`);
              console.log(`            Status: ${b.status}`);
            });
          }
          console.log('');
        });
      }
    } else {
      console.log('❌ Alumni account NOT found!\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔑 KEY POINT:');
    console.log('   - Student email: sujalkumarofficial2005@gmail.com');
    console.log('   - Student should login and see bookings');
    console.log('   - Alumni email: gamerytsujal001@gmail.com');
    console.log('   - Alumni created workshop and accepted requests\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkUserDetails();
