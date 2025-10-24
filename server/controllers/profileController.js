const User = require('../models/userModel');
const cloudinary = require('cloudinary').v2;

// @desc    Check if student profile is complete
// @route   GET /api/profile/check-completion
// @access  Private
const checkProfileCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('isProfileComplete role profile.firstName profile.collegeName');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      isProfileComplete: user.isProfileComplete,
      role: user.role,
      firstName: user.profile?.firstName,
      collegeName: user.profile?.collegeName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student profile
// @route   GET /api/profile/student
// @access  Private
const getStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isProfileComplete: user.isProfileComplete,
      lastLogin: user.lastLogin,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update/Complete student profile
// @route   PUT /api/profile/student
// @access  Private
const updateStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }

    const {
      // Personal Information
      firstName,
      lastName,
      phoneNumber,
      gender,
      dateOfBirth,
      
      // College / Academic Details
      collegeName,
      universityName,
      branch,
      currentYear,
      graduationYear,
      enrollmentNumber,
      cgpa,
      backlogs,
      
      // Skills and Interests
      technicalSkills,
      softSkills,
      careerInterests,
      preferredCompanies,
      
      // Placement Preparation Details
      resumeLink,
      interestedJobRole,
      interviewExperienceLevel,
      interviewPreparationStatus,
      
      // Contact & Social Links
      linkedinProfile,
      githubProfile,
      portfolioLink,
      contactPreference,
      
      // Additional fields
      bio,
    } = req.body;

    // Update profile fields
    user.profile = {
      ...user.profile,
      // Personal Information
      firstName: firstName || user.profile.firstName,
      lastName: lastName || user.profile.lastName,
      phoneNumber: phoneNumber || user.profile.phoneNumber,
      gender: gender || user.profile.gender,
      dateOfBirth: dateOfBirth || user.profile.dateOfBirth,
      
      // College / Academic Details
      collegeName: collegeName || user.profile.collegeName,
      universityName: universityName || user.profile.universityName,
      branch: branch || user.profile.branch,
      currentYear: currentYear !== undefined ? currentYear : user.profile.currentYear,
      graduationYear: graduationYear !== undefined ? graduationYear : user.profile.graduationYear,
      enrollmentNumber: enrollmentNumber || user.profile.enrollmentNumber,
      cgpa: cgpa !== undefined ? cgpa : user.profile.cgpa,
      backlogs: backlogs !== undefined ? backlogs : user.profile.backlogs,
      
      // Skills and Interests
      technicalSkills: technicalSkills || user.profile.technicalSkills || [],
      softSkills: softSkills || user.profile.softSkills || [],
      careerInterests: careerInterests || user.profile.careerInterests || [],
      preferredCompanies: preferredCompanies || user.profile.preferredCompanies || [],
      
      // Placement Preparation Details
      resumeLink: resumeLink || user.profile.resumeLink,
      interestedJobRole: interestedJobRole || user.profile.interestedJobRole,
      interviewExperienceLevel: interviewExperienceLevel || user.profile.interviewExperienceLevel,
      interviewPreparationStatus: interviewPreparationStatus || user.profile.interviewPreparationStatus,
      
      // Contact & Social Links
      linkedinProfile: linkedinProfile || user.profile.linkedinProfile,
      githubProfile: githubProfile || user.profile.githubProfile,
      portfolioLink: portfolioLink || user.profile.portfolioLink,
      contactPreference: contactPreference || user.profile.contactPreference,
      
      // Additional
      bio: bio || user.profile.bio,
      
      // Ensure nested objects have defaults (prevent validation errors)
      resume: user.profile.resume || {},
      categoryRatings: user.profile.categoryRatings || {
        knowledge: 0,
        communication: 0,
        helpfulness: 0,
        punctuality: 0,
      },
    };

    // Check if profile is complete (minimum required fields)
    const requiredFields = [
      user.profile.firstName,
      user.profile.lastName,
      user.profile.collegeName,
      user.profile.branch,
      user.profile.currentYear,
      user.profile.graduationYear,
    ];

    user.isProfileComplete = requiredFields.every(field => field !== undefined && field !== null && field !== '');

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      isProfileComplete: user.isProfileComplete,
      profile: user.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get alumni profile
// @route   GET /api/profile/alumni
// @access  Private
const getAlumniProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'alumni') {
      return res.status(403).json({ message: 'Access denied. Alumni role required.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isProfileComplete: user.isProfileComplete,
      lastLogin: user.lastLogin,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update alumni profile
// @route   PUT /api/profile/alumni
// @access  Private
const updateAlumniProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'alumni') {
      return res.status(403).json({ message: 'Access denied. Alumni role required.' });
    }

    const {
      // Personal Information
      firstName,
      lastName,
      phoneNumber,
      gender,
      dateOfBirth,
      profilePhotoURL,
      
      // Educational Background
      collegeName,
      collegeCode,
      universityName,
      branch,
      graduationYear,
      degree,
      academicPerformance,
      
      // Professional Information
      numberOfInterviewsFaced,
      currentCompany,
      currentPosition,
      totalExperience,
      industryDomain,
      previousCompanies,
      workLocation,
      
      // Skills & Links
      technicalSkills,
      softSkills,
      linkedinProfile,
      githubProfile,
      portfolioLink,
      
      // Legacy fields
      company,
      position,
      jobTitle,
      bio,
      contactPreference,
    } = req.body;

    // Update profile fields
    user.profile = {
      ...user.profile,
      // Personal Information
      firstName: firstName || user.profile.firstName,
      lastName: lastName || user.profile.lastName,
      phoneNumber: phoneNumber || user.profile.phoneNumber,
      gender: gender || user.profile.gender,
      dateOfBirth: dateOfBirth || user.profile.dateOfBirth,
      profilePhotoURL: profilePhotoURL || user.profile.profilePhotoURL,
      
      // Educational Background
      collegeName: collegeName || user.profile.collegeName,
      collegeCode: collegeCode || user.profile.collegeCode,
      universityName: universityName || user.profile.universityName,
      branch: branch || user.profile.branch,
      graduationYear: graduationYear || user.profile.graduationYear,
      degree: degree || user.profile.degree,
      academicPerformance: academicPerformance || user.profile.academicPerformance,
      
      // Professional Information
      numberOfInterviewsFaced: numberOfInterviewsFaced !== undefined ? numberOfInterviewsFaced : user.profile.numberOfInterviewsFaced,
      currentCompany: currentCompany || user.profile.currentCompany,
      currentPosition: currentPosition || user.profile.currentPosition,
      totalExperience: totalExperience !== undefined ? totalExperience : user.profile.totalExperience,
      industryDomain: industryDomain || user.profile.industryDomain,
      previousCompanies: previousCompanies || user.profile.previousCompanies || [],
      workLocation: workLocation || user.profile.workLocation,
      
      // Skills & Links
      technicalSkills: technicalSkills || user.profile.technicalSkills || [],
      softSkills: softSkills || user.profile.softSkills || [],
      linkedinProfile: linkedinProfile || user.profile.linkedinProfile,
      githubProfile: githubProfile || user.profile.githubProfile,
      portfolioLink: portfolioLink || user.profile.portfolioLink,
      bio: bio || user.profile.bio,
      contactPreference: contactPreference || user.profile.contactPreference,
      
      // Ensure nested objects have defaults (prevent validation errors)
      resume: user.profile.resume || {},
      categoryRatings: user.profile.categoryRatings || {
        knowledge: 0,
        communication: 0,
        helpfulness: 0,
        punctuality: 0,
      },
    };

    // Check if profile is complete (minimum required fields for alumni)
    const requiredFields = [
      user.profile.firstName,
      user.profile.lastName,
      user.profile.collegeName,
      user.profile.branch,
      user.profile.graduationYear,
      user.profile.currentCompany,
      user.profile.currentPosition,
      user.profile.company,
      user.profile.position,
    ];

    user.isProfileComplete = requiredFields.every(field => field !== undefined && field !== null && field !== '');

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      isProfileComplete: user.isProfileComplete,
      profile: user.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update last login time
// @route   PUT /api/profile/update-login
// @access  Private
const updateLastLogin = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({ message: 'Last login updated', lastLogin: user.lastLogin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile picture
// @route   POST /api/profile/upload-avatar
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.profile.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.profile.avatarPublicId);
        console.log('🗑️ Old avatar deleted from Cloudinary');
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    // Update user profile with new avatar URL and public ID
    user.profile.avatar = req.file.path; // Cloudinary URL
    user.profile.avatarPublicId = req.file.filename; // Cloudinary public ID

    await user.save();

    console.log('✅ Profile picture uploaded successfully for:', user.email);

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      avatar: user.profile.avatar,
      avatarPublicId: user.profile.avatarPublicId,
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Failed to upload profile picture', error: error.message });
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/profile/avatar
// @access  Private
const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profile.avatarPublicId) {
      return res.status(400).json({ message: 'No profile picture to delete' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(user.profile.avatarPublicId);
      console.log('🗑️ Avatar deleted from Cloudinary');
    } catch (err) {
      console.error('Error deleting avatar from Cloudinary:', err);
    }

    // Remove from database
    user.profile.avatar = null;
    user.profile.avatarPublicId = null;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture deleted successfully',
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ message: 'Failed to delete profile picture', error: error.message });
  }
};

module.exports = {
  checkProfileCompletion,
  getStudentProfile,
  updateStudentProfile,
  getAlumniProfile,
  updateAlumniProfile,
  updateLastLogin,
  uploadProfilePicture,
  deleteProfilePicture,
};
