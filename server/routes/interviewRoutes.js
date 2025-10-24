const express = require('express');
const router = express.Router();
const {
  getInterviewExperiences,
  getInterviewExperienceById,
  createInterviewExperience,
  updateInterviewExperience,
  deleteInterviewExperience,
  rateInterviewExperience,
  markAsHelpful,
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getInterviewExperiences)
  .post(protect, authorize('alumni', 'admin'), createInterviewExperience);

router.route('/:id/rate').post(protect, rateInterviewExperience);

router.route('/:id/helpful').put(protect, markAsHelpful);

router
  .route('/:id')
  .get(protect, getInterviewExperienceById)
  .put(protect, authorize('alumni', 'admin'), updateInterviewExperience)
  .delete(protect, authorize('alumni', 'admin'), deleteInterviewExperience);

module.exports = router;
