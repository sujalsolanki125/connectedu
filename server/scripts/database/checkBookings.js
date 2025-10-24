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

const checkBookings = async () => {
  try {
    await connectDB();

    console.log('\n🔍 Checking Workshop Bookings in Database...\n');

    // Find all alumni with workshops
    const alumni = await User.find({ 
      role: 'alumni', 
      'workshops.0': { $exists: true } 
    }).select('name email workshops');

    console.log(`📊 Found ${alumni.length} alumni with workshops\n`);

    let totalBookings = 0;

    alumni.forEach((alum, index) => {
      console.log(`${index + 1}. ${alum.name} (${alum.email})`);
      console.log(`   Workshops: ${alum.workshops.length}`);
      
      alum.workshops.forEach((workshop, wIndex) => {
        const bookingCount = workshop.bookings?.length || 0;
        totalBookings += bookingCount;
        
        console.log(`   ${wIndex + 1}. "${workshop.title}"`);
        console.log(`      - Workshop ID: ${workshop._id}`);
        console.log(`      - Bookings: ${bookingCount}`);
        
        if (bookingCount > 0) {
          workshop.bookings.forEach((booking, bIndex) => {
            console.log(`         ${bIndex + 1}. Student ID: ${booking.studentId}`);
            console.log(`            Name: ${booking.studentName}`);
            console.log(`            Email: ${booking.studentEmail}`);
            console.log(`            Status: ${booking.status}`);
            console.log(`            Booked At: ${booking.bookedAt}`);
          });
        }
      });
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📈 Total Bookings Found: ${totalBookings}\n`);

    // Also check current user
    console.log('\n🔍 Checking Students...\n');
    const students = await User.find({ role: 'student' }).select('name email _id');
    console.log(`👥 Total Students: ${students.length}\n`);
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email})`);
      console.log(`   ID: ${student._id}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkBookings();
