const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/userModel');
const Leaderboard = require('./models/leaderboardModel');

const testLeaderboard = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Find the user by email
    const email = 'gamerytsujal001@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }

    console.log('\n📋 User Details:');
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- ID:', user._id);

    // Check if leaderboard entry exists
    let leaderboard = await Leaderboard.findOne({ user: user._id });

    if (!leaderboard) {
      console.log('\n⚠️  No leaderboard entry found. Creating one...');
      leaderboard = await Leaderboard.create({ user: user._id });
      console.log('✅ Leaderboard entry created');
    } else {
      console.log('\n✅ Leaderboard entry found');
    }

    // Recalculate points and update level
    leaderboard.calculatePoints();
    leaderboard.updateLevel();
    leaderboard.calculateRankScore();
    await leaderboard.save();

    console.log('\n🏆 Leaderboard Stats:');
    console.log('- Rank:', leaderboard.rank);
    console.log('- Points:', leaderboard.points);
    console.log('- Level:', leaderboard.level);
    console.log('- Rank Score:', leaderboard.rankScore);
    console.log('- Average Rating:', leaderboard.rating.average);
    console.log('- Total Ratings:', leaderboard.rating.total);

    console.log('\n📊 Contributions:');
    console.log('- Accepted Mentorships:', leaderboard.contributions.acceptedMentorships);
    console.log('- Completed Sessions:', leaderboard.contributions.mentorshipSessions);
    console.log('- Interview Experiences:', leaderboard.contributions.interviewExperiences);
    console.log('- Resources Shared:', leaderboard.contributions.resourcesShared);
    console.log('- Workshops:', leaderboard.contributions.mockInterviews);
    console.log('- 5-Star Ratings:', leaderboard.contributions.fiveStarRatings);
    console.log('- Company Insights:', leaderboard.contributions.companyInsights);
    console.log('- Questions Answered:', leaderboard.contributions.questionsAnswered);
    console.log('- Missed Requests:', leaderboard.contributions.missedRequests);

    // Test API endpoints data
    console.log('\n🔍 Testing API Data Fetch...');
    
    const allLeaderboard = await Leaderboard.find()
      .populate('user', 'name email role profile')
      .sort({ rankScore: -1, points: -1 })
      .limit(10);

    console.log(`\n📊 Top 10 Leaderboard Entries (${allLeaderboard.length} found):`);
    allLeaderboard.forEach((entry, index) => {
      if (entry.user) {
        console.log(`${index + 1}. ${entry.user.name} - ${entry.points} pts (Level: ${entry.level}, Rating: ${entry.rating.average.toFixed(1)})`);
      }
    });

    // Recalculate all ranks
    console.log('\n🔄 Recalculating all ranks...');
    await Leaderboard.recalculateRanks();
    console.log('✅ Ranks updated successfully');

    // Fetch updated leaderboard
    const updatedLeaderboard = await Leaderboard.findOne({ user: user._id });
    console.log('\n🎯 Updated User Rank:', updatedLeaderboard.rank);
    console.log('✅ Test Complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB Disconnected');
  }
};

testLeaderboard();
