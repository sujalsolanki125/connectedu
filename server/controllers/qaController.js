const QA = require('../models/qaModel');
const Leaderboard = require('../models/leaderboardModel');

// @desc    Get all questions
// @route   GET /api/qa
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const { category, tag, resolved, sort } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (resolved !== undefined) query.isResolved = resolved === 'true';

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { 'upvotes': -1 };
    if (sort === 'views') sortOption = { views: -1 };

    const questions = await QA.find(query)
      .populate('askedBy', 'name email profile')
      .populate('answers.answeredBy', 'name email profile')
      .sort(sortOption);
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single question
// @route   GET /api/qa/:id
// @access  Private
const getQuestionById = async (req, res) => {
  try {
    const question = await QA.findById(req.params.id)
      .populate('askedBy', 'name email profile')
      .populate('answers.answeredBy', 'name email profile');
    
    if (question) {
      // Increment views
      question.views += 1;
      await question.save();
      
      res.json(question);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create question
// @route   POST /api/qa
// @access  Private
const createQuestion = async (req, res) => {
  try {
    const { title, question, category, tags } = req.body;

    const newQuestion = await QA.create({
      askedBy: req.user._id,
      title,
      question,
      category,
      tags,
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add answer to question
// @route   POST /api/qa/:id/answer
// @access  Private
const addAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const question = await QA.findById(req.params.id);

    if (question) {
      question.answers.push({
        answeredBy: req.user._id,
        answer,
      });

      await question.save();

      // Update leaderboard
      await updateLeaderboardPoints(req.user._id, 'questionsAnswered');

      const populatedQuestion = await QA.findById(req.params.id)
        .populate('askedBy', 'name email profile')
        .populate('answers.answeredBy', 'name email profile');

      res.json(populatedQuestion);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote question
// @route   PUT /api/qa/:id/upvote
// @access  Private
const upvoteQuestion = async (req, res) => {
  try {
    const question = await QA.findById(req.params.id);

    if (question) {
      const alreadyUpvoted = question.upvotes.includes(req.user._id);

      if (alreadyUpvoted) {
        question.upvotes = question.upvotes.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      } else {
        question.upvotes.push(req.user._id);
      }

      await question.save();
      res.json(question);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote answer
// @route   PUT /api/qa/:id/answer/:answerId/upvote
// @access  Private
const upvoteAnswer = async (req, res) => {
  try {
    const question = await QA.findById(req.params.id);

    if (question) {
      const answer = question.answers.id(req.params.answerId);
      
      if (answer) {
        const alreadyUpvoted = answer.upvotes.includes(req.user._id);
        const alreadyDownvoted = answer.downvotes.includes(req.user._id);

        if (alreadyUpvoted) {
          answer.upvotes = answer.upvotes.filter(
            (id) => id.toString() !== req.user._id.toString()
          );
        } else {
          answer.upvotes.push(req.user._id);
          if (alreadyDownvoted) {
            answer.downvotes = answer.downvotes.filter(
              (id) => id.toString() !== req.user._id.toString()
            );
          }
        }

        await question.save();
        res.json(question);
      } else {
        res.status(404).json({ message: 'Answer not found' });
      }
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept answer
// @route   PUT /api/qa/:id/answer/:answerId/accept
// @access  Private
const acceptAnswer = async (req, res) => {
  try {
    const question = await QA.findById(req.params.id);

    if (question) {
      if (question.askedBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Only question asker can accept answers' });
      }

      // Unaccept all other answers
      question.answers.forEach((ans) => {
        ans.isAccepted = false;
      });

      const answer = question.answers.id(req.params.answerId);
      if (answer) {
        answer.isAccepted = true;
        question.isResolved = true;
        await question.save();
        res.json(question);
      } else {
        res.status(404).json({ message: 'Answer not found' });
      }
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete question
// @route   DELETE /api/qa/:id
// @access  Private
const deleteQuestion = async (req, res) => {
  try {
    const question = await QA.findById(req.params.id);

    if (question) {
      if (question.askedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await question.deleteOne();
      res.json({ message: 'Question removed' });
    } else {
      res.status(404).json({ message: 'Question not found' });
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
  getQuestions,
  getQuestionById,
  createQuestion,
  addAnswer,
  upvoteQuestion,
  upvoteAnswer,
  acceptAnswer,
  deleteQuestion,
};
