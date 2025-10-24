const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail } = require('./emailController');
const { sendVerificationEmail } = require('./emailVerificationController');
const { validateEmail, isDisposableEmail } = require('../utils/emailValidator');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role - only allow 'student' or 'alumni' for public registration
    if (role && !['student', 'alumni'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Only student or alumni roles are allowed.' });
    }

    // ✅ STEP 1: Validate email format and domain BEFORE creating user
    
    // Check for disposable/temporary email
    if (isDisposableEmail(email)) {
      return res.status(400).json({ 
        message: 'Temporary/disposable email addresses are not allowed. Please use a real email address.' 
      });
    }

    // Validate email domain (checks MX records)
    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ 
        message: emailValidation.message 
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ STEP 2: Create user only AFTER email validation passes
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student', // Default to 'student' if not provided
      isProfileComplete: false, // New users need to complete profile
      isEmailVerified: false, // Email not verified yet
      lastLogin: new Date(),
    });

    if (user) {
      // Send email verification (this is critical, so we wait for it)
      try {
        await sendVerificationEmail(user);
        
        // Don't send token yet - user must verify email first
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: false,
          message: 'Account created! Please check your email for verification code.',
          requiresVerification: true,
        });
      } catch (emailError) {
        // If email fails, delete the user and inform them
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ 
          message: 'Failed to send verification email. Please check your email address and try again.' 
        });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if email is verified (skip for Google OAuth users)
      if (!user.isEmailVerified && !user.googleId) {
        return res.status(403).json({ 
          message: 'Please verify your email before logging in',
          requiresVerification: true,
          email: user.email
        });
      }

      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth callback handler
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = async (req, res) => {
  try {
    

    // Check if passport authentication failed
    if (!req.user) {
      // Error handled silently
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=authentication_failed`);
    }

    // Check if this is a new user (has isNewUser flag but no _id)
    if (req.user.isNewUser && !req.user._id) {
      // NEW USER - Redirect to role selection page
      const { tempUserId, name, email, googleId, avatar } = req.user;
      
      const query = new URLSearchParams({
        tempUserId,
        name,
        email,
        googleId,
        avatar: avatar || '',
      }).toString();
      
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/register-google?${query}`);
    }

    // EXISTING USER - Has _id from database
    if (req.user._id) {
      // Update last login
      req.user.lastLogin = new Date();
      await req.user.save();

      // Generate token
      const token = generateToken(req.user._id);

      // Redirect to the frontend Google callback handler with token
      // The frontend will then fetch the profile and redirect to appropriate page
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/success?token=${token}`);
    }

    // Fallback - shouldn't reach here
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=authentication_failed`);

  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=authentication_failed`);
  }
};

// @desc    Google OAuth failure handler
// @route   GET /api/auth/google/failure
// @access  Public
const googleAuthFailure = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
};

// @desc    Register a new user from Google sign-in
// @route   POST /api/auth/register-google
// @access  Public
const registerGoogleUser = async (req, res) => {
  try {
    const { tempUserId, role } = req.body;

    

    // Validate role
    if (!['student', 'alumni'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified. Must be student or alumni.' });
    }

    // Retrieve temp user data from storage
    const tempUserData = global.pendingGoogleUsers.get(tempUserId);
    
    if (!tempUserData) {
      return res.status(400).json({ 
        message: 'Registration session expired. Please sign in with Google again.' 
      });
    }

    const { googleId, name, email, avatar } = tempUserData;

    // Double-check user doesn't already exist
    const userExists = await User.findOne({ 
      $or: [{ email }, { googleId }] 
    });
    
    if (userExists) {
      // Clean up temp storage
      global.pendingGoogleUsers.delete(tempUserId);
      return res.status(400).json({ message: 'A user with this email or Google account already exists.' });
    }

    // Create the user
    const user = await User.create({
      name,
      email,
      googleId,
      role,
      profile: { avatar },
      isProfileComplete: false, // New users must complete their profile
      isEmailVerified: true, // Google users are pre-verified
      lastLogin: new Date(),
      password: Math.random().toString(36).slice(-8), // Random password (not used for Google login)
    });

    // Clean up temp storage
    global.pendingGoogleUsers.delete(tempUserId);

    if (user) {
      // Send welcome email (non-blocking)
      sendWelcomeEmail(user).catch(() => {
        // Email failure shouldn't block registration
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  googleAuthCallback,
  googleAuthFailure,
  registerGoogleUser,
};
