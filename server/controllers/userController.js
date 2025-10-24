const User = require('../models/userModel');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAlumni = await User.countDocuments({ role: 'alumni' });

    res.json({
      totalUsers,
      totalStudents,
      totalAlumni,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all alumni (for student dashboard)
// @route   GET /api/users/alumni
// @access  Private
const getAllAlumni = async (req, res) => {
  try {
    const alumni = await User.find({ 
      role: 'alumni',
      isProfileComplete: true // Only show alumni with complete profiles
    }).select('-password');
    
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search alumni by name or college
// @route   GET /api/users/alumni/search?name=xyz&college=abc
// @access  Private
const searchAlumni = async (req, res) => {
  try {
    const { name, college, company, branch } = req.query;
    
    // Build search query
    const searchQuery = {
      role: 'alumni',
      isProfileComplete: true,
    };

    // Add filters if provided
    if (name) {
      searchQuery.$or = [
        { name: { $regex: name, $options: 'i' } },
        { 'profile.firstName': { $regex: name, $options: 'i' } },
        { 'profile.lastName': { $regex: name, $options: 'i' } },
      ];
    }

    if (college) {
      searchQuery['profile.collegeName'] = { $regex: college, $options: 'i' };
    }

    if (company) {
      searchQuery['profile.currentCompany'] = { $regex: company, $options: 'i' };
    }

    if (branch) {
      searchQuery['profile.branch'] = { $regex: branch, $options: 'i' };
    }

    const alumni = await User.find(searchQuery).select('-password');
    
    res.json({
      count: alumni.length,
      alumni,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
  getStats,
  getAllAlumni,
  searchAlumni,
};
