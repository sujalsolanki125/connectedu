const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

const viewEmbeddedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find alumni user
    const alumni = await User.findOne({ email: 'alumni@test.com' });
    
    if (!alumni) {
      console.log('❌ Alumni user not found! Run: node seedDemoUsers.js');
      mongoose.disconnect();
      return;
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('👤 ALUMNI USER DATA');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Name: ${alumni.name}`);
    console.log(`Email: ${alumni.email}`);
    console.log(`Role: ${alumni.role}`);
    console.log(`Profile Complete: ${alumni.isProfileComplete ? 'Yes' : 'No'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Interview Experiences
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 INTERVIEW EXPERIENCES (Embedded in User Document)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Count: ${alumni.interviewExperiences?.length || 0}\n`);
    
    if (alumni.interviewExperiences && alumni.interviewExperiences.length > 0) {
      alumni.interviewExperiences.forEach((exp, idx) => {
        console.log(`Experience #${idx + 1}:`);
        console.log(`  🏢 Company: ${exp.companyName}`);
        console.log(`  📅 Posted: ${exp.postedAt?.toLocaleDateString() || 'N/A'}`);
        console.log(`  🔄 Rounds: ${exp.interviewRounds || 'Not specified'}`);
        console.log(`  ❓ Questions: ${exp.questions?.length || 0}`);
        console.log(`  👍 Helpful Votes: ${exp.helpfulCount || 0}`);
        console.log(`  💡 Has Tips: ${exp.tips ? 'Yes' : 'No'}`);
        
        if (exp.questions && exp.questions.length > 0) {
          console.log(`  📋 Sample Questions:`);
          exp.questions.slice(0, 2).forEach((q, qIdx) => {
            console.log(`     ${qIdx + 1}. ${q.questionText?.substring(0, 60)}${q.questionText?.length > 60 ? '...' : ''}`);
            console.log(`        Type: ${q.roundType || 'N/A'}`);
          });
        }
        console.log('');
      });
    } else {
      console.log('⚠️  No interview experiences added yet.');
      console.log('ℹ️  To add: Login as alumni@test.com and use "Add Experience" button\n');
    }

    // Workshops
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎓 WORKSHOPS/MENTORSHIP SESSIONS (Embedded in User Document)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Count: ${alumni.workshops?.length || 0}\n`);
    
    if (alumni.workshops && alumni.workshops.length > 0) {
      alumni.workshops.forEach((workshop, idx) => {
        console.log(`Workshop #${idx + 1}:`);
        console.log(`  📚 Type: ${workshop.mentorshipType?.join(', ') || 'Not specified'}`);
        console.log(`  💰 Paid: ${workshop.isPaidSession ? 'Yes' : 'No'}`);
        if (workshop.isPaidSession) {
          console.log(`  💵 Charge: ₹${workshop.sessionCharge || 0}`);
        }
        console.log(`  🎯 Mode: ${workshop.sessionMode?.join(', ') || 'Not specified'}`);
        console.log(`  ⏱️  Duration: ${workshop.duration || 0} minutes`);
        console.log(`  👥 Max Participants: ${workshop.maxParticipants || 1}`);
        console.log(`  📅 Available Days: ${workshop.availableDays?.join(', ') || 'Not specified'}`);
        console.log(`  🕐 Available Time: ${workshop.availableTime || 'Not specified'}`);
        console.log(`  ✅ Active: ${workshop.isActive ? 'Yes' : 'No'}`);
        console.log(`  📞 Bookings: ${workshop.bookings?.length || 0}`);
        
        if (workshop.bookings && workshop.bookings.length > 0) {
          console.log(`  📋 Recent Bookings:`);
          workshop.bookings.slice(0, 3).forEach((booking, bIdx) => {
            console.log(`     ${bIdx + 1}. ${booking.studentName || 'Unknown'}`);
            console.log(`        Status: ${booking.status || 'Pending'}`);
            console.log(`        Booked: ${booking.bookedAt?.toLocaleDateString() || 'N/A'}`);
          });
        }
        console.log('');
      });
    } else {
      console.log('⚠️  No workshops created yet.');
      console.log('ℹ️  To add: Login as alumni@test.com and use "Create Workshop" button\n');
    }

    // Achievements
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏆 ACHIEVEMENTS (Embedded in User Document)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (alumni.achievements) {
      console.log(`📊 Statistics:`);
      console.log(`  🎤 Sessions Conducted: ${alumni.achievements.totalSessionsConducted || 0}`);
      console.log(`  ⭐ Average Rating: ${alumni.achievements.averageRating || 0}/5`);
      console.log(`  🎯 Leaderboard Points: ${alumni.achievements.leaderboardPoints || 0}`);
      console.log(`  👍 Helpful Votes: ${alumni.achievements.totalHelpfulVotes || 0}`);
      console.log(`  🏅 Rank Position: ${alumni.achievements.rankPosition || 'Unranked'}`);
      console.log(`\n🏆 Badges: ${alumni.achievements.badges?.length || 0}`);
      if (alumni.achievements.badges && alumni.achievements.badges.length > 0) {
        alumni.achievements.badges.forEach((badge, idx) => {
          console.log(`  ${idx + 1}. ${badge}`);
        });
      } else {
        console.log(`  ⚠️  No badges earned yet`);
      }
      
      console.log(`\n💬 Student Feedback: ${alumni.achievements.studentFeedback?.length || 0}`);
      if (alumni.achievements.studentFeedback && alumni.achievements.studentFeedback.length > 0) {
        alumni.achievements.studentFeedback.slice(0, 3).forEach((feedback, idx) => {
          console.log(`\n  Feedback #${idx + 1}:`);
          console.log(`    Student: ${feedback.studentName || 'Anonymous'}`);
          console.log(`    Rating: ${'⭐'.repeat(feedback.rating || 0)} (${feedback.rating}/5)`);
          console.log(`    Session: ${feedback.sessionType || 'N/A'}`);
          console.log(`    Comment: ${feedback.comment?.substring(0, 80) || 'No comment'}${feedback.comment?.length > 80 ? '...' : ''}`);
          console.log(`    Date: ${feedback.date?.toLocaleDateString() || 'N/A'}`);
        });
      } else {
        console.log(`  ⚠️  No feedback received yet`);
      }
    } else {
      console.log('⚠️  No achievements data initialized.');
    }
    console.log('\n═══════════════════════════════════════════════════════\n');

    // Summary
    console.log('📋 SUMMARY:');
    console.log(`  Total Interview Experiences: ${alumni.interviewExperiences?.length || 0}`);
    console.log(`  Total Workshops Created: ${alumni.workshops?.length || 0}`);
    console.log(`  Total Bookings Received: ${alumni.workshops?.reduce((sum, w) => sum + (w.bookings?.length || 0), 0) || 0}`);
    console.log(`  Leaderboard Points: ${alumni.achievements?.leaderboardPoints || 0}`);
    console.log(`  Average Rating: ${alumni.achievements?.averageRating || 0}/5`);
    console.log(`  Badges Earned: ${alumni.achievements?.badges?.length || 0}`);
    console.log('\n═══════════════════════════════════════════════════════\n');

    // Technical Info
    console.log('🔧 TECHNICAL INFO:');
    console.log(`  MongoDB Document ID: ${alumni._id}`);
    console.log(`  Document Size: ~${JSON.stringify(alumni).length} bytes`);
    console.log(`  Collection: users`);
    console.log(`  Storage Type: Embedded Subdocuments`);
    console.log('\n═══════════════════════════════════════════════════════\n');

    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
};

viewEmbeddedData();
