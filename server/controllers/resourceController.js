const User = require('../models/userModel');

/**
 * @desc    Get all resources from all alumni
 * @route   GET /api/resources
 * @access  Public
 */
const getAllResources = async (req, res) => {
  try {
    const { category, search } = req.query;

    // Find all alumni with resources
    const alumni = await User.find({
      role: 'alumni',
      'profile.resources.0': { $exists: true },
    }).select('name profile.firstName profile.lastName profile.currentCompany profile.resources profile.profilePhotoURL');

    // Flatten all resources with alumni info
    let allResources = [];

    alumni.forEach((alum) => {
      if (alum.profile.resources && alum.profile.resources.length > 0) {
        alum.profile.resources.forEach((resource) => {
          allResources.push({
            _id: resource._id,
            title: resource.title,
            description: resource.description,
            category: resource.category,
            fileUrl: resource.fileUrl,
            fileType: resource.fileType,
            originalName: resource.originalName,
            downloads: resource.downloads || 0,
            uploadedAt: resource.uploadedAt,
            uploadedBy: {
              id: alum._id,
              name: `${alum.profile.firstName || ''} ${alum.profile.lastName || ''}`.trim() || alum.name || 'Anonymous',
              company: alum.profile.currentCompany || 'Not specified',
              profilePhoto: alum.profile.profilePhotoURL,
            },
          });
        });
      }
    });

    // Apply filters
    if (category && category !== 'All') {
      allResources = allResources.filter((r) => r.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      allResources = allResources.filter(
        (r) =>
          r.title?.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower) ||
          r.category?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by uploadedAt (newest first)
    allResources.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.status(200).json({
      success: true,
      count: allResources.length,
      data: allResources,
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message,
    });
  }
};

/**
 * @desc    Download a resource and increment download count
 * @route   POST /api/resources/:resourceId/download
 * @access  Private (Student)
 */
const downloadResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    // Find the alumni who owns this resource
    const alumni = await User.findOne({
      role: 'alumni',
      'profile.resources._id': resourceId,
    });

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Find the resource and increment download count
    const resource = alumni.profile.resources.id(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Increment download count
    resource.downloads = (resource.downloads || 0) + 1;
    await alumni.save();

    res.status(200).json({
      success: true,
      message: 'Download count incremented',
      data: {
        resourceId: resource._id,
        downloads: resource.downloads,
        fileUrl: resource.fileUrl,
      },
    });
  } catch (error) {
    console.error('Error downloading resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process download',
      error: error.message,
    });
  }
};

/**
 * @desc    Rate a resource
 * @route   POST /api/resources/:resourceId/rate
 * @access  Private (Student)
 */
const rateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { rating } = req.body;
    const studentId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Find the alumni who owns this resource
    const alumni = await User.findOne({
      role: 'alumni',
      'profile.resources._id': resourceId,
    });

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Find the resource
    const resource = alumni.profile.resources.id(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Initialize ratings array if it doesn't exist
    if (!resource.ratings) {
      resource.ratings = [];
    }

    // Check if student has already rated
    const existingRatingIndex = resource.ratings.findIndex(
      (r) => r.user && r.user.toString() === studentId.toString()
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      resource.ratings[existingRatingIndex].rating = rating;
      resource.ratings[existingRatingIndex].ratedAt = new Date();
    } else {
      // Add new rating
      resource.ratings.push({
        user: studentId,
        rating: rating,
        ratedAt: new Date(),
      });
    }

    // Calculate average rating
    const totalRatings = resource.ratings.length;
    const sumRatings = resource.ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = sumRatings / totalRatings;

    resource.averageRating = averageRating;
    resource.totalRatings = totalRatings;

    // Also update alumni's overall rating
    // Calculate average of all resources' ratings
    let totalResourceRatings = 0;
    let totalResourceCount = 0;

    alumni.profile.resources.forEach((res) => {
      if (res.ratings && res.ratings.length > 0) {
        const resSum = res.ratings.reduce((sum, r) => sum + r.rating, 0);
        totalResourceRatings += resSum / res.ratings.length;
        totalResourceCount++;
      }
    });

    if (totalResourceCount > 0) {
      alumni.profile.rating = totalResourceRatings / totalResourceCount;
      alumni.profile.reviewCount = alumni.profile.resources.reduce(
        (sum, res) => sum + (res.ratings?.length || 0),
        0
      );
    }

    await alumni.save();

    res.status(200).json({
      success: true,
      message: 'Resource rated successfully',
      data: {
        resourceId: resource._id,
        averageRating: resource.averageRating,
        totalRatings: resource.totalRatings,
        yourRating: rating,
      },
    });
  } catch (error) {
    console.error('Error rating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate resource',
      error: error.message,
    });
  }
};

/**
 * @desc    Get student's rating for a specific resource
 * @route   GET /api/resources/:resourceId/my-rating
 * @access  Private (Student)
 */
const getMyRating = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const studentId = req.user._id;

    // Find the alumni who owns this resource
    const alumni = await User.findOne({
      role: 'alumni',
      'profile.resources._id': resourceId,
    });

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    const resource = alumni.profile.resources.id(resourceId);

    if (!resource || !resource.ratings) {
      return res.status(200).json({
        success: true,
        data: { rating: null },
      });
    }

    const myRating = resource.ratings.find(
      (r) => r.user && r.user.toString() === studentId.toString()
    );

    res.status(200).json({
      success: true,
      data: { rating: myRating ? myRating.rating : null },
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating',
      error: error.message,
    });
  }
};

module.exports = {
  getAllResources,
  downloadResource,
  rateResource,
  getMyRating,
};
