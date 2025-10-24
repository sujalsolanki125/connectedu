const User = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// @desc    Send verification email
// @access  Internal
const sendVerificationEmail = async (user) => {
  try {
    // Generate verification token (6-digit code)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (24 hours)
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Save token to user
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = expirationTime;
    await user.save();

    // Email HTML template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            color: rgba(255, 255, 255, 0.9);
            margin: 10px 0 0 0;
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .content h2 {
            color: #333;
            margin: 0 0 20px 0;
            font-size: 24px;
          }
          .content p {
            color: #666;
            line-height: 1.6;
            margin: 0 0 30px 0;
            font-size: 16px;
          }
          .verification-code {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            padding: 20px 40px;
            border-radius: 12px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          .expiry-notice {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin: 30px 0;
            border-radius: 8px;
            text-align: left;
          }
          .expiry-notice p {
            color: #856404;
            margin: 0;
            font-size: 14px;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            color: #6c757d;
            font-size: 14px;
            margin: 5px 0;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          .security-notice {
            background: #e7f3ff;
            border-left: 4px solid #2196f3;
            padding: 15px 20px;
            margin: 30px 0;
            border-radius: 8px;
            text-align: left;
          }
          .security-notice p {
            color: #014361;
            margin: 0;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎓 ConnectEd</h1>
            <p>Alumni Mentorship Platform</p>
          </div>
          
          <div class="content">
            <h2>Welcome, ${user.name}! 👋</h2>
            <p>Thank you for registering with ConnectEd. To complete your registration and verify your email address, please use the verification code below:</p>
            
            <div class="verification-code">${verificationToken}</div>
            
            <div class="expiry-notice">
              <p><strong>⏰ Important:</strong> This code will expire in 24 hours. Please verify your email as soon as possible.</p>
            </div>
            
            <div class="security-notice">
              <p><strong>🔒 Security Notice:</strong> If you didn't create an account with ConnectEd, please ignore this email. Your email address will not be used without verification.</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>ConnectEd - Alumni Mentorship Platform</strong></p>
            <p>Connect with alumni mentors and accelerate your career</p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
              © 2025 ConnectEd. All rights reserved.<br>
              Made by Sujalkumar Solanki
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: `"ConnectEd Platform" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎓 Verify Your Email - ConnectEd',
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);
    
    return { success: true, token: verificationToken };
  } catch (error) {
    throw new Error('Failed to send verification email');
  }
};

// @desc    Verify email with token
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Check if token matches
    if (user.emailVerificationToken !== token) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check if token expired
    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ 
        message: 'Verification code has expired. Please request a new one.',
        expired: true 
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now access all features.',
    });

  } catch (error) {
    // Error handled silently
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Send new verification email
    await sendVerificationEmail(user);

    res.json({
      success: true,
      message: 'Verification code sent successfully! Please check your email.',
    });

  } catch (error) {
    // Error handled silently
    res.status(500).json({ message: 'Failed to resend verification email' });
  }
};

module.exports = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
};
