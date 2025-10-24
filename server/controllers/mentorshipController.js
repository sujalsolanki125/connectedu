const Mentorship = require('../models/mentorshipModel');
const Leaderboard = require('../models/leaderboardModel');
const User = require('../models/userModel');
const { 
  sendMentorshipRequestEmail, 
  sendMentorshipAcceptedEmail,
  sendRatingRequestEmail 
} = require('./emailController');

// @desc    Get all mentorship sessions
// @route   GET /api/mentorship
// @access  Private
const getMentorshipSessions = async (req, res) => {
  try {
    const { category, status, expertise } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (expertise) query.expertise = { $in: [expertise] };

    const sessions = await Mentorship.find(query)
      .populate('mentor', 'name email profile')
      .populate('mentee', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single mentorship session
// @route   GET /api/mentorship/:id
// @access  Private
const getMentorshipById = async (req, res) => {
  try {
    const session = await Mentorship.findById(req.params.id)
      .populate('mentor', 'name email profile')
      .populate('mentee', 'name email');
    
    if (session) {
      res.json(session);
    } else {
      res.status(404).json({ message: 'Mentorship session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create mentorship session
// @route   POST /api/mentorship
// @access  Private (Alumni/Admin)
const createMentorshipSession = async (req, res) => {
  try {
    const session = await Mentorship.create({
      mentor: req.user._id,
      ...req.body,
    });

    // Update leaderboard
    await updateLeaderboardPoints(req.user._id, 'mentorshipSessions');

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book mentorship session
// @route   PUT /api/mentorship/:id/book
// @access  Private (Student)
const bookMentorshipSession = async (req, res) => {
  try {
    const { slotId, message } = req.body;
    const session = await Mentorship.findById(req.params.id)
      .populate('mentor', 'name email');

    if (session) {
      if (session.mentee) {
        return res.status(400).json({ message: 'Session already booked' });
      }

      // Mark slot as booked
      const slot = session.availableSlots.id(slotId);
      if (slot) {
        slot.isBooked = true;
      }

      session.mentee = req.user._id;
      session.status = 'Scheduled';
      
      const updatedSession = await session.save();

      // Send notification email to mentor
      sendMentorshipRequestEmail(
        session.mentor.email,
        session.mentor.name,
        req.user.name,
        message,
        session._id
      ).catch(err => console.error('Email send failed:', err));

      res.json(updatedSession);
    } else {
      res.status(404).json({ message: 'Mentorship session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update mentorship session
// @route   PUT /api/mentorship/:id
// @access  Private
const updateMentorshipSession = async (req, res) => {
  try {
    const session = await Mentorship.findById(req.params.id);

    if (session) {
      if (session.mentor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      Object.assign(session, req.body);
      const updatedSession = await session.save();
      res.json(updatedSession);
    } else {
      res.status(404).json({ message: 'Mentorship session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add feedback to mentorship session
// @route   POST /api/mentorship/:id/feedback
// @access  Private
const addMentorshipFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const session = await Mentorship.findById(req.params.id)
      .populate('mentor', 'name email')
      .populate('mentee', 'name email');

    if (session) {
      if (session.mentee._id.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Only mentee can provide feedback' });
      }

      session.feedback = {
        rating,
        comment,
        createdAt: Date.now(),
      };

      session.status = 'Completed';
      await session.save();

      // Send rating request email to student (after session completion)
      sendRatingRequestEmail(
        session.mentee.email,
        session.mentee.name,
        session.mentor.name,
        'mentorship',
        session._id
      ).catch(err => console.error('Email send failed:', err));

      res.json(session);
    } else {
      res.status(404).json({ message: 'Mentorship session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete mentorship session
// @route   DELETE /api/mentorship/:id
// @access  Private
const deleteMentorshipSession = async (req, res) => {
  try {
    const session = await Mentorship.findById(req.params.id);

    if (session) {
      if (session.mentor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await session.deleteOne();
      res.json({ message: 'Mentorship session removed' });
    } else {
      res.status(404).json({ message: 'Mentorship session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function
const updateLeaderboardPoints = async (userId, contributionType) => {
  try {
    let leaderboard = await Leaderboard.findOne({ user: userId });
    if (!leaderboard) {
      leaderboard = await Leaderboard.create({ user: userId });
    }
    leaderboard.contributions[contributionType] += 1;
    leaderboard.calculatePoints();
    await leaderboard.save();
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};

module.exports = {
  getMentorshipSessions,
  getMentorshipById,
  createMentorshipSession,
  bookMentorshipSession,
  updateMentorshipSession,
  addMentorshipFeedback,
  deleteMentorshipSession,
};
