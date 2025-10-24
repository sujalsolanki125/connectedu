const express = require('express');
const router = express.Router();
const {
  uploadProfileImage: uploadProfileImageHandler,
  uploadResume: uploadResumeHandler,
  deleteResume,
  uploadResource: uploadResourceHandler,
  deleteResource,
  getUserResources,
  incrementDownloadCount,
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  uploadProfileImage,
  uploadResume,
  uploadResource,
} = require('../config/cloudinary');

// Profile Image Upload (All authenticated users)
router.post(
  '/profile-image',
  protect,
  uploadProfileImage.single('profileImage'),
  uploadProfileImageHandler
);

// Resume Upload (Students only)
router.post(
  '/resume',
  protect,
  authorize('student'),
  uploadResume.single('resume'),
  uploadResumeHandler
);

// Delete Resume (Students only)
router.delete('/resume', protect, authorize('student'), deleteResume);

// Resource File Upload (Alumni only)
router.post(
  '/resource',
  protect,
  authorize('alumni'),
  uploadResource.single('resourceFile'),
  uploadResourceHandler
);

// Get User's Resources (Private)
router.get('/resources', protect, getUserResources);

// Delete Resource (Alumni only - own resources)
router.delete('/resource/:resourceId', protect, authorize('alumni'), deleteResource);

// Increment Download Count (Public)
router.put('/resource/:resourceId/download', incrementDownloadCount);

module.exports = router;
