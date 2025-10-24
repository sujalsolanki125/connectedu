const MentorshipRating = require('../models/mentorshipRatingModel');
const Mentorship = require('../models/mentorshipModel');
const User = require('../models/userModel');
const Leaderboard = require('../models/leaderboardModel');
const { sendRatingReceivedEmail } = require('./emailController');

// @desc    Submit a rating for a mentorship session
// @route   POST /api/ratings
// @access  Private (Student only)
const submitRating = async (req, res) => {
  try {
    const {
      mentorshipSessionId,
      overallRating,
      categoryRatings,
      review,
      sessionType,
    } = req.body;

    // Validation
    if (!mentorshipSessionId || !overallRating || !categoryRatings) {
      return res.status(400).json({ 
        message: 'Please provide mentorship session ID, overall rating, and category ratings' 
      });
    }

    // Validate category ratings
    const { knowledge, communication, helpfulness, punctuality } = categoryRatings;
    if (!knowledge || !communication || !helpfulness || !punctuality) {
      return res.status(400).json({ 
        message: 'All category ratings (knowledge, communication, helpfulness, punctuality) are required' 
      });
    }

    // Check if mentorship session exists
    const mentorshipSession = await Mentorship.findById(mentorshipSessionId);
    if (!mentorshipSession) {
      return res.status(404).json({ message: 'Mentorship session not found' });
    }

    // Check if the user is the mentee of this session
    if (mentorshipSession.mentee.toString() !== req.user._id.toString()) {
      return res.status(401).json({ 
        message: 'You can only rate mentorship sessions you attended' 
      });
    }

    // Check if session is completed
    if (mentorshipSession.status !== 'Completed') {
      return res.status(400).json({ 
        message: 'You can only rate completed mentorship sessions' 
      });
    }

    // Check if already rated
    const existingRating = await MentorshipRating.findOne({
      student: req.user._id,
      mentorshipSession: mentorshipSessionId,
    });

    if (existingRating) {
      return res.status(400).json({ 
        message: 'You have already rated this mentorship session' 
      });
    }

    // Create the rating
    const rating = await MentorshipRating.create({
      mentorshipSession: mentorshipSessionId,
      student: req.user._id,
      alumni: mentorshipSession.mentor,
      overallRating,
      categoryRatings: {
        knowledge,
        communication,
        helpfulness,
        punctuality,
      },
      review,
      sessionType: sessionType || mentorshipSession.category,
    });

    // Update alumni's rating statistics
    await updateAlumniRatingStats(mentorshipSession.mentor);

    // Update leaderboard for the alumni who received the rating
    await updateLeaderboardForRating(mentorshipSession.mentor, overallRating);

    // Populate the rating with user details
    const populatedRating = await MentorshipRating.findById(rating._id)
      .populate('student', 'name profile.avatar')
      .populate('alumni', 'name email profile.avatar')
      .populate('mentorshipSession', 'title category');

    // Send notification email to alumni
    sendRatingReceivedEmail(
      populatedRating.alumni.email,
      populatedRating.alumni.name,
      populatedRating.student.name,
      overallRating,
      review
    ).catch(err => console.error('Email send failed:', err));

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: populatedRating,
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all ratings for a specific alumni
// @route   GET /api/ratings/alumni/:alumniId
// @access  Public
const getAlumniRatings = async (req, res) => {
  try {
    const { alumniId } = req.params;
    const { limit = 10, page = 1, sort = '-createdAt' } = req.query;

    // Check if alumni exists
    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    // Get ratings
    const ratings = await MentorshipRating.find({ alumni: alumniId })
      .populate('student', 'name profile.avatar profile.department profile.batch')
      .populate('mentorshipSession', 'title category')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalRatings = await MentorshipRating.countDocuments({ alumni: alumniId });

    // Calculate statistics
    const stats = await calculateRatingStats(alumniId);

    res.json({
      overallRating: stats.overallAvg,
      totalReviews: totalRatings,
      categoryRatings: stats.categoryAvgs,
      ratingDistribution: stats.distribution,
      ratings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRatings / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching alumni ratings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get ratings submitted by a student
// @route   GET /api/ratings/student/:studentId
// @access  Private
const getStudentRatings = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if requesting user is the student or an admin
    if (req.user._id.toString() !== studentId && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to view these ratings' });
    }

    const ratings = await MentorshipRating.find({ student: studentId })
      .populate('alumni', 'name profile.avatar profile.company profile.jobTitle')
      .populate('mentorshipSession', 'title category')
      .sort('-createdAt');

    res.json({
      totalRatingsGiven: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error('Error fetching student ratings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get rating for a specific mentorship session
// @route   GET /api/ratings/session/:sessionId
// @access  Private
const getSessionRating = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const rating = await MentorshipRating.findOne({ mentorshipSession: sessionId })
      .populate('student', 'name profile.avatar')
      .populate('alumni', 'name profile.avatar')
      .populate('mentorshipSession', 'title category');

    if (!rating) {
      return res.status(404).json({ message: 'No rating found for this session' });
    }

    res.json(rating);
  } catch (error) {
    console.error('Error fetching session rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a rating (edit review or ratings)
// @route   PUT /api/ratings/:ratingId
// @access  Private (Student who created the rating)
const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { overallRating, categoryRatings, review } = req.body;

    const rating = await MentorshipRating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if the user is the one who submitted the rating
    if (rating.student.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this rating' });
    }

    // Update fields
    if (overallRating) rating.overallRating = overallRating;
    if (categoryRatings) rating.categoryRatings = categoryRatings;
    if (review !== undefined) rating.review = review;

    await rating.save();

    // Recalculate alumni rating stats
    await updateAlumniRatingStats(rating.alumni);

    const updatedRating = await MentorshipRating.findById(ratingId)
      .populate('student', 'name profile.avatar')
      .populate('alumni', 'name profile.avatar')
      .populate('mentorshipSession', 'title category');

    res.json({
      message: 'Rating updated successfully',
      rating: updatedRating,
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:ratingId
// @access  Private (Student who created rating or Admin)
const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await MentorshipRating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check authorization
    if (rating.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this rating' });
    }

    const alumniId = rating.alumni;
    await rating.deleteOne();

    // Recalculate alumni rating stats
    await updateAlumniRatingStats(alumniId);

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark a rating as helpful
// @route   PUT /api/ratings/:ratingId/helpful
// @access  Private
const markRatingHelpful = async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await MentorshipRating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    rating.helpful += 1;
    await rating.save();

    res.json({ 
      message: 'Rating marked as helpful',
      helpfulCount: rating.helpful 
    });
  } catch (error) {
    console.error('Error marking rating as helpful:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get overall platform rating statistics
// @route   GET /api/ratings/stats/platform
// @access  Public
const getPlatformRatingStats = async (req, res) => {
  try {
    const totalRatings = await MentorshipRating.countDocuments();
    
    const avgOverallRating = await MentorshipRating.aggregate([
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$overallRating' },
          avgKnowledge: { $avg: '$categoryRatings.knowledge' },
          avgCommunication: { $avg: '$categoryRatings.communication' },
          avgHelpfulness: { $avg: '$categoryRatings.helpfulness' },
          avgPunctuality: { $avg: '$categoryRatings.punctuality' },
        },
      },
    ]);

    // Get rating distribution
    const distribution = await MentorshipRating.aggregate([
      {
        $group: {
          _id: '$overallRating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json({
      totalRatings,
      averageRatings: avgOverallRating[0] || {},
      distribution: distribution.reduce((acc, curr) => {
        acc[`${curr._id}star`] = curr.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error fetching platform rating stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== Helper Functions ==========

// Calculate rating statistics for an alumni
const calculateRatingStats = async (alumniId) => {
  const ratings = await MentorshipRating.find({ alumni: alumniId });

  if (ratings.length === 0) {
    return {
      overallAvg: 0,
      categoryAvgs: {
        knowledge: 0,
        communication: 0,
        helpfulness: 0,
        punctuality: 0,
      },
      distribution: {},
    };
  }

  const overallAvg = (
    ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length
  ).toFixed(1);

  const categoryAvgs = {
    knowledge: (
      ratings.reduce((sum, r) => sum + r.categoryRatings.knowledge, 0) / ratings.length
    ).toFixed(1),
    communication: (
      ratings.reduce((sum, r) => sum + r.categoryRatings.communication, 0) / ratings.length
    ).toFixed(1),
    helpfulness: (
      ratings.reduce((sum, r) => sum + r.categoryRatings.helpfulness, 0) / ratings.length
    ).toFixed(1),
    punctuality: (
      ratings.reduce((sum, r) => sum + r.categoryRatings.punctuality, 0) / ratings.length
    ).toFixed(1),
  };

  // Calculate distribution (1-5 stars)
  const distribution = ratings.reduce((acc, rating) => {
    const stars = `${rating.overallRating}star`;
    acc[stars] = (acc[stars] || 0) + 1;
    return acc;
  }, {});

  return { overallAvg, categoryAvgs, distribution };
};

// Update alumni user model with rating statistics
const updateAlumniRatingStats = async (alumniId) => {
  try {
    const stats = await calculateRatingStats(alumniId);
    
    await User.findByIdAndUpdate(alumniId, {
      'profile.rating': parseFloat(stats.overallAvg),
      'profile.reviewCount': await MentorshipRating.countDocuments({ alumni: alumniId }),
      'profile.categoryRatings': stats.categoryAvgs,
    });
  } catch (error) {
    console.error('Error updating alumni rating stats:', error);
  }
};

// Update leaderboard points when alumni receives a rating
const updateLeaderboardForRating = async (alumniId, ratingValue) => {
  try {
    const leaderboardService = require('../services/leaderboardService');
    
    // ✅ Award points for receiving rating and update average
    await leaderboardService.trackFiveStarRating(alumniId, ratingValue);
    
    // ✅ Also award points for completing the mentorship session (+20 points)
    // Since rating implies session was completed
    await leaderboardService.trackActivity(alumniId, 'COMPLETE_MENTORSHIP');
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};

module.exports = {
  submitRating,
  getAlumniRatings,
  getStudentRatings,
  getSessionRating,
  updateRating,
  deleteRating,
  markRatingHelpful,
  getPlatformRatingStats,
};
