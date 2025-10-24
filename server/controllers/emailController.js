const { createTransporter, emailTemplates } = require('../config/email');
const User = require('../models/userModel');

// Generic email sending function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"ConnectED" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// @desc    Send welcome email after registration
// @access  Internal use
const sendWelcomeEmail = async (user) => {
  const { subject, html } = emailTemplates.welcome(user.name, user.role);
  return await sendEmail(user.email, subject, html);
};

// @desc    Send mentorship request notification to alumni
// @access  Internal use
const sendMentorshipRequestEmail = async (alumniEmail, alumniName, studentName, message, mentorshipId) => {
  const { subject, html } = emailTemplates.mentorshipRequest(alumniName, studentName, message, mentorshipId);
  return await sendEmail(alumniEmail, subject, html);
};

// @desc    Send mentorship accepted notification to student
// @access  Internal use
const sendMentorshipAcceptedEmail = async (studentEmail, studentName, alumniName, mentorshipId) => {
  const { subject, html } = emailTemplates.mentorshipAccepted(studentName, alumniName, mentorshipId);
  return await sendEmail(studentEmail, subject, html);
};

// @desc    Send interview scheduled notification
// @access  Internal use
const sendInterviewScheduledEmail = async (userEmail, userName, alumniName, dateTime, interviewId, isAlumni) => {
  const { subject, html } = emailTemplates.interviewScheduled(userName, alumniName, dateTime, interviewId, isAlumni);
  return await sendEmail(userEmail, subject, html);
};

// @desc    Send interview reminder (24 hours before)
// @access  Internal use
const sendInterviewReminderEmail = async (userEmail, userName, alumniName, dateTime, interviewId, isAlumni) => {
  const { subject, html } = emailTemplates.interviewReminder(userName, alumniName, dateTime, interviewId, isAlumni);
  return await sendEmail(userEmail, subject, html);
};

// @desc    Send rating request to student after session
// @access  Internal use
const sendRatingRequestEmail = async (studentEmail, studentName, alumniName, sessionType, sessionId) => {
  const { subject, html } = emailTemplates.ratingRequest(studentName, alumniName, sessionType, sessionId);
  return await sendEmail(studentEmail, subject, html);
};

// @desc    Send rating received notification to alumni
// @access  Internal use
const sendRatingReceivedEmail = async (alumniEmail, alumniName, studentName, rating, review) => {
  const { subject, html } = emailTemplates.ratingReceived(alumniName, studentName, rating, review);
  return await sendEmail(alumniEmail, subject, html);
};

// @desc    Test email endpoint (for development)
// @route   POST /api/emails/test
// @access  Private (Admin only)
const sendTestEmail = async (req, res) => {
  try {
    const { to, type } = req.body;

    if (!to) {
      return res.status(400).json({ message: 'Email recipient is required' });
    }

    let result;
    const testUser = await User.findOne({ email: to });

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(testUser || { name: 'Test User', email: to, role: 'student' });
        break;
      case 'mentorship-request':
        result = await sendMentorshipRequestEmail(to, 'Alumni Name', 'Student Name', 'Test message', '123456');
        break;
      case 'mentorship-accepted':
        result = await sendMentorshipAcceptedEmail(to, 'Student Name', 'Alumni Name', '123456');
        break;
      case 'interview-scheduled':
        result = await sendInterviewScheduledEmail(to, 'Test User', 'Alumni Name', new Date(), '123456', false);
        break;
      case 'interview-reminder':
        result = await sendInterviewReminderEmail(to, 'Test User', 'Alumni Name', new Date(), '123456', false);
        break;
      case 'rating-request':
        result = await sendRatingRequestEmail(to, 'Student Name', 'Alumni Name', 'mentorship', '123456');
        break;
      case 'rating-received':
        result = await sendRatingReceivedEmail(to, 'Alumni Name', 'Student Name', 5, 'Great session!');
        break;
      default:
        return res.status(400).json({ message: 'Invalid email type' });
    }

    if (result.success) {
      res.json({ message: 'Test email sent successfully', messageId: result.messageId });
    } else {
      res.status(500).json({ message: 'Failed to send test email', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error sending test email', error: error.message });
  }
};

// @desc    Get email configuration status
// @route   GET /api/emails/status
// @access  Private (Admin only)
const getEmailStatus = async (req, res) => {
  try {
    const isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    
    res.json({
      configured: isConfigured,
      emailUser: process.env.EMAIL_USER || 'Not configured',
      service: 'Gmail',
      status: isConfigured ? 'ready' : 'needs configuration',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking email status', error: error.message });
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendMentorshipRequestEmail,
  sendMentorshipAcceptedEmail,
  sendInterviewScheduledEmail,
  sendInterviewReminderEmail,
  sendRatingRequestEmail,
  sendRatingReceivedEmail,
  sendTestEmail,
  getEmailStatus,
};
