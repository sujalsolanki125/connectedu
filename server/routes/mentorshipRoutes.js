const express = require('express');
const router = express.Router();
const {
  getMentorshipSessions,
  getMentorshipById,
  createMentorshipSession,
  bookMentorshipSession,
  updateMentorshipSession,
  addMentorshipFeedback,
  deleteMentorshipSession,
} = require('../controllers/mentorshipController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getMentorshipSessions)
  .post(protect, authorize('alumni', 'admin'), createMentorshipSession);

router.route('/:id/book').put(protect, authorize('student'), bookMentorshipSession);

router.route('/:id/feedback').post(protect, addMentorshipFeedback);

router
  .route('/:id')
  .get(protect, getMentorshipById)
  .put(protect, updateMentorshipSession)
  .delete(protect, deleteMentorshipSession);

module.exports = router;
