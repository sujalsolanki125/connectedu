const express = require('express');
const router = express.Router();
const {
  getAllResources,
  downloadResource,
  rateResource,
  getMyRating,
} = require('../controllers/resourceController');

const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/resources
// @desc    Get all resources from all alumni
// @access  Public
router.get('/', getAllResources);

// @route   POST /api/resources/:resourceId/download
// @desc    Download a resource and increment download count
// @access  Private (Student)
router.post('/:resourceId/download', protect, downloadResource);

// @route   POST /api/resources/:resourceId/rate
// @desc    Rate a resource
// @access  Private (Student)
router.post('/:resourceId/rate', protect, rateResource);

// @route   GET /api/resources/:resourceId/my-rating
// @desc    Get student's rating for a specific resource
// @access  Private (Student)
router.get('/:resourceId/my-rating', protect, getMyRating);

module.exports = router;
