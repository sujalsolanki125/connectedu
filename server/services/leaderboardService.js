const Leaderboard = require('../models/leaderboardModel');
const User = require('../models/userModel');

/**
 * Leaderboard Service - Handles all dynamic point tracking and updates
 * Automatically updates leaderboard when alumni perform actions
 */

class LeaderboardService {
  /**
   * Get or create leaderboard entry for a user
   */
  async getOrCreateLeaderboard(userId) {
    try {
      let leaderboard = await Leaderboard.findOne({ user: userId });
      
      if (!leaderboard) {
        leaderboard = await Leaderboard.create({ user: userId });
        console.log(`✅ Created leaderboard entry for user: ${userId}`);
      }
      
      return leaderboard;
    } catch (error) {
      console.error('Error getting/creating leaderboard:', error);
      throw error;
    }
  }

  /**
   * Award points for accepting a mentorship request (+10 points)
   */
  async trackAcceptedMentorship(alumniId) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      leaderboard.contributions.acceptedMentorships += 1;
      leaderboard.calculatePoints();
      
      await leaderboard.save();
      await Leaderboard.recalculateRanks();
      
      console.log(`✅ Awarded 10 pts to ${alumniId} for accepting mentorship`);
      return leaderboard;
    } catch (error) {
      console.error('Error tracking accepted mentorship:', error);
    }
  }

  /**
   * Award points for completing a mentorship session (+20 points)
   */
  async trackCompletedMentorship(alumniId) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      leaderboard.contributions.mentorshipSessions += 1;
      leaderboard.calculatePoints();
      
      await leaderboard.save();
      await Leaderboard.recalculateRanks();
      
      console.log(`✅ Awarded 20 pts to ${alumniId} for completing mentorship`);
      return leaderboard;
    } catch (error) {
      console.error('Error tracking completed mentorship:', error);
    }
  }

  /**
   * Award points for uploading interview experience (+15 points)
   */
  async trackInterviewExperience(alumniId) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      leaderboard.contributions.interviewExperiences += 1;
      leaderboard.calculatePoints();
      
      await leaderboard.save();
      await Leaderboard.recalculateRanks();
      
      console.log(`✅ Awarded 15 pts to ${alumniId} for sharing interview experience`);
      return leaderboard;
    } catch (error) {
      console.error('Error tracking interview experience:', error);
    }
  }

  /**
   * Award points for uploading resources (+10 points)
   */
  async trackResourceShared(alumniId) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      leaderboard.contributions.resourcesShared += 1;
      leaderboard.calculatePoints();
      
      await leaderboard.save();
      await Leaderboard.recalculateRanks();
      
      console.log(`✅ Awarded 10 pts to ${alumniId} for sharing resource`);
      return leaderboard;
    } catch (error) {
      console.error('Error tracking resource shared:', error);
    }
  }

  /**
   * Award points for conducting a workshop (+25 points)
   */
  async trackWorkshopConducted(alumniId) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      leaderboard.contributions.mockInterviews += 1;
      leaderboard.calculatePoints();
      
      await leaderboard.save();
      await Leaderboard.recalculateRanks();
      
      console.log(`✅ Awarded 25 pts to ${alumniId} for conducting workshop`);
      return leaderboard;
    } catch (error) {
      console.error('Error tracking workshop:', error);
    }
  }

  /**
   * Award points for receiving a 5-star rating (+10 points)
   * Also updates average rating
   */
  async trackFiveStarRating(alumniId, ratingValue) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      // Add rating to calculate average
      leaderboard.addRating(ratingValue);
      
      // Award bonus points for 5-star ratings
      if (ratingValue === 5) {
        leaderboard.contributions.fiveStarRatings += 1;
      }
      
      // Award points for all ratings
      leaderboard.contributions.helpfulRatings += 1;
      
      leaderboard.calculatePoints();
      
      await leaderboard.save();
      await Leaderboard.recalculateRanks();
      
      console.log(`✅ Awarded ${ratingValue === 5 ? '10' : '2'} pts to ${alumniId} for ${ratingValue}-star rating`);
      return leaderboard;
    } catch (error) {
      console.error('Error tracking rating:', error);
    }
  }

  /**
   * Update activity streak (+5 points per week)
   */
  async updateActivityStreak(alumniId) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      const today = new Date();
      const lastActivity = leaderboard.streak.lastActivityDate;
      
      if (!lastActivity) {
        // First activity
        leaderboard.streak.current = 1;
        leaderboard.streak.longest = 1;
        leaderboard.streak.lastActivityDate = today;
      } else {
        const daysSinceLastActivity = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastActivity === 1) {
          // Continue streak
          leaderboard.streak.current += 1;
          leaderboard.streak.longest = Math.max(leaderboard.streak.longest, leaderboard.streak.current);
        } else if (daysSinceLastActivity > 1) {
          // Streak broken, restart
          leaderboard.streak.current = 1;
        }
        // If same day, don't update
        
        leaderboard.streak.lastActivityDate = today;
      }
      
      leaderboard.calculatePoints(); // Recalculates with streak bonus
      
      await leaderboard.save();
      
      console.log(`✅ Updated activity streak for ${alumniId}: ${leaderboard.streak.current} days`);
      return leaderboard;
    } catch (error) {
      console.error('Error updating activity streak:', error);
    }
  }

  /**
   * Penalize for ignoring a mentorship request (-5 points)
   */
  async trackMissedRequest(alumniId) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      leaderboard.contributions.missedRequests += 1;
      leaderboard.calculatePoints(); // Will deduct points
      
      await leaderboard.save();
      await Leaderboard.recalculateRanks();
      
      console.log(`❌ Deducted 5 pts from ${alumniId} for ignoring request`);
      return leaderboard;
    } catch (error) {
      console.error('Error tracking missed request:', error);
    }
  }

  /**
   * Award points for sharing company insights (+15 points)
   */
  async trackCompanyInsight(alumniId) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      leaderboard.contributions.companyInsights += 1;
      leaderboard.calculatePoints();
      
      await leaderboard.save();
      await Leaderboard.recalculateRanks();
      
      console.log(`✅ Awarded 15 pts to ${alumniId} for sharing company insight`);
      return leaderboard;
    } catch (error) {
      console.error('Error tracking company insight:', error);
    }
  }

  /**
   * Award points for answering questions (+5 points)
   */
  async trackQuestionAnswered(alumniId) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(alumniId);
      
      leaderboard.contributions.questionsAnswered += 1;
      leaderboard.calculatePoints();
      
      await leaderboard.save();
      await Leaderboard.recalculateRanks();
      
      console.log(`✅ Awarded 5 pts to ${alumniId} for answering question`);
      return leaderboard;
    } catch (error) {
      console.error('Error tracking question answered:', error);
    }
  }

  /**
   * Comprehensive activity tracker - updates streak and awards action points
   */
  async trackActivity(alumniId, activityType) {
    try {
      // Update streak first
      await this.updateActivityStreak(alumniId);
      
      // Then award points based on activity type
      switch (activityType) {
        case 'ACCEPT_MENTORSHIP':
          return await this.trackAcceptedMentorship(alumniId);
        case 'COMPLETE_MENTORSHIP':
          return await this.trackCompletedMentorship(alumniId);
        case 'UPLOAD_INTERVIEW':
          return await this.trackInterviewExperience(alumniId);
        case 'SHARE_RESOURCE':
          return await this.trackResourceShared(alumniId);
        case 'CONDUCT_WORKSHOP':
          return await this.trackWorkshopConducted(alumniId);
        case 'SHARE_INSIGHT':
          return await this.trackCompanyInsight(alumniId);
        case 'ANSWER_QUESTION':
          return await this.trackQuestionAnswered(alumniId);
        default:
          console.log(`Unknown activity type: ${activityType}`);
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  /**
   * Recalculate all leaderboard entries (for cron jobs)
   */
  async recalculateAllLeaderboards() {
    try {
      console.log('🔄 Starting leaderboard recalculation...');
      
      const leaderboards = await Leaderboard.find();
      
      for (const leaderboard of leaderboards) {
        leaderboard.calculatePoints();
        await leaderboard.save();
      }
      
      await Leaderboard.recalculateRanks();
      
      console.log(`✅ Recalculated ${leaderboards.length} leaderboard entries`);
      return leaderboards.length;
    } catch (error) {
      console.error('Error recalculating leaderboards:', error);
      throw error;
    }
  }

  /**
   * Check for expired mentorship requests (3+ days no response)
   */
  async checkExpiredRequests() {
    try {
      const MentorshipRequest = require('../models/mentorshipRequestModel');
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const expiredRequests = await MentorshipRequest.find({
        status: 'pending',
        createdAt: { $lt: threeDaysAgo }
      });
      
      console.log(`🔍 Found ${expiredRequests.length} expired requests`);
      
      for (const request of expiredRequests) {
        await this.trackMissedRequest(request.alumni._id);
        
        // Optionally update request status
        request.status = 'expired';
        await request.save();
      }
      
      return expiredRequests.length;
    } catch (error) {
      console.error('Error checking expired requests:', error);
    }
  }
}

module.exports = new LeaderboardService();
