const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    contributions: {
      acceptedMentorships: {
        type: Number,
        default: 0,
        description: 'Accepting mentorship request (+10 pts)',
      },
      mentorshipSessions: {
        type: Number,
        default: 0,
        description: 'Completing mentorship session (+20 pts)',
      },
      interviewExperiences: {
        type: Number,
        default: 0,
        description: 'Uploading interview experience (+15 pts)',
      },
      resourcesShared: {
        type: Number,
        default: 0,
        description: 'Uploading preparation resources (+10 pts)',
      },
      mockInterviews: {
        type: Number,
        default: 0,
        description: 'Conducting workshop (+25 pts)',
      },
      fiveStarRatings: {
        type: Number,
        default: 0,
        description: 'Receiving 5-star rating (+10 pts)',
      },
      companyInsights: {
        type: Number,
        default: 0,
        description: 'Company insights (+15 pts)',
      },
      questionsAnswered: {
        type: Number,
        default: 0,
        description: 'Answering questions (+5 pts)',
      },
      helpfulRatings: {
        type: Number,
        default: 0,
        description: 'Other helpful ratings (+2 pts)',
      },
      missedRequests: {
        type: Number,
        default: 0,
        description: 'Ignored requests - no response in 3 days (-5 pts)',
      },
    },
    badges: [
      {
        name: String,
        icon: String,
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rank: {
      type: Number,
      default: 0,
    },
    rankScore: {
      type: Number,
      default: 0,
      description: 'Weighted score: (points × 0.7) + (avgRating × 20 × 0.3)',
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        description: 'Average rating from students (0-5 scale)',
      },
      total: {
        type: Number,
        default: 0,
        description: 'Total number of ratings received',
      },
      sum: {
        type: Number,
        default: 0,
        description: 'Sum of all rating values',
      },
    },
    level: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze',
    },
    achievements: [
      {
        title: String,
        description: String,
        icon: String,
        achievedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastActivityDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate points based on contributions
leaderboardSchema.methods.calculatePoints = function () {
  const pointsSystem = {
    acceptedMentorships: 10,        // Accepting mentorship request (+10)
    mentorshipSessions: 20,         // Completing mentorship session (+20)
    interviewExperiences: 15,       // Uploading interview experience (+15)
    resourcesShared: 10,            // Uploading preparation resources (+10)
    mockInterviews: 25,             // Conducting workshop (+25)
    fiveStarRatings: 10,            // Receiving 5-star rating (+10)
    weeklyStreak: 5,                // Weekly login streak (+5 per week)
    companyInsights: 15,            // Company insights (+15)
    questionsAnswered: 5,           // Answering questions (+5)
    helpfulRatings: 2,              // Other helpful ratings (+2)
  };

  let totalPoints = 0;
  for (const [key, value] of Object.entries(this.contributions)) {
    totalPoints += value * (pointsSystem[key] || 0);
  }

  // Add streak bonus (weekly activity)
  if (this.streak?.current) {
    const weeklyStreakBonus = Math.floor(this.streak.current / 7) * pointsSystem.weeklyStreak;
    totalPoints += weeklyStreakBonus;
  }

  // Deduct points for missed/ignored requests (-5 per missed)
  if (this.contributions.missedRequests) {
    totalPoints -= this.contributions.missedRequests * 5;
  }

  // Ensure points don't go negative
  this.points = Math.max(0, totalPoints);
  this.updateLevel();
  this.calculateRankScore();
};

// Update level based on points
leaderboardSchema.methods.updateLevel = function () {
  if (this.points >= 500) {
    this.level = 'Diamond';      // 500+ points → 🔷 Diamond (Sky Blue)
  } else if (this.points >= 300) {
    this.level = 'Platinum';     // 300-499 points → 💎 Platinum (Light Blue)
  } else if (this.points >= 200) {
    this.level = 'Gold';         // 200-299 points → 🥇 Gold (Yellow)
  } else if (this.points >= 100) {
    this.level = 'Silver';       // 100-199 points → 🥈 Silver (Gray)
  } else {
    this.level = 'Bronze';       // 0-99 points → 🥉 Bronze (Brown)
  }
};

// Calculate average rating from all ratings received
leaderboardSchema.methods.calculateAverageRating = function () {
  if (this.rating.total > 0) {
    this.rating.average = parseFloat((this.rating.sum / this.rating.total).toFixed(2));
  } else {
    this.rating.average = 0;
  }
  this.calculateRankScore();
};

// Add a new rating
leaderboardSchema.methods.addRating = function (ratingValue) {
  // Validate rating is between 1-5
  if (ratingValue < 1 || ratingValue > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  this.rating.sum += ratingValue;
  this.rating.total += 1;
  this.calculateAverageRating();
};

// Calculate rank score (weighted formula)
// rankScore = (totalPoints × 0.7) + (avgRating × 20 × 0.3)
// 70% weight to activity points, 30% weight to average rating
leaderboardSchema.methods.calculateRankScore = function () {
  const pointsWeight = 0.7;
  const ratingWeight = 0.3;
  const ratingMultiplier = 20; // Scale rating (0-5) to comparable range
  
  this.rankScore = (this.points * pointsWeight) + (this.rating.average * ratingMultiplier * ratingWeight);
  this.rankScore = parseFloat(this.rankScore.toFixed(2));
};

// Static method to recalculate ranks for all alumni
leaderboardSchema.statics.recalculateRanks = async function () {
  try {
    // Get all leaderboard entries sorted by rankScore (descending)
    const entries = await this.find().sort({ rankScore: -1, points: -1, 'rating.average': -1 });
    
    // Assign ranks based on sorted order
    const bulkOps = entries.map((entry, index) => ({
      updateOne: {
        filter: { _id: entry._id },
        update: { rank: index + 1 }
      }
    }));
    
    if (bulkOps.length > 0) {
      await this.bulkWrite(bulkOps);
    }
    
    return entries.length;
  } catch (error) {
    console.error('Error recalculating ranks:', error);
    throw error;
  }
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
