const express = require('express');
const router = express.Router();
const { sendTestEmail, getEmailStatus } = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Test email endpoint (development only)
router.post('/test', protect, authorize('admin'), sendTestEmail);

// Get email configuration status
router.get('/status', protect, authorize('admin'), getEmailStatus);

module.exports = router;
