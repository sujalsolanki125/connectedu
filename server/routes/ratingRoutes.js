const express = require('express');
const router = express.Router();
const {
  submitRating,
  getAlumniRatings,
  getStudentRatings,
  getSessionRating,
  updateRating,
  deleteRating,
  markRatingHelpful,
  getPlatformRatingStats,
} = require('../controllers/ratingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Submit a new rating (Students only)
router.post('/', protect, authorize('student'), submitRating);

// Get all ratings for a specific alumni (Public)
router.get('/alumni/:alumniId', getAlumniRatings);

// Get ratings submitted by a student (Private - Student or Admin only)
router.get('/student/:studentId', protect, getStudentRatings);

// Get rating for a specific mentorship session (Private)
router.get('/session/:sessionId', protect, getSessionRating);

// Get platform-wide rating statistics (Public)
router.get('/stats/platform', getPlatformRatingStats);

// Update a rating (Student who created it)
router.put('/:ratingId', protect, authorize('student'), updateRating);

// Delete a rating (Student who created it or Admin)
router.delete('/:ratingId', protect, deleteRating);

// Mark a rating as helpful (Any authenticated user)
router.put('/:ratingId/helpful', protect, markRatingHelpful);

module.exports = router;
