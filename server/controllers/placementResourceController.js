const PlacementResource = require('../models/placementResourceModel');
const Leaderboard = require('../models/leaderboardModel');

// @desc    Get all placement resources
// @route   GET /api/resources
// @access  Private
const getPlacementResources = async (req, res) => {
  try {
    const { category, type, difficulty, tag, sort } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (tag) query.tags = { $in: [tag] };

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'popular') sortOption = { downloads: -1 };
    if (sort === 'views') sortOption = { views: -1 };

    const resources = await PlacementResource.find(query)
      .populate('uploadedBy', 'name email profile')
      .sort(sortOption);
    
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single placement resource
// @route   GET /api/resources/:id
// @access  Private
const getPlacementResourceById = async (req, res) => {
  try {
    const resource = await PlacementResource.findById(req.params.id)
      .populate('uploadedBy', 'name email profile')
      .populate('ratings.user', 'name email');
    
    if (resource) {
      // Increment views
      resource.views += 1;
      await resource.save();
      
      res.json(resource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create placement resource
// @route   POST /api/resources
// @access  Private
const createPlacementResource = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Validate required fields
    if (!req.body.title || !req.body.description || !req.body.category) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: title, description, and category' 
      });
    }

    // Extract file information from Cloudinary upload
    const resourceUrl = req.file.path; // Cloudinary URL
    const fileSize = req.file.size;
    const fileName = req.file.originalname;
    
    // Extract file extension
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Parse tags safely
    let tags = [];
    try {
      tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    } catch (error) {
      tags = [];
    }

    // Create resource with file information
    const resource = await PlacementResource.create({
      uploadedBy: req.user._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      type: 'Document', // Default type for uploaded files
      resourceUrl,
      fileName,
      fileExtension,
      fileSize: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
      tags,
      isVerified: false, // Requires admin approval
    });

    // ✅ Award points for sharing placement resource (+10 points)
    const leaderboardService = require('../services/leaderboardService');
    await leaderboardService.trackActivity(req.user._id, 'SHARE_RESOURCE');

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully! It will be reviewed by admin within 24-48 hours.',
      resource,
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed: ' + messages.join(', '),
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update placement resource
// @route   PUT /api/resources/:id
// @access  Private
const updatePlacementResource = async (req, res) => {
  try {
    const resource = await PlacementResource.findById(req.params.id);

    if (resource) {
      if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      Object.assign(resource, req.body);
      const updatedResource = await resource.save();
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate placement resource
// @route   POST /api/resources/:id/rate
// @access  Private
const ratePlacementResource = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const resource = await PlacementResource.findById(req.params.id);

    if (resource) {
      const alreadyRated = resource.ratings.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyRated) {
        alreadyRated.rating = rating;
        alreadyRated.review = review;
      } else {
        resource.ratings.push({
          user: req.user._id,
          rating,
          review,
        });
      }

      resource.calculateAverageRating();
      await resource.save();

      // Update uploader's leaderboard
      if (!alreadyRated) {
        await updateLeaderboardPoints(resource.uploadedBy, 'helpfulRatings');
      }

      res.json(resource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment download count and return file info for proper download
// @route   PUT /api/resources/:id/download
// @access  Private
const incrementDownload = async (req, res) => {
  try {
    const resource = await PlacementResource.findById(req.params.id);

    if (resource) {
      resource.downloads += 1;
      await resource.save();
      
      // Return file information for proper download
      res.json({ 
        message: 'Download count incremented',
        fileUrl: resource.resourceUrl,
        fileName: resource.fileName || `${resource.title}.${resource.fileExtension || 'pdf'}`,
        fileExtension: resource.fileExtension
      });
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download file with proper filename (proxy download)
// @route   GET /api/resources/:id/download-file
// @access  Private
const downloadFile = async (req, res) => {
  try {
    const https = require('https');
    const http = require('http');
    const resource = await PlacementResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    // Determine filename - sanitize to remove any special characters that might cause issues
    let fileName = resource.fileName || `${resource.title}.${resource.fileExtension || 'pdf'}`;
    
    // Sanitize filename - remove any quotes or special characters
    fileName = fileName.replace(/['"]/g, '').trim();

    // Set proper headers for file download with CORS support
    res.setHeader('Content-Type', 'application/pdf'); // Set specific content type
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    
    // Choose http or https based on URL
    const client = resource.resourceUrl.startsWith('https') ? https : http;
    
    // Fetch file from Cloudinary and pipe to response
    client.get(resource.resourceUrl, (cloudinaryResponse) => {
      cloudinaryResponse.pipe(res);
    }).on('error', (error) => {
      console.error('Error fetching from Cloudinary:', error);
      res.status(500).json({ message: 'Failed to download file' });
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
};

// @desc    Delete placement resource
// @route   DELETE /api/resources/:id
// @access  Private
const deletePlacementResource = async (req, res) => {
  try {
    const resource = await PlacementResource.findById(req.params.id);

    if (resource) {
      if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await resource.deleteOne();
      res.json({ message: 'Resource removed' });
    } else {
      res.status(404).json({ message: 'Resource not found' });
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

// @desc    Get all resources for admin (pending + published)
// @route   GET /api/resources/admin/all
// @access  Private/Admin
const getAllResourcesForAdmin = async (req, res) => {
  try {
    const resources = await PlacementResource.find({})
      .populate('uploadedBy', 'name email profile')
      .sort({ createdAt: -1 });
    
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify/Publish or Unpublish resource
// @route   PUT /api/resources/admin/:id/verify
// @access  Private/Admin
const verifyResource = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const resource = await PlacementResource.findById(req.params.id);

    if (resource) {
      resource.isVerified = isVerified;
      const updatedResource = await resource.save();
      
      res.json({
        message: isVerified 
          ? 'Resource published successfully! It is now visible to students.' 
          : 'Resource unpublished successfully.',
        resource: updatedResource,
      });
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlacementResources,
  getPlacementResourceById,
  createPlacementResource,
  updatePlacementResource,
  ratePlacementResource,
  incrementDownload,
  downloadFile,
  deletePlacementResource,
  getAllResourcesForAdmin,
  verifyResource,
};
