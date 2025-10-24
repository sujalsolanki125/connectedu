const express = require('express');
const router = express.Router();
const {
  createMentorshipRequest,
  getAlumniRequests,
  getStudentRequests,
  acceptRequest,
  rejectRequest,
  archiveRequest,
  getAlumniStats,
} = require('../controllers/mentorshipRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student routes
router.post('/', protect, authorize('student'), createMentorshipRequest);
router.get('/student', protect, authorize('student'), getStudentRequests);

// Alumni routes
router.get('/alumni', protect, authorize('alumni', 'admin'), getAlumniRequests);
router.get('/alumni/stats', protect, authorize('alumni'), getAlumniStats);
router.put('/:id/accept', protect, authorize('alumni', 'admin'), acceptRequest);
router.put('/:id/reject', protect, authorize('alumni', 'admin'), rejectRequest);
router.put('/:id/archive', protect, authorize('alumni', 'admin'), archiveRequest);

module.exports = router;
