const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// @desc    Send contact form email
// @route   POST /api/contact/send
// @access  Public
router.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'connected.platform1250@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER || 'connected.platform1250@gmail.com',
      to: 'connected.platform1250@gmail.com',
      subject: `ConnectEd Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .field {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f3f4f6;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .label {
              font-weight: bold;
              color: #667eea;
              margin-bottom: 5px;
            }
            .value {
              color: #374151;
              word-wrap: break-word;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 New Contact Form Submission</h1>
              <p>ConnectEd Platform</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">From:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="footer">
                <p>Received on ${new Date().toLocaleString('en-US', { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Email to user (confirmation)
    const userMailOptions = {
      from: process.env.EMAIL_USER || 'connected.platform1250@gmail.com',
      to: email,
      subject: 'Thank you for contacting ConnectEd',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              background: white;
              padding: 40px 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .message {
              background-color: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
            }
            .details {
              background-color: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #667eea;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓</div>
              <h1>Thank You for Reaching Out!</h1>
              <p>ConnectEd Platform</p>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <div class="message">
                <p><strong>Thank you for connecting with us!</strong></p>
                <p>We have successfully received your message and our team will review it carefully. We'll get back to you with an answer as soon as possible.</p>
              </div>
              
              <h3>Your Message Details:</h3>
              <div class="details">
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Submitted on:</strong> ${new Date().toLocaleString('en-US', { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}</p>
              </div>

              <p>While you wait, feel free to:</p>
              <ul>
                <li>Explore our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/faq" style="color: #667eea;">FAQ section</a></li>
                <li>Browse <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/interviews" style="color: #667eea;">interview experiences</a></li>
                <li>Connect with <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/mentorship" style="color: #667eea;">alumni mentors</a></li>
              </ul>

              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Visit ConnectEd</a>
              </center>

              <div class="footer">
                <p><strong>ConnectEd</strong></p>
                <p>Bridging the gap between students and alumni</p>
                <div class="social-links">
                  <a href="mailto:connected.platform1250@gmail.com">📧 Email</a>
                  <a href="#">🔗 LinkedIn</a>
                  <a href="#">🐦 Twitter</a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                  This is an automated message. Please do not reply directly to this email.
                  If you have additional questions, please submit another contact form or email us at 
                  <a href="mailto:connected.platform1250@gmail.com" style="color: #667eea;">connected.platform1250@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully. Check your email for confirmation.'
    });

  } catch (error) {
    // Error handled silently
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

module.exports = router;
