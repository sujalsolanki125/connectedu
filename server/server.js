const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');

// Load env vars FIRST before any other imports that use them
dotenv.config();

const passport = require('./config/passport');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Express session (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/mock-interviews', require('./routes/mockInterviewRoutes'));
app.use('/api/company-insights', require('./routes/companyInsightRoutes'));
app.use('/api/mentorship', require('./routes/mentorshipRoutes'));
app.use('/api/mentorship-requests', require('./routes/mentorshipRequestRoutes'));
app.use('/api/qa', require('./routes/qaRoutes'));
app.use('/api/resources', require('./routes/placementResourceRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/alumni-features', require('./routes/alumniFeatureRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Serve static assets in production (for Heroku/single-server deployment)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Serve index.html for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  // Root route for development
  app.get('/', (req, res) => {
    res.json({ message: 'Alumni Connect API is running...' });
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start cron jobs for leaderboard auto-updates
const leaderboardCronJobs = require('./jobs/leaderboardCronJobs');
leaderboardCronJobs.startAll();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log('🚀 Leaderboard system initialized with automatic updates');
});
