const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password, not regular password
    },
  });
};

// Email templates
const emailTemplates = {
  // Welcome email after registration
  welcome: (userName, userRole) => ({
    subject: '🎉 Welcome to ConnectED Platform!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ConnectED! 🎓</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>We're excited to have you join our community as a <strong>${userRole}</strong>.</p>
            
            ${userRole === 'student' ? `
              <p>As a student, you can:</p>
              <ul>
                <li>🎯 Schedule mock interviews with alumni</li>
                <li>👥 Connect with mentors for career guidance</li>
                <li>📚 Access company insights and resources</li>
                <li>❓ Ask questions in our Q&A forum</li>
              </ul>
            ` : `
              <p>As an alumni, you can:</p>
              <ul>
                <li>🎓 Mentor students and share your experience</li>
                <li>💼 Conduct mock interviews</li>
                <li>📝 Share company insights</li>
                <li>🏆 Climb the leaderboard by helping others</li>
              </ul>
            `}
            
            <p>Get started by completing your profile and exploring the platform!</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" class="button">Complete Your Profile</a>
          </div>
          <div class="footer">
            <p>© 2025 AlumniConnect. All rights reserved.</p>
            <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Mentorship request notification
  mentorshipRequest: (alumniName, studentName, message, mentorshipId) => ({
    subject: '🤝 New Mentorship Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .button.decline { background: #e74c3c; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Mentorship Request 🤝</h1>
          </div>
          <div class="content">
            <h2>Hi ${alumniName}!</h2>
            <p><strong>${studentName}</strong> has requested you as a mentor.</p>
            
            <div class="message-box">
              <h3>Message from ${studentName}:</h3>
              <p>${message || 'No message provided'}</p>
            </div>
            
            <p>You can accept or decline this request from your dashboard.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/mentorship/${mentorshipId}" class="button">View Request</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 AlumniConnect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Mentorship accepted notification
  mentorshipAccepted: (studentName, alumniName, mentorshipId) => ({
    subject: '✅ Your Mentorship Request Was Accepted!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Great News!</h1>
          </div>
          <div class="content">
            <h2>Hi ${studentName}!</h2>
            <p><strong>${alumniName}</strong> has accepted your mentorship request!</p>
            
            <p>You can now:</p>
            <ul>
              <li>💬 Start messaging your mentor</li>
              <li>📅 Schedule mentorship sessions</li>
              <li>🎯 Set your career goals together</li>
            </ul>
            
            <p>Make the most of this opportunity!</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/mentorship/${mentorshipId}" class="button">Go to Mentorship</a>
          </div>
          <div class="footer">
            <p>© 2025 AlumniConnect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Interview scheduled notification
  interviewScheduled: (userName, alumniName, dateTime, interviewId, isAlumni) => ({
    subject: '📅 Mock Interview Scheduled',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Interview Scheduled 📅</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>${isAlumni ? 'You have a new mock interview scheduled.' : `Your mock interview with <strong>${alumniName}</strong> is confirmed!`}</p>
            
            <div class="info-box">
              <h3>📌 Interview Details:</h3>
              <p><strong>Date & Time:</strong> ${new Date(dateTime).toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>${isAlumni ? 'Interviewee' : 'Interviewer'}:</strong> ${alumniName}</p>
            </div>
            
            ${!isAlumni ? `
              <p><strong>Tips to prepare:</strong></p>
              <ul>
                <li>Review the job description</li>
                <li>Practice common interview questions</li>
                <li>Prepare questions for the interviewer</li>
                <li>Test your internet connection</li>
              </ul>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/interviews/${interviewId}" class="button">View Interview Details</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 AlumniConnect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Interview reminder (24 hours before)
  interviewReminder: (userName, alumniName, dateTime, interviewId, isAlumni) => ({
    subject: '⏰ Interview Reminder - Tomorrow!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Interview Reminder</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <div class="alert-box">
              <p><strong>Your interview is tomorrow!</strong></p>
              <p>Date & Time: ${new Date(dateTime).toLocaleString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p>${isAlumni ? 'Interviewee' : 'Interviewer'}: ${alumniName}</p>
            </div>
            
            <p>Don't forget to prepare and join on time!</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/interviews/${interviewId}" class="button">View Details</a>
          </div>
          <div class="footer">
            <p>© 2025 AlumniConnect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Rating request notification
  ratingRequest: (studentName, alumniName, sessionType, sessionId) => ({
    subject: '⭐ Please Rate Your Session',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rate Your Session ⭐</h1>
          </div>
          <div class="content">
            <h2>Hi ${studentName}!</h2>
            <p>How was your ${sessionType} session with <strong>${alumniName}</strong>?</p>
            
            <p>Your feedback helps us improve the platform and helps other students make informed decisions.</p>
            
            <p>It only takes a minute!</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/${sessionType === 'mentorship' ? 'mentorship' : 'interviews'}/${sessionId}" class="button">Leave a Rating</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 AlumniConnect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // New rating received notification
  ratingReceived: (alumniName, studentName, rating, review) => ({
    subject: '⭐ You Received a New Rating!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .rating-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .stars { font-size: 32px; color: #f59e0b; }
          .review-box { background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Rating Received! 🌟</h1>
          </div>
          <div class="content">
            <h2>Hi ${alumniName}!</h2>
            <p><strong>${studentName}</strong> has rated your session.</p>
            
            <div class="rating-box">
              <div class="stars">${'⭐'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}</div>
              <p style="font-size: 24px; margin: 10px 0;"><strong>${rating}/5</strong></p>
            </div>
            
            ${review ? `
              <div class="review-box">
                <h3>Review:</h3>
                <p>"${review}"</p>
              </div>
            ` : ''}
            
            <p>Keep up the great work! 🎉</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" class="button">View Your Profile</a>
          </div>
          <div class="footer">
            <p>© 2025 AlumniConnect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

module.exports = {
  createTransporter,
  emailTemplates,
};
