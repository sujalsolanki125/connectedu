const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Request password reset (send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Check if user registered with Google OAuth
    if (user.googleId && !user.password) {
      return res.status(400).json({ 
        message: 'This account was created using Google Sign-In. Please use Google to login.' 
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database (expires in 15 minutes)
    user.passwordResetOTP = otp;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: {
        name: 'ConnectEd - Alumni Platform',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Password Reset OTP - ConnectEd',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
            }
            .otp-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 10px 0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello, ${user.name}!</h2>
              <p>We received a request to reset your password for your ConnectEd account.</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 12px;">Valid for 15 minutes</p>
              </div>

              <p><strong>To reset your password:</strong></p>
              <ol>
                <li>Enter this OTP on the password reset page</li>
                <li>Create your new password</li>
                <li>Confirm your new password</li>
                <li>Click "Save Password"</li>
              </ol>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This OTP will expire in <strong>15 minutes</strong></li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will remain unchanged</li>
                </ul>
              </div>

              <p>If you continue to have problems, please contact our support team.</p>
            </div>
            <div class="footer">
              <p><strong>ConnectEd - Alumni Mentorship Platform</strong></p>
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; 2025 ConnectEd. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      email: email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'Invalid email address' });
    }

    // Check if OTP exists
    if (!user.passwordResetOTP) {
      return res.status(400).json({ message: 'No password reset request found. Please request a new OTP.' });
    }

    // Check if OTP has expired
    if (Date.now() > user.passwordResetExpires) {
      user.passwordResetOTP = null;
      user.passwordResetExpires = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (user.passwordResetOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }
    
    // Update password - the pre-save hook will hash it automatically
    user.password = newPassword;
    user.passwordResetOTP = null;
    user.passwordResetExpires = null;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      from: {
        name: 'ConnectEd - Alumni Platform',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Password Successfully Reset - ConnectEd',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 40px 30px;
            }
            .success-icon {
              text-align: center;
              font-size: 60px;
              margin: 20px 0;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <h2>Hello, ${user.name}!</h2>
              <p>Your password has been successfully reset.</p>
              <p>You can now log in to your ConnectEd account using your new password.</p>
              <p><strong>Important Security Tips:</strong></p>
              <ul>
                <li>Keep your password secure and don't share it with anyone</li>
                <li>Use a strong, unique password</li>
                <li>If you didn't make this change, contact support immediately</li>
              </ul>
            </div>
            <div class="footer">
              <p><strong>ConnectEd - Alumni Mentorship Platform</strong></p>
              <p>&copy; 2025 ConnectEd. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-reset-otp
// @access  Public
const resendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate new OTP
    const otp = generateOTP();

    user.passwordResetOTP = otp;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send OTP email (same template as forgotPassword)
    const mailOptions = {
      from: {
        name: 'ConnectEd - Alumni Platform',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'New Password Reset OTP - ConnectEd',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
            .content { padding: 40px 30px; }
            .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>🔐 New Password Reset OTP</h1></div>
            <div class="content">
              <h2>Hello, ${user.name}!</h2>
              <p>Here is your new OTP for password reset:</p>
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px;">Your New OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 12px;">Valid for 15 minutes</p>
              </div>
              <p>Please use this OTP to complete your password reset.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  resendResetOTP,
};
