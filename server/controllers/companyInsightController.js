const CompanyInsight = require('../models/companyInsightModel');
const Leaderboard = require('../models/leaderboardModel');

// @desc    Get all company insights
// @route   GET /api/company-insights
// @access  Private
const getCompanyInsights = async (req, res) => {
  try {
    const { industry, company, sort } = req.query;
    
    let query = {};
    if (industry) query.industry = industry;
    if (company) query.company = new RegExp(company, 'i');

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'popular') sortOption = { totalRatings: -1 };

    const insights = await CompanyInsight.find(query)
      .populate('creator', 'name email profile')
      .sort(sortOption);
    
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single company insight
// @route   GET /api/company-insights/:id
// @access  Private
const getCompanyInsightById = async (req, res) => {
  try {
    const insight = await CompanyInsight.findById(req.params.id)
      .populate('creator', 'name email profile')
      .populate('ratings.user', 'name email');
    
    if (insight) {
      res.json(insight);
    } else {
      res.status(404).json({ message: 'Company insight not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create company insight
// @route   POST /api/company-insights
// @access  Private (Alumni/Admin)
const createCompanyInsight = async (req, res) => {
  try {
    const insight = await CompanyInsight.create({
      creator: req.user._id,
      ...req.body,
    });

    // Update leaderboard
    await updateLeaderboardPoints(req.user._id, 'companyInsights');

    res.status(201).json(insight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update company insight
// @route   PUT /api/company-insights/:id
// @access  Private
const updateCompanyInsight = async (req, res) => {
  try {
    const insight = await CompanyInsight.findById(req.params.id);

    if (insight) {
      if (insight.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      Object.assign(insight, req.body);
      const updatedInsight = await insight.save();
      res.json(updatedInsight);
    } else {
      res.status(404).json({ message: 'Company insight not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate company insight
// @route   POST /api/company-insights/:id/rate
// @access  Private
const rateCompanyInsight = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const insight = await CompanyInsight.findById(req.params.id);

    if (insight) {
      const alreadyRated = insight.ratings.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyRated) {
        alreadyRated.rating = rating;
        alreadyRated.comment = comment;
      } else {
        insight.ratings.push({
          user: req.user._id,
          rating,
          comment,
        });
      }

      insight.calculateAverageRating();
      await insight.save();

      // Update creator's leaderboard
      if (!alreadyRated) {
        await updateLeaderboardPoints(insight.creator, 'helpfulRatings');
      }

      res.json(insight);
    } else {
      res.status(404).json({ message: 'Company insight not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete company insight
// @route   DELETE /api/company-insights/:id
// @access  Private
const deleteCompanyInsight = async (req, res) => {
  try {
    const insight = await CompanyInsight.findById(req.params.id);

    if (insight) {
      if (insight.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await insight.deleteOne();
      res.json({ message: 'Company insight removed' });
    } else {
      res.status(404).json({ message: 'Company insight not found' });
    }
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
  getCompanyInsights,
  getCompanyInsightById,
  createCompanyInsight,
  updateCompanyInsight,
  rateCompanyInsight,
  deleteCompanyInsight,
};
