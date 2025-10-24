const cron = require('node-cron');
const leaderboardService = require('../services/leaderboardService');

/**
 * Leaderboard Cron Jobs
 * Scheduled tasks for maintaining leaderboard accuracy
 */

class LeaderboardCronJobs {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start all cron jobs
   */
  startAll() {
    console.log('🕒 Starting leaderboard cron jobs...');

    // Job 1: Recalculate leaderboard every hour
    const hourlyJob = cron.schedule('0 * * * *', async () => {
      console.log('⏰ [HOURLY] Recalculating leaderboard...');
      try {
        await leaderboardService.recalculateAllLeaderboards();
        console.log('✅ [HOURLY] Leaderboard recalculated successfully');
      } catch (error) {
        console.error('❌ [HOURLY] Error recalculating leaderboard:', error);
      }
    });

    // Job 2: Check for expired mentorship requests every 6 hours
    const expiredRequestsJob = cron.schedule('0 */6 * * *', async () => {
      console.log('⏰ [6-HOURLY] Checking for expired mentorship requests...');
      try {
        const count = await leaderboardService.checkExpiredRequests();
        console.log(`✅ [6-HOURLY] Processed ${count} expired requests`);
      } catch (error) {
        console.error('❌ [6-HOURLY] Error checking expired requests:', error);
      }
    });

    // Job 3: Full leaderboard refresh daily at midnight
    const dailyJob = cron.schedule('0 0 * * *', async () => {
      console.log('⏰ [DAILY] Full leaderboard refresh...');
      try {
        await leaderboardService.recalculateAllLeaderboards();
        console.log('✅ [DAILY] Full leaderboard refresh completed');
      } catch (error) {
        console.error('❌ [DAILY] Error refreshing leaderboard:', error);
      }
    });

    this.jobs.push(hourlyJob, expiredRequestsJob, dailyJob);

    console.log('✅ Leaderboard cron jobs started successfully');
    console.log('   📊 Hourly recalculation: Every hour');
    console.log('   ⏰ Expired requests check: Every 6 hours');
    console.log('   🌙 Daily full refresh: Midnight');
  }

  /**
   * Stop all cron jobs
   */
  stopAll() {
    console.log('🛑 Stopping leaderboard cron jobs...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('✅ All cron jobs stopped');
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    return {
      totalJobs: this.jobs.length,
      jobs: [
        {
          name: 'Hourly Recalculation',
          schedule: '0 * * * *',
          description: 'Recalculates all leaderboard entries every hour'
        },
        {
          name: 'Expired Requests Check',
          schedule: '0 */6 * * *',
          description: 'Checks for mentorship requests with no response in 3+ days'
        },
        {
          name: 'Daily Full Refresh',
          schedule: '0 0 * * *',
          description: 'Complete leaderboard refresh at midnight'
        }
      ]
    };
  }
}

module.exports = new LeaderboardCronJobs();
