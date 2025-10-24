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

const testGetMyBookings = async () => {
  try {
    await connectDB();

    // Simulate the getMyBookings API for the correct student
    const studentId = '68f763405dc55f8b7b36c372'; // The student who has bookings

    console.log('\n🧪 Testing getMyBookings API...');
    console.log(`Student ID: ${studentId}\n`);

    // Find all alumni and extract workshops with this student's bookings
    const alumni = await User.find({ role: 'alumni', 'workshops.0': { $exists: true } }).select(
      'profile.firstName profile.lastName profile.currentCompany profile.currentPosition profile.profilePhotoURL workshops'
    );

    const myBookings = [];

    alumni.forEach((alum) => {
      alum.workshops.forEach((workshop) => {
        workshop.bookings.forEach((booking) => {
          if (booking.studentId && booking.studentId.toString() === studentId.toString()) {
            myBookings.push({
              _id: booking._id,
              workshopId: workshop._id,
              workshopTitle: workshop.title,
              category: workshop.category,
              mentorshipType: workshop.mentorshipType,
              sessionMode: workshop.sessionMode,
              duration: workshop.duration,
              isPaidSession: workshop.isPaidSession,
              sessionCharge: workshop.sessionCharge,
              description: workshop.description,
              scheduledDate: booking.scheduledDate,
              scheduledTime: booking.scheduledTime,
              status: booking.status,
              notes: booking.notes,
              meetingLink: booking.meetingLink,
              bookedAt: booking.bookedAt,
              mentor: {
                id: alum._id,
                name: `${alum.profile.firstName || ''} ${alum.profile.lastName || ''}`.trim() || 'Anonymous',
                company: alum.profile.currentCompany || 'Not specified',
                position: alum.profile.currentPosition || 'Professional',
                profilePhoto: alum.profile.profilePhotoURL,
              },
            });
          }
        });
      });
    });

    console.log('✅ API Response:');
    console.log({
      success: true,
      count: myBookings.length,
      data: myBookings
    });

    console.log(`\n📊 Found ${myBookings.length} bookings for this student\n`);

    myBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.workshopTitle}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Mentor: ${booking.mentor.name}`);
      console.log(`   Booked: ${booking.bookedAt}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testGetMyBookings();
