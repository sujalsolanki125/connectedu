const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

const checkAllCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 COMPLETE DATABASE ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Total Collections: ${collections.length}`);
    console.log('Collections:', collections.map(c => c.name).join(', '));
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ========================================
    // CHECK USERS
    // ========================================
    const allUsers = await User.find({});
    console.log(`👥 TOTAL USERS: ${allUsers.length}\n`);

    const alumni = allUsers.filter(u => u.role === 'alumni');
    const students = allUsers.filter(u => u.role === 'student');
    const admins = allUsers.filter(u => u.role === 'admin');

    console.log(`   🎓 Alumni: ${alumni.length}`);
    console.log(`   📚 Students: ${students.length}`);
    console.log(`   👨‍💼 Admins: ${admins.length}\n`);

    // ========================================
    // CHECK INTERVIEW EXPERIENCES
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 INTERVIEW EXPERIENCES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const alumniWithExperiences = await User.find({
      role: 'alumni',
      'interviewExperiences.0': { $exists: true }
    });

    console.log(`Alumni with Experiences: ${alumniWithExperiences.length}`);
    
    let totalExperiences = 0;
    alumniWithExperiences.forEach(alum => {
      totalExperiences += alum.interviewExperiences.length;
    });
    console.log(`Total Experiences Posted: ${totalExperiences}\n`);

    if (alumniWithExperiences.length > 0) {
      console.log('📌 Sample Experience:');
      const sample = alumniWithExperiences[0].interviewExperiences[0];
      console.log(`   Company: ${sample.companyName}`);
      console.log(`   Questions: ${sample.questions?.length || 0}`);
      console.log(`   Helpful Count: ${sample.helpfulCount || 0}`);
      console.log(`   Posted: ${sample.postedAt || 'N/A'}\n`);
    } else {
      console.log('⚠️  No interview experiences found in database!\n');
    }

    // ========================================
    // CHECK MENTORSHIP SESSIONS (WORKSHOPS)
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎓 MENTORSHIP SESSIONS (Workshops)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const alumniWithWorkshops = await User.find({
      role: 'alumni',
      'mentorshipSessions.0': { $exists: true }
    });

    console.log(`Alumni with Workshops: ${alumniWithWorkshops.length}`);
    
    let totalWorkshops = 0;
    alumniWithWorkshops.forEach(alum => {
      totalWorkshops += alum.mentorshipSessions.length;
    });
    console.log(`Total Workshops Created: ${totalWorkshops}\n`);

    if (alumniWithWorkshops.length > 0) {
      console.log('📌 Sample Workshop:');
      const sample = alumniWithWorkshops[0].mentorshipSessions[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   Type: ${sample.sessionType}`);
      console.log(`   Status: ${sample.status}`);
      console.log(`   Max Participants: ${sample.maxParticipants}`);
      console.log(`   Bookings: ${sample.bookings?.length || 0}\n`);
    } else {
      console.log('⚠️  No workshops found in database!\n');
    }

    // ========================================
    // CHECK WORKSHOP BOOKINGS
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📅 WORKSHOP BOOKINGS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const studentsWithBookings = await User.find({
      role: 'student',
      'workshopBookings.0': { $exists: true }
    });

    console.log(`Students with Bookings: ${studentsWithBookings.length}`);
    
    let totalBookings = 0;
    studentsWithBookings.forEach(student => {
      totalBookings += student.workshopBookings.length;
    });
    console.log(`Total Bookings Made: ${totalBookings}\n`);

    if (studentsWithBookings.length > 0) {
      console.log('📌 Sample Booking:');
      const sample = studentsWithBookings[0].workshopBookings[0];
      console.log(`   Workshop ID: ${sample.workshopId}`);
      console.log(`   Status: ${sample.status}`);
      console.log(`   Booked At: ${sample.bookedAt}\n`);
    } else {
      console.log('⚠️  No bookings found in database!\n');
    }

    // ========================================
    // CHECK ACHIEVEMENTS & RATINGS
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏆 ACHIEVEMENTS & RATINGS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const alumniWithAchievements = alumni.filter(a => 
      a.achievements && (
        a.achievements.totalMentorshipPoints > 0 ||
        a.achievements.badges?.length > 0 ||
        a.achievements.averageRating > 0
      )
    );

    console.log(`Alumni with Achievements: ${alumniWithAchievements.length}\n`);

    if (alumniWithAchievements.length > 0) {
      console.log('📌 Top Alumni by Points:');
      const topAlumni = [...alumni]
        .filter(a => a.achievements?.totalMentorshipPoints > 0)
        .sort((a, b) => (b.achievements?.totalMentorshipPoints || 0) - (a.achievements?.totalMentorshipPoints || 0))
        .slice(0, 5);

      topAlumni.forEach((alum, idx) => {
        console.log(`   ${idx + 1}. ${alum.profile?.firstName || alum.name}`);
        console.log(`      Points: ${alum.achievements?.totalMentorshipPoints || 0}`);
        console.log(`      Rating: ${alum.achievements?.averageRating || 0}/5`);
        console.log(`      Badges: ${alum.achievements?.badges?.length || 0}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No achievements data found!\n');
    }

    // ========================================
    // CHECK FEEDBACK/RATINGS
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⭐ FEEDBACK & RATINGS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let totalFeedback = 0;
    let totalRatings = 0;
    let ratingSum = 0;

    alumni.forEach(alum => {
      if (alum.mentorshipSessions) {
        alum.mentorshipSessions.forEach(session => {
          if (session.feedback && session.feedback.length > 0) {
            totalFeedback += session.feedback.length;
            session.feedback.forEach(fb => {
              if (fb.rating) {
                totalRatings++;
                ratingSum += fb.rating;
              }
            });
          }
        });
      }
    });

    console.log(`Total Feedback Received: ${totalFeedback}`);
    console.log(`Total Ratings: ${totalRatings}`);
    if (totalRatings > 0) {
      console.log(`Average Rating: ${(ratingSum / totalRatings).toFixed(2)}/5\n`);
    } else {
      console.log('⚠️  No ratings found!\n');
    }

    // ========================================
    // DATA STORAGE DIAGNOSIS
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 DATA STORAGE DIAGNOSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const issues = [];

    if (totalExperiences === 0) {
      issues.push('❌ No interview experiences - Alumni may not be adding experiences OR API is failing');
    } else {
      issues.push(`✅ ${totalExperiences} interview experiences stored successfully`);
    }

    if (totalWorkshops === 0) {
      issues.push('❌ No workshops - Alumni may not be creating workshops OR API is failing');
    } else {
      issues.push(`✅ ${totalWorkshops} workshops stored successfully`);
    }

    if (totalBookings === 0) {
      issues.push('❌ No bookings - Students may not be booking workshops OR API is failing');
    } else {
      issues.push(`✅ ${totalBookings} bookings stored successfully`);
    }

    if (totalFeedback === 0) {
      issues.push('❌ No feedback - Students may not be submitting feedback OR API is failing');
    } else {
      issues.push(`✅ ${totalFeedback} feedback submissions stored successfully`);
    }

    if (alumni.length === 0) {
      issues.push('❌ CRITICAL: No alumni accounts exist! Run: node seedDemoUsers.js');
    }

    if (students.length === 0) {
      issues.push('❌ CRITICAL: No student accounts exist! Run: node seedDemoUsers.js');
    }

    issues.forEach(issue => console.log(issue));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (totalExperiences === 0 && totalWorkshops === 0 && totalBookings === 0) {
      console.log('⚠️  NO DATA FOUND IN ANY COLLECTIONS!');
      console.log('\nPossible Reasons:');
      console.log('1. Frontend is not calling APIs correctly');
      console.log('2. Authentication token is not being sent');
      console.log('3. CORS is blocking requests');
      console.log('4. Backend validation is rejecting data');
      console.log('5. Users have not added any data yet\n');
      console.log('NEXT STEPS:');
      console.log('1. Run: node seedDemoUsers.js');
      console.log('2. Login to frontend as alumni@test.com');
      console.log('3. Try adding an interview experience');
      console.log('4. Check browser console (F12) for errors');
      console.log('5. Check server terminal for request logs\n');
    } else {
      console.log('✅ Database is receiving and storing data!');
      console.log('\nData Summary:');
      console.log(`   Interview Experiences: ${totalExperiences}`);
      console.log(`   Workshops Created: ${totalWorkshops}`);
      console.log(`   Bookings Made: ${totalBookings}`);
      console.log(`   Feedback Submitted: ${totalFeedback}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
};

checkAllCollections();
