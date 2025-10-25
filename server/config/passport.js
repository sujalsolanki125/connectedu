const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

// Temporary storage for new Google users (use Redis in production)
global.pendingGoogleUsers = global.pendingGoogleUsers || new Map();

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '${process.env.BACKEND_URL}/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Existing user found - return user with flag
          user.isExistingUser = true;
          return done(null, user);
        }

        // Check if user exists with this email (from regular registration)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.profile.avatar = user.profile.avatar || profile.photos[0].value;
          await user.save();
          user.isExistingUser = true;
          return done(null, user);
        }

        // NEW USER - Store temporarily and return a special object
        const tempUserId = `temp_${profile.id}_${Date.now()}`;
        const tempUserData = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value || '',
          tempUserId,
        };

        // Store in temporary map (expires after 10 minutes)
        global.pendingGoogleUsers.set(tempUserId, tempUserData);
        setTimeout(() => {
          global.pendingGoogleUsers.delete(tempUserId);
        }, 10 * 60 * 1000);

        // Return the temp user data with a flag
        return done(null, { isNewUser: true, tempUserId, ...tempUserData });
      } catch (error) {
        console.error('Error in Google Strategy:', error);
        done(error, null);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  if (user.isNewUser) {
    // For new users, store the tempUserId
    done(null, { tempUserId: user.tempUserId, isNewUser: true });
  } else {
    // For existing users, store the MongoDB _id
    done(null, { userId: user._id.toString(), isNewUser: false });
  }
});

// Deserialize user from the session
passport.deserializeUser(async (sessionData, done) => {
  try {
    if (sessionData.isNewUser) {
      // Return temporary user data
      const tempUser = global.pendingGoogleUsers.get(sessionData.tempUserId);
      if (tempUser) {
        done(null, tempUser);
      } else {
        done(new Error('Session expired. Please sign in again.'), null);
      }
    } else {
      // Fetch existing user from database
      const user = await User.findById(sessionData.userId).select('-password');
      done(null, user);
    }
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
