const MockInterview = require('../models/mockInterviewModel');
const Leaderboard = require('../models/leaderboardModel');

// @desc    Get all mock interviews
// @route   GET /api/mock-interviews
// @access  Private
const getMockInterviews = async (req, res) => {
  try {
    const { status, category, isRecorded } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (isRecorded !== undefined) query.isRecorded = isRecorded === 'true';

    const interviews = await MockInterview.find(query)
      .populate('alumni', 'name email profile')
      .populate('student', 'name email')
      .sort({ scheduledDate: 1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single mock interview
// @route   GET /api/mock-interviews/:id
// @access  Private
const getMockInterviewById = async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.id)
      .populate('alumni', 'name email profile')
      .populate('student', 'name email');
    
    if (interview) {
      // Increment views for public recorded interviews
      if (interview.isPublic && interview.isRecorded) {
        interview.views += 1;
        await interview.save();
      }
      
      res.json(interview);
    } else {
      res.status(404).json({ message: 'Mock interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create mock interview
// @route   POST /api/mock-interviews
// @access  Private (Alumni only)
const createMockInterview = async (req, res) => {
  try {
    const interview = await MockInterview.create({
      alumni: req.user._id,
      ...req.body,
    });

    // Update leaderboard
    await updateLeaderboardPoints(req.user._id, 'mockInterviews');

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book mock interview
// @route   PUT /api/mock-interviews/:id/book
// @access  Private (Student only)
const bookMockInterview = async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.id);

    if (interview) {
      if (interview.student) {
        return res.status(400).json({ message: 'Interview already booked' });
      }

      interview.student = req.user._id;
      interview.status = 'scheduled';
      
      const updatedInterview = await interview.save();
      res.json(updatedInterview);
    } else {
      res.status(404).json({ message: 'Mock interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update mock interview status
// @route   PUT /api/mock-interviews/:id/status
// @access  Private
const updateMockInterviewStatus = async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.id);

    if (interview) {
      interview.status = req.body.status;
      const updatedInterview = await interview.save();
      res.json(updatedInterview);
    } else {
      res.status(404).json({ message: 'Mock interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete mock interview
// @route   DELETE /api/mock-interviews/:id
// @access  Private (Alumni only - own interviews)
const deleteMockInterview = async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.id);

    if (interview) {
      if (interview.alumni.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await interview.deleteOne();
      res.json({ message: 'Mock interview removed' });
    } else {
      res.status(404).json({ message: 'Mock interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark mock interview as helpful
// @route   PUT /api/mock-interviews/:id/helpful
// @access  Private
const markAsHelpful = async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.id);

    if (interview) {
      const alreadyMarked = interview.helpful.includes(req.user._id);

      if (alreadyMarked) {
        interview.helpful = interview.helpful.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      } else {
        interview.helpful.push(req.user._id);
      }

      await interview.save();
      res.json(interview);
    } else {
      res.status(404).json({ message: 'Mock interview not found' });
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
  getMockInterviews,
  getMockInterviewById,
  createMockInterview,
  bookMockInterview,
  updateMockInterviewStatus,
  deleteMockInterview,
  markAsHelpful,
};
