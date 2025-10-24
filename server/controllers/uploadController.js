const User = require('../models/userModel');
const { cloudinary } = require('../config/cloudinary');

// @desc    Upload profile image
// @route   POST /api/upload/profile-image
// @access  Private
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the Cloudinary URL from the uploaded file
    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    // Update user profile with new image URL
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old image from Cloudinary if exists
    if (user.profile.avatar && user.profile.avatar.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profile.avatar.publicId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Update user profile
    user.profile.avatar = imageUrl;
    user.profile.avatarPublicId = publicId;
    await user.save();

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

// @desc    Upload resume (PDF/DOC)
// @route   POST /api/upload/resume
// @access  Private (Student only)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resumeUrl = req.file.path;
    const publicId = req.file.filename;
    const originalName = req.file.originalname;

    // Update user profile with resume URL
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old resume from Cloudinary if exists
    if (user.profile.resume && user.profile.resume.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profile.resume.publicId, {
          resource_type: 'raw'
        });
      } catch (error) {
        console.error('Error deleting old resume:', error);
      }
    }

    // Update user profile
    user.profile.resume = {
      url: resumeUrl,
      publicId: publicId,
      originalName: originalName,
      uploadedAt: new Date(),
    };
    await user.save();

    res.json({
      message: 'Resume uploaded successfully',
      resume: user.profile.resume,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Failed to upload resume', error: error.message });
  }
};

// @desc    Delete resume
// @route   DELETE /api/upload/resume
// @access  Private (Student only)
const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profile.resume || !user.profile.resume.publicId) {
      return res.status(404).json({ message: 'No resume found' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(user.profile.resume.publicId, {
        resource_type: 'raw'
      });
    } catch (error) {
      console.error('Error deleting resume from Cloudinary:', error);
    }

    // Remove from user profile
    user.profile.resume = undefined;
    await user.save();

    res.json({
      message: 'Resume deleted successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Failed to delete resume', error: error.message });
  }
};

// @desc    Upload resource file
// @route   POST /api/upload/resource
// @access  Private (Alumni only)
const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Resource title is required' });
    }

    const fileUrl = req.file.path;
    const publicId = req.file.filename;
    const originalName = req.file.originalname;

    // Get file extension
    const fileExtension = originalName.split('.').pop().toUpperCase();

    // Create resource object
    const resource = {
      title,
      description: description || '',
      category: category || 'General',
      fileUrl,
      publicId,
      originalName,
      fileType: fileExtension,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      downloads: 0,
    };

    // Add to user's profile resources
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profile.resources) {
      user.profile.resources = [];
    }

    user.profile.resources.push(resource);
    await user.save();

    // ✅ Award points for sharing resource (+10 points)
    const leaderboardService = require('../services/leaderboardService');
    await leaderboardService.trackActivity(req.user._id, 'SHARE_RESOURCE');

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource: user.profile.resources[user.profile.resources.length - 1],
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ message: 'Failed to upload resource', error: error.message });
  }
};

// @desc    Delete resource file
// @route   DELETE /api/upload/resource/:resourceId
// @access  Private (Alumni only - own resources)
const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profile.resources || user.profile.resources.length === 0) {
      return res.status(404).json({ message: 'No resources found' });
    }

    // Find the resource
    const resource = user.profile.resources.id(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Delete from Cloudinary
    if (resource.publicId) {
      try {
        await cloudinary.uploader.destroy(resource.publicId, {
          resource_type: 'raw'
        });
      } catch (error) {
        console.error('Error deleting resource from Cloudinary:', error);
      }
    }

    // Remove from user profile (use pull instead of remove)
    user.profile.resources.pull(resourceId);
    await user.save();

    res.json({
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Failed to delete resource', error: error.message });
  }
};

// @desc    Get user's uploaded resources
// @route   GET /api/upload/resources
// @access  Private
const getUserResources = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      resources: user.profile.resources || [],
    });
  } catch (error) {
    console.error('Get user resources error:', error);
    res.status(500).json({ message: 'Failed to get resources', error: error.message });
  }
};

// @desc    Increment resource download count
// @route   PUT /api/upload/resource/:resourceId/download
// @access  Public
const incrementDownloadCount = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { userId } = req.body; // User who owns the resource

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resource = user.profile.resources.id(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment download count
    resource.downloads = (resource.downloads || 0) + 1;
    await user.save();

    res.json({
      message: 'Download count updated',
      downloads: resource.downloads,
    });
  } catch (error) {
    console.error('Increment download error:', error);
    res.status(500).json({ message: 'Failed to update download count', error: error.message });
  }
};

module.exports = {
  uploadProfileImage,
  uploadResume,
  deleteResume,
  uploadResource,
  deleteResource,
  getUserResources,
  incrementDownloadCount,
};
