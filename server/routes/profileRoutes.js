const express = require('express');
const router = express.Router();
const {
  checkProfileCompletion,
  getStudentProfile,
  updateStudentProfile,
  getAlumniProfile,
  updateAlumniProfile,
  updateLastLogin,
  uploadProfilePicture,
  deleteProfilePicture,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../config/cloudinary');

// All routes are protected (require authentication)
router.use(protect);

// Check if profile is complete
router.get('/check-completion', checkProfileCompletion);

// Update last login
router.put('/update-login', updateLastLogin);

// Profile picture routes
router.post('/upload-avatar', uploadProfileImage.single('avatar'), uploadProfilePicture);
router.delete('/avatar', deleteProfilePicture);

// Student profile routes
router.get('/student', getStudentProfile);
router.put('/student', updateStudentProfile);

// Alumni profile routes
router.get('/alumni', getAlumniProfile);
router.put('/alumni', updateAlumniProfile);

module.exports = router;
