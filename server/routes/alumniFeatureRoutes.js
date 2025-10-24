const express = require('express');
const router = express.Router();
const {
  // Interview Experiences
  addInterviewExperience,
  getAllInterviewExperiences,
  getMyInterviewExperiences,
  updateInterviewExperience,
  deleteInterviewExperience,
  markAsHelpful,

  // Workshops & Mentorship
  createWorkshop,
  getAllWorkshops,
  getMyWorkshops,
  updateWorkshop,
  deleteWorkshop,
  bookWorkshop,
  updateBookingStatus,
  getMyBookings,

  // Achievements & Milestones
  getAlumniAchievements,
  submitFeedback,
  getLeaderboard,
  getMyAchievements,
  getMyFeedback,
} = require('../controllers/alumniFeatureController');

const { protect } = require('../middleware/authMiddleware');

// ========================================
// INTERVIEW EXPERIENCES ROUTES
// ========================================

// @route   POST /api/alumni-features/interview-experience
// @desc    Add new interview experience
// @access  Private (Alumni only)
router.post('/interview-experience', protect, addInterviewExperience);

// @route   GET /api/alumni-features/interview-experiences
// @desc    Get all interview experiences (with optional filters)
// @access  Public
router.get('/interview-experiences', getAllInterviewExperiences);

// @route   GET /api/alumni-features/my-interview-experiences
// @desc    Get alumni's own interview experiences
// @access  Private (Alumni only)
router.get('/my-interview-experiences', protect, getMyInterviewExperiences);

// @route   PUT /api/alumni-features/interview-experience/:experienceId
// @desc    Update interview experience
// @access  Private (Alumni only - own experiences)
router.put('/interview-experience/:experienceId', protect, updateInterviewExperience);

// @route   DELETE /api/alumni-features/interview-experience/:experienceId
// @desc    Delete interview experience
// @access  Private (Alumni only - own experiences)
router.delete('/interview-experience/:experienceId', protect, deleteInterviewExperience);

// @route   PUT /api/alumni-features/interview-experience/:experienceId/helpful
// @desc    Mark interview experience as helpful
// @access  Private (Students)
router.put('/interview-experience/:experienceId/helpful', protect, markAsHelpful);

// ========================================
// WORKSHOPS & MENTORSHIP ROUTES
// ========================================

// @route   POST /api/alumni-features/workshop
// @desc    Create new workshop/mentorship session
// @access  Private (Alumni only)
router.post('/workshop', protect, createWorkshop);

// @route   GET /api/alumni-features/workshops
// @desc    Get all available workshops (with optional filters)
// @access  Public
router.get('/workshops', getAllWorkshops);

// @route   GET /api/alumni-features/my-workshops
// @desc    Get alumni's own workshops
// @access  Private (Alumni only)
router.get('/my-workshops', protect, getMyWorkshops);

// @route   PUT /api/alumni-features/workshop/:workshopId
// @desc    Update workshop
// @access  Private (Alumni only - own workshops)
router.put('/workshop/:workshopId', protect, updateWorkshop);

// @route   DELETE /api/alumni-features/workshop/:workshopId
// @desc    Delete/Deactivate workshop
// @access  Private (Alumni only - own workshops)
router.delete('/workshop/:workshopId', protect, deleteWorkshop);

// @route   POST /api/alumni-features/workshop/:workshopId/book
// @desc    Book a workshop session (for students)
// @access  Private (Students)
router.post('/workshop/:workshopId/book', protect, bookWorkshop);

// @route   GET /api/alumni-features/my-bookings
// @desc    Get student's workshop bookings
// @access  Private (Students)
router.get('/my-bookings', protect, getMyBookings);

// @route   PUT /api/alumni-features/workshop/:workshopId/booking/:bookingId
// @desc    Update booking status (confirm/cancel/complete)
// @access  Private (Alumni only)
router.put('/workshop/:workshopId/booking/:bookingId', protect, updateBookingStatus);

// ========================================
// ACHIEVEMENTS & MILESTONES ROUTES
// ========================================

// @route   GET /api/alumni-features/achievements/:alumniId
// @desc    Get alumni achievements (public view)
// @access  Public
router.get('/achievements/:alumniId', getAlumniAchievements);

// @route   GET /api/alumni-features/my-achievements
// @desc    Get my achievements (alumni dashboard)
// @access  Private (Alumni only)
router.get('/my-achievements', protect, getMyAchievements);

// @route   GET /api/alumni-features/my-feedback
// @desc    Get feedback received from students
// @access  Private (Alumni only)
router.get('/my-feedback', protect, getMyFeedback);

// @route   POST /api/alumni-features/feedback
// @desc    Submit feedback after mentorship session
// @access  Private (Students)
router.post('/feedback', protect, submitFeedback);

// @route   GET /api/alumni-features/leaderboard
// @desc    Get top alumni leaderboard
// @access  Public
router.get('/leaderboard', getLeaderboard);

module.exports = router;
