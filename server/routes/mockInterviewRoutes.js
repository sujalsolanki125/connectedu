const express = require('express');
const router = express.Router();
const {
  getMockInterviews,
  getMockInterviewById,
  createMockInterview,
  bookMockInterview,
  updateMockInterviewStatus,
  deleteMockInterview,
  markAsHelpful,
} = require('../controllers/mockInterviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getMockInterviews)
  .post(protect, authorize('alumni', 'admin'), createMockInterview);

router.route('/:id/book').put(protect, authorize('student'), bookMockInterview);

router.route('/:id/status').put(protect, updateMockInterviewStatus);

router.route('/:id/helpful').put(protect, markAsHelpful);

router
  .route('/:id')
  .get(protect, getMockInterviewById)
  .delete(protect, authorize('alumni'), deleteMockInterview);

module.exports = router;
