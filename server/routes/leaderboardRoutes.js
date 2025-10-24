const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getUserLeaderboardStats,
  getMyLeaderboardStats,
  awardBadge,
  updateStreak,
  getTopContributors,
} = require('../controllers/leaderboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, getLeaderboard);

router.route('/me').get(protect, getMyLeaderboardStats);

router.route('/streak').post(protect, updateStreak);

router.route('/top-contributors').get(protect, getTopContributors);

router.route('/:userId').get(protect, getUserLeaderboardStats);

router.route('/:userId/badge').post(protect, authorize('admin'), awardBadge);

module.exports = router;
