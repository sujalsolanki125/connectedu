const Leaderboard = require('../models/leaderboardModel');
const User = require('../models/userModel');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 50, level } = req.query;
    
    let query = {};
    if (level) query.level = level;

    // Only include alumni in public leaderboard
    let leaderboard = await Leaderboard.find(query)
      .populate({ path: 'user', select: 'name email role profile', match: { role: 'alumni' } })
      .sort({ rankScore: -1, points: -1, 'rating.average': -1 }) // Sort by rankScore (weighted)
      .limit(parseInt(limit));

    // Filter out non-alumni (populate match sets user to null)
    leaderboard = leaderboard.filter((entry) => entry.user);

    // Update ranks based on sorted order
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Save updated ranks for alumni leaderboard only
    await Promise.all(leaderboard.map((entry) => entry.save()));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user leaderboard stats
// @route   GET /api/leaderboard/user/:userId
// @access  Private
const getUserLeaderboardStats = async (req, res) => {
  try {
    let leaderboard = await Leaderboard.findOne({ user: req.params.userId })
      .populate('user', 'name email profile');

    if (!leaderboard) {
      // Create leaderboard entry for user
      leaderboard = await Leaderboard.create({ user: req.params.userId });
      await leaderboard.populate('user', 'name email profile');
    }

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my leaderboard stats
// @route   GET /api/leaderboard/me
// @access  Private
const getMyLeaderboardStats = async (req, res) => {
  try {
    let leaderboard = await Leaderboard.findOne({ user: req.user._id })
      .populate('user', 'name email profile');

    if (!leaderboard) {
      leaderboard = await Leaderboard.create({ user: req.user._id });
      await leaderboard.populate('user', 'name email profile');
    }

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Award badge to user
// @route   POST /api/leaderboard/:userId/badge
// @access  Private (Admin only)
const awardBadge = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    
    let leaderboard = await Leaderboard.findOne({ user: req.params.userId });

    if (!leaderboard) {
      leaderboard = await Leaderboard.create({ user: req.params.userId });
    }

    leaderboard.badges.push({
      name,
      icon,
      description,
    });

    await leaderboard.save();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update activity streak
// @route   POST /api/leaderboard/streak
// @access  Private
const updateStreak = async (req, res) => {
  try {
    let leaderboard = await Leaderboard.findOne({ user: req.user._id });

    if (!leaderboard) {
      leaderboard = await Leaderboard.create({ user: req.user._id });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = leaderboard.streak.lastActivityDate
      ? new Date(leaderboard.streak.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const daysDifference = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      if (daysDifference === 1) {
        // Consecutive day
        leaderboard.streak.current += 1;
        if (leaderboard.streak.current > leaderboard.streak.longest) {
          leaderboard.streak.longest = leaderboard.streak.current;
        }
      } else if (daysDifference > 1) {
        // Streak broken
        leaderboard.streak.current = 1;
      }
      // If daysDifference === 0, same day, no change
    } else {
      // First activity
      leaderboard.streak.current = 1;
      leaderboard.streak.longest = 1;
    }

    leaderboard.streak.lastActivityDate = new Date();
    await leaderboard.save();

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top contributors
// @route   GET /api/leaderboard/top-contributors
// @access  Private
const getTopContributors = async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;

    let sortField = 'points';
    if (type) {
      sortField = `contributions.${type}`;
    }

    let topContributors = await Leaderboard.find()
      .populate({ path: 'user', select: 'name email role profile', match: { role: 'alumni' } })
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    topContributors = topContributors.filter((entry) => entry.user);

    res.json(topContributors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getUserLeaderboardStats,
  getMyLeaderboardStats,
  awardBadge,
  updateStreak,
  getTopContributors,
};
