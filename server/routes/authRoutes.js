const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  registerUser,
  loginUser,
  getUserProfile,
  googleAuthCallback,
  googleAuthFailure,
  registerGoogleUser,
} = require('../controllers/authController');
const { verifyEmail, resendVerificationEmail } = require('../controllers/emailVerificationController');
const { forgotPassword, resetPassword, resendResetOTP } = require('../controllers/passwordResetController');
const { protect } = require('../middleware/authMiddleware');

// Regular auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/register-google', registerGoogleUser);
router.get('/profile', protect, getUserProfile);

// Email verification routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-reset-otp', resendResetOTP);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/google/failure'
  }),
  googleAuthCallback
);

router.get('/google/failure', googleAuthFailure);

module.exports = router;
