const InterviewExperience = require('../models/interviewExperienceModel');
const User = require('../models/userModel');
const Leaderboard = require('../models/leaderboardModel');

// @desc    Get all interview experiences
// @route   GET /api/interviews
// @access  Private
const getInterviewExperiences = async (req, res) => {
  try {
    const { company, sort } = req.query;
    
    // Find alumni with interview experiences
    let query = {
      role: 'alumni',
      'interviewExperiences.0': { $exists: true }
    };
    
    if (company) {
      query['interviewExperiences.companyName'] = new RegExp(company, 'i');
    }

    const alumni = await User.find(query).select('name email profile interviewExperiences');
    
    // Flatten the embedded experiences and add alumni info
    let experiences = [];
    alumni.forEach(alum => {
      alum.interviewExperiences.forEach(exp => {
        experiences.push({
          _id: exp._id,
          company: exp.companyName,
          position: 'Not Specified', // Not in embedded schema
          interviewDate: exp.postedAt,
          rounds: exp.interviewRounds || 0,
          difficulty: 'medium', // Not in embedded schema
          description: exp.tips || '',
          outcome: 'selected', // Not in embedded schema
          tips: exp.tips,
          companyExpectations: exp.companyExpectations || '',
          questionTypes: exp.questionTypes || [],
          technicalQuestions: exp.questions?.filter(q => q.roundType === 'Technical').map(q => ({
            question: q.questionText,
            myAnswer: q.studentAnswer || '',
            expectedAnswer: q.expectedAnswer || ''
          })) || [],
          hrQuestions: exp.questions?.filter(q => q.roundType === 'HR').map(q => ({
            question: q.questionText,
            myAnswer: q.studentAnswer || '',
            expectedAnswer: q.expectedAnswer || ''
          })) || [],
          averageRating: 0,
          totalRatings: 0,
          views: 0,
          helpfulCount: exp.helpfulCount || 0,
          alumni: {
            _id: alum._id,
            name: alum.name,
            email: alum.email,
            profile: alum.profile
          },
          createdAt: exp.postedAt
        });
      });
    });

    // Sort experiences
    if (sort === 'helpful') {
      experiences.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else {
      experiences.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single interview experience
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewExperienceById = async (req, res) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id)
      .populate('alumni', 'name email profile')
      .populate('ratings.user', 'name email');
    
    if (experience) {
      // Increment views
      experience.views += 1;
      await experience.save();
      
      res.json(experience);
    } else {
      res.status(404).json({ message: 'Interview experience not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create interview experience
// @route   POST /api/interviews
// @access  Private (Alumni only)
const createInterviewExperience = async (req, res) => {
  try {
    const experience = await InterviewExperience.create({
      alumni: req.user._id,
      ...req.body,
    });

    // ✅ Award points for sharing interview experience (+15 points)
    const leaderboardService = require('../services/leaderboardService');
    await leaderboardService.trackActivity(req.user._id, 'UPLOAD_INTERVIEW');

    res.status(201).json(experience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update interview experience
// @route   PUT /api/interviews/:id
// @access  Private (Alumni only - own experiences)
const updateInterviewExperience = async (req, res) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id);

    if (experience) {
      if (experience.alumni.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      Object.assign(experience, req.body);
      const updatedExperience = await experience.save();
      res.json(updatedExperience);
    } else {
      res.status(404).json({ message: 'Interview experience not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete interview experience
// @route   DELETE /api/interviews/:id
// @access  Private (Alumni only - own experiences)
const deleteInterviewExperience = async (req, res) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id);

    if (experience) {
      if (experience.alumni.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await experience.deleteOne();
      res.json({ message: 'Interview experience removed' });
    } else {
      res.status(404).json({ message: 'Interview experience not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate interview experience
// @route   POST /api/interviews/:id/rate
// @access  Private
const rateInterviewExperience = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const experience = await InterviewExperience.findById(req.params.id);

    if (experience) {
      const alreadyRated = experience.ratings.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyRated) {
        alreadyRated.rating = rating;
        alreadyRated.comment = comment;
      } else {
        experience.ratings.push({
          user: req.user._id,
          rating,
          comment,
        });
      }

      experience.calculateAverageRating();
      await experience.save();

      // Update alumni's leaderboard
      if (!alreadyRated) {
        await updateLeaderboardPoints(experience.alumni, 'helpfulRatings');
      }

      res.json(experience);
    } else {
      res.status(404).json({ message: 'Interview experience not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark interview experience as helpful
// @route   PUT /api/interviews/:id/helpful
// @access  Private
const markAsHelpful = async (req, res) => {
  try {
    const experienceId = req.params.id;
    
    // Find the alumni who owns this interview experience
    const alumni = await User.findOne({
      'interviewExperiences._id': experienceId
    });

    if (!alumni) {
      return res.status(404).json({ message: 'Interview experience not found' });
    }

    // Find the specific experience in the array
    const experience = alumni.interviewExperiences.id(experienceId);

    if (!experience) {
      return res.status(404).json({ message: 'Interview experience not found' });
    }

    // Initialize helpful array if it doesn't exist
    if (!experience.helpful) {
      experience.helpful = [];
    }
    if (experience.helpfulCount === undefined) {
      experience.helpfulCount = 0;
    }

    // Check if user already marked as helpful
    const alreadyMarked = experience.helpful.some(
      id => id.toString() === req.user._id.toString()
    );

    if (alreadyMarked) {
      // Remove the helpful mark
      experience.helpful = experience.helpful.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      experience.helpfulCount = Math.max(0, experience.helpfulCount - 1);
    } else {
      // Add helpful mark
      experience.helpful.push(req.user._id);
      experience.helpfulCount += 1;
    }

    await alumni.save();
    
    res.json({ 
      message: alreadyMarked ? 'Removed helpful mark' : 'Marked as helpful',
      helpfulCount: experience.helpfulCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update leaderboard
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
  getInterviewExperiences,
  getInterviewExperienceById,
  createInterviewExperience,
  updateInterviewExperience,
  deleteInterviewExperience,
  rateInterviewExperience,
  markAsHelpful,
};
