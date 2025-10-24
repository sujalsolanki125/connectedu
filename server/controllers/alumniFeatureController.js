const User = require('../models/userModel');

// ========================================
// FEATURE 1: INTERVIEW EXPERIENCES
// ========================================

/**
 * @desc    Add new interview experience
 * @route   POST /api/alumni-features/interview-experience
 * @access  Private (Alumni only)
 */
const addInterviewExperience = async (req, res) => {
  try {
    console.log('📝 ADD INTERVIEW EXPERIENCE REQUEST');
    console.log('User ID:', req.user._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const {
      companyName,
      interviewRounds,
      questionTypes,
      questions,
      companyExpectations,
      tips,
    } = req.body;

    // Validate required fields
    if (!companyName || !questions || questions.length === 0) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Company name and at least one question are required',
      });
    }

    // Find alumni user
    const user = await User.findById(req.user._id);

    console.log('📌 User found:', user ? 'Yes' : 'No');
    console.log('📌 User role:', user?.role);
    console.log('📌 Current interview experiences count:', user?.interviewExperiences?.length || 0);

    if (!user || user.role !== 'alumni') {
      console.log('❌ Access denied - User role:', user?.role);
      return res.status(403).json({
        success: false,
        message: 'Only alumni can add interview experiences',
      });
    }

    // Create new interview experience
    const newExperience = {
      companyName,
      interviewRounds,
      questionTypes: questionTypes || [],
      questions,
      companyExpectations,
      tips,
      helpfulCount: 0,
      postedAt: new Date(),
    };

    console.log('📦 New experience to save:', JSON.stringify(newExperience, null, 2));

    // Add to user's interview experiences
    user.interviewExperiences.push(newExperience);
    await user.save();

    console.log('✅ Experience saved! Total experiences:', user.interviewExperiences.length);
    console.log('✅ Saved experience ID:', user.interviewExperiences[user.interviewExperiences.length - 1]._id);

    res.status(201).json({
      success: true,
      message: 'Interview experience added successfully',
      data: user.interviewExperiences[user.interviewExperiences.length - 1],
    });
  } catch (error) {
    console.error('❌ Error adding interview experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add interview experience',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all interview experiences (for students to view)
 * @route   GET /api/alumni-features/interview-experiences
 * @access  Public
 */
const getAllInterviewExperiences = async (req, res) => {
  try {
    const { companyName, limit = 50, page = 1 } = req.query;

    const query = { role: 'alumni', 'interviewExperiences.0': { $exists: true } };

    // Filter by company if provided
    if (companyName) {
      query['interviewExperiences.companyName'] = new RegExp(companyName, 'i');
    }

    const skip = (page - 1) * limit;

    const alumni = await User.find(query)
      .select('profile.firstName profile.lastName profile.currentCompany profile.profilePhotoURL interviewExperiences')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'interviewExperiences.postedAt': -1 });

    // Flatten and structure the response
    let experiences = [];
    alumni.forEach((alum) => {
      alum.interviewExperiences.forEach((exp) => {
        if (!companyName || exp.companyName.toLowerCase().includes(companyName.toLowerCase())) {
          experiences.push({
            _id: exp._id,
            companyName: exp.companyName,
            interviewRounds: exp.interviewRounds,
            questionTypes: exp.questionTypes,
            questions: exp.questions,
            companyExpectations: exp.companyExpectations,
            tips: exp.tips,
            helpfulCount: exp.helpfulCount,
            postedAt: exp.postedAt,
            postedBy: {
              id: alum._id,
              name: `${alum.profile.firstName || ''} ${alum.profile.lastName || ''}`.trim() || 'Anonymous',
              currentCompany: alum.profile.currentCompany,
              profilePhoto: alum.profile.profilePhotoURL,
            },
          });
        }
      });
    });

    // Sort by date (most recent first)
    experiences.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

    res.status(200).json({
      success: true,
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    console.error('Error fetching interview experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview experiences',
      error: error.message,
    });
  }
};

/**
 * @desc    Get alumni's own interview experiences
 * @route   GET /api/alumni-features/my-interview-experiences
 * @access  Private (Alumni only)
 */
const getMyInterviewExperiences = async (req, res) => {
  try {
    console.log('🔍 Fetching interview experiences for user:', req.user._id);
    console.log('🔍 req.user from middleware:', { id: req.user._id, email: req.user.email, role: req.user.role });
    
    const user = await User.findById(req.user._id).select('role interviewExperiences profile.firstName profile.lastName');

    console.log('📌 User found:', user ? 'Yes' : 'No');
    console.log('📌 User role from DB:', user?.role);
    console.log('📌 Interview experiences count:', user?.interviewExperiences?.length || 0);

    if (!user || user.role !== 'alumni') {
      console.log('❌ Access denied - User role from DB:', user?.role);
      console.log('❌ Expected role: alumni');
      return res.status(403).json({
        success: false,
        message: 'Only alumni can access this route',
      });
    }

    console.log('✅ Sending interview experiences:', user.interviewExperiences.length);
    
    res.status(200).json({
      success: true,
      count: user.interviewExperiences.length,
      data: user.interviewExperiences,
    });
  } catch (error) {
    console.error('❌ Error fetching my interview experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview experiences',
      error: error.message,
    });
  }
};

/**
 * @desc    Update interview experience
 * @route   PUT /api/alumni-features/interview-experience/:experienceId
 * @access  Private (Alumni only - own experiences)
 */
const updateInterviewExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const updateData = req.body;

    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only alumni can update interview experiences',
      });
    }

    const experience = user.interviewExperiences.id(experienceId);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found',
      });
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (key !== '_id' && key !== 'postedAt' && key !== 'helpfulCount') {
        experience[key] = updateData[key];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Interview experience updated successfully',
      data: experience,
    });
  } catch (error) {
    console.error('Error updating interview experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview experience',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete interview experience
 * @route   DELETE /api/alumni-features/interview-experience/:experienceId
 * @access  Private (Alumni only - own experiences)
 */
const deleteInterviewExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only alumni can delete interview experiences',
      });
    }

    const experienceIndex = user.interviewExperiences.findIndex(
      (exp) => exp._id.toString() === experienceId
    );

    if (experienceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found',
      });
    }

    user.interviewExperiences.splice(experienceIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Interview experience deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting interview experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete interview experience',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark interview experience as helpful
 * @route   PUT /api/alumni-features/interview-experience/:experienceId/helpful
 * @access  Private (Students)
 */
const markAsHelpful = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const { alumniId } = req.body;

    if (!alumniId) {
      return res.status(400).json({
        success: false,
        message: 'Alumni ID is required',
      });
    }

    const alumni = await User.findById(alumniId);

    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      });
    }

    const experience = alumni.interviewExperiences.id(experienceId);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found',
      });
    }

    // Increment helpful count
    experience.helpfulCount += 1;

    // Update total helpful votes in achievements
    if (!alumni.achievements) {
      alumni.achievements = { totalHelpfulVotes: 0 };
    }
    alumni.achievements.totalHelpfulVotes += 1;

    await alumni.save();

    res.status(200).json({
      success: true,
      message: 'Marked as helpful',
      helpfulCount: experience.helpfulCount,
    });
  } catch (error) {
    console.error('Error marking as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as helpful',
      error: error.message,
    });
  }
};

// ========================================
// FEATURE 2: WORKSHOPS & MENTORSHIP SESSIONS
// ========================================

/**
 * @desc    Create new workshop/mentorship session
 * @route   POST /api/alumni-features/workshop
 * @access  Private (Alumni only)
 */
const createWorkshop = async (req, res) => {
  try {
    console.log('📝 CREATE WORKSHOP REQUEST');
    console.log('User ID:', req.user._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      description,
      category,
      workshopType,
      isPaid,
      price,
      duration,
      maxParticipants,
      scheduledDate,
      meetingLink,
      prerequisites,
      topics,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !scheduledDate) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and scheduled date are required',
      });
    }

    const user = await User.findById(req.user._id);

    console.log('📌 User found:', user ? 'Yes' : 'No');
    console.log('📌 User role:', user?.role);

    if (!user || user.role !== 'alumni') {
      console.log('❌ Access denied - User role:', user?.role);
      return res.status(403).json({
        success: false,
        message: 'Only alumni can create workshops',
      });
    }

    // Extract date and time from scheduledDate
    const schedDate = new Date(scheduledDate);
    const dayName = schedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timeString = schedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Create new workshop
    const newWorkshop = {
      title,
      description,
      category,
      workshopType: workshopType || 'mentorship',
      availableForMentorship: true,
      mentorshipType: [category], // Use category as mentorship type
      sessionMode: ['Online'], // Default to online
      isPaidSession: isPaid || false,
      sessionCharge: isPaid ? (price || 0) : 0,
      availableDays: [dayName],
      availableTime: timeString,
      scheduledDate: schedDate,
      meetingLink: meetingLink || '',
      prerequisites: prerequisites || '',
      topics: Array.isArray(topics) ? topics : [],
      maxParticipants: maxParticipants || 10,
      duration: duration || 60,
      isActive: true,
      createdAt: new Date(),
      bookings: [],
    };

    console.log('📦 New workshop to save:', JSON.stringify(newWorkshop, null, 2));

    user.workshops.push(newWorkshop);
    await user.save();

    console.log('✅ Workshop created! Total workshops:', user.workshops.length);

    // ✅ Award points for conducting workshop (+25 points)
    const leaderboardService = require('../services/leaderboardService');
    await leaderboardService.trackActivity(req.user._id, 'CONDUCT_WORKSHOP');

    res.status(201).json({
      success: true,
      message: 'Workshop created successfully',
      data: user.workshops[user.workshops.length - 1],
    });
  } catch (error) {
    console.error('❌ Error creating workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workshop',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all available workshops (for students)
 * @route   GET /api/alumni-features/workshops
 * @access  Public
 */
const getAllWorkshops = async (req, res) => {
  try {
    const { mentorshipType, sessionMode, isPaidSession } = req.query;

    const query = { role: 'alumni', 'workshops.0': { $exists: true } };

    const alumni = await User.find(query).select(
      'profile.firstName profile.lastName profile.currentCompany profile.currentPosition profile.profilePhotoURL profile.totalExperience workshops achievements.averageRating achievements.totalSessionsConducted'
    );

    // Filter and flatten workshops
    let workshops = [];
    alumni.forEach((alum) => {
      alum.workshops.forEach((workshop) => {
        // Apply filters
        if (!workshop.isActive) return;

        if (mentorshipType && !workshop.mentorshipType.includes(mentorshipType)) return;
        if (sessionMode && !workshop.sessionMode.includes(sessionMode)) return;
        if (isPaidSession !== undefined && workshop.isPaidSession !== (isPaidSession === 'true')) return;

        workshops.push({
          _id: workshop._id,
          mentorshipType: workshop.mentorshipType,
          sessionMode: workshop.sessionMode,
          isPaidSession: workshop.isPaidSession,
          sessionCharge: workshop.sessionCharge,
          availableDays: workshop.availableDays,
          availableTime: workshop.availableTime,
          description: workshop.description,
          maxParticipants: workshop.maxParticipants,
          duration: workshop.duration,
          availableSlots: workshop.maxParticipants - workshop.bookings.filter((b) => b.status !== 'Cancelled').length,
          createdAt: workshop.createdAt,
          mentor: {
            id: alum._id,
            name: `${alum.profile.firstName || ''} ${alum.profile.lastName || ''}`.trim() || 'Anonymous',
            currentCompany: alum.profile.currentCompany,
            currentPosition: alum.profile.currentPosition,
            totalExperience: alum.profile.totalExperience,
            profilePhoto: alum.profile.profilePhotoURL,
            rating: alum.achievements?.averageRating || 0,
            totalSessions: alum.achievements?.totalSessionsConducted || 0,
          },
        });
      });
    });

    // Sort by creation date (most recent first)
    workshops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: workshops.length,
      data: workshops,
    });
  } catch (error) {
    console.error('Error fetching workshops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workshops',
      error: error.message,
    });
  }
};

/**
 * @desc    Get alumni's own workshops
 * @route   GET /api/alumni-features/my-workshops
 * @access  Private (Alumni only)
 */
const getMyWorkshops = async (req, res) => {
  try {
    console.log('🔍 Fetching workshops for user:', req.user._id);
    
    const user = await User.findById(req.user._id).select('role workshops profile.firstName profile.lastName');

    console.log('📌 User found:', user ? 'Yes' : 'No');
    console.log('📌 User role:', user?.role);
    console.log('📌 Workshops count:', user?.workshops?.length || 0);

    if (!user || user.role !== 'alumni') {
      console.log('❌ Access denied - User role:', user?.role);
      return res.status(403).json({
        success: false,
        message: 'Only alumni can access this route',
      });
    }

    console.log('✅ Sending workshops:', user.workshops.length);

    res.status(200).json({
      success: true,
      count: user.workshops.length,
      data: user.workshops,
    });
  } catch (error) {
    console.error('❌ Error fetching my workshops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workshops',
      error: error.message,
    });
  }
};

/**
 * @desc    Update workshop
 * @route   PUT /api/alumni-features/workshop/:workshopId
 * @access  Private (Alumni only - own workshops)
 */
const updateWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const updateData = req.body;

    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only alumni can update workshops',
      });
    }

    const workshop = user.workshops.id(workshopId);

    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found',
      });
    }

    // Update fields (excluding bookings)
    Object.keys(updateData).forEach((key) => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'bookings') {
        workshop[key] = updateData[key];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Workshop updated successfully',
      data: workshop,
    });
  } catch (error) {
    console.error('Error updating workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workshop',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete/Deactivate workshop
 * @route   DELETE /api/alumni-features/workshop/:workshopId
 * @access  Private (Alumni only - own workshops)
 */
const deleteWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only alumni can delete workshops',
      });
    }

    const workshop = user.workshops.id(workshopId);

    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found',
      });
    }

    // If there are pending bookings, just deactivate instead of deleting
    const hasActiveBookings = workshop.bookings.some(
      (b) => b.status === 'Pending' || b.status === 'Confirmed'
    );

    if (hasActiveBookings) {
      workshop.isActive = false;
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Workshop deactivated (has active bookings)',
      });
    }

    // Otherwise, remove it
    const workshopIndex = user.workshops.findIndex((w) => w._id.toString() === workshopId);
    user.workshops.splice(workshopIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Workshop deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workshop',
      error: error.message,
    });
  }
};

/**
 * @desc    Book a workshop session (for students)
 * @route   POST /api/alumni-features/workshop/:workshopId/book
 * @access  Private (Students)
 */
const bookWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { alumniId, scheduledDate, scheduledTime, notes } = req.body;

    if (!alumniId) {
      return res.status(400).json({
        success: false,
        message: 'Alumni ID is required',
      });
    }

    // Get student info
    const student = await User.findById(req.user._id);
    if (!student || student.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can book workshops',
      });
    }

    // Get alumni and workshop
    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      });
    }

    const workshop = alumni.workshops.id(workshopId);
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found',
      });
    }

    if (!workshop.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This workshop is no longer available',
      });
    }

    // Check availability
    const activeBookings = workshop.bookings.filter((b) => b.status !== 'Cancelled').length;
    if (activeBookings >= workshop.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Workshop is fully booked',
      });
    }

    // Create booking
    const newBooking = {
      studentId: student._id,
      studentName: `${student.profile.firstName || ''} ${student.profile.lastName || ''}`.trim() || student.name,
      studentEmail: student.email,
      scheduledDate: scheduledDate || new Date(),
      scheduledTime: scheduledTime || workshop.availableTime,
      status: 'Pending',
      notes,
      bookedAt: new Date(),
    };

    workshop.bookings.push(newBooking);
    await alumni.save();

    res.status(201).json({
      success: true,
      message: 'Workshop booked successfully. Alumni will confirm shortly.',
      data: newBooking,
    });
  } catch (error) {
    console.error('Error booking workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book workshop',
      error: error.message,
    });
  }
};

/**
 * @desc    Update booking status (Alumni confirms/cancels)
 * @route   PUT /api/alumni-features/workshop/:workshopId/booking/:bookingId
 * @access  Private (Alumni only)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { workshopId, bookingId } = req.params;
    const { status, meetingLink } = req.body;

    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only alumni can update booking status',
      });
    }

    const workshop = user.workshops.id(workshopId);
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found',
      });
    }

    const booking = workshop.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = status;
    if (meetingLink) {
      booking.meetingLink = meetingLink;
    }

    // If marking as completed, update achievements
    if (status === 'Completed') {
      if (!user.achievements) {
        user.achievements = { totalSessionsConducted: 0 };
      }
      user.achievements.totalSessionsConducted += 1;
      user.achievements.lastUpdated = new Date();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message,
    });
  }
};

// ========================================
// FEATURE 3: ACHIEVEMENTS & MILESTONES
// ========================================

/**
 * @desc    Get alumni achievements
 * @route   GET /api/alumni-features/achievements/:alumniId
 * @access  Public
 */
const getAlumniAchievements = async (req, res) => {
  try {
    const { alumniId } = req.params;

    const alumni = await User.findById(alumniId).select(
      'profile.firstName profile.lastName profile.profilePhotoURL profile.currentCompany profile.currentPosition achievements'
    );

    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        alumniName: `${alumni.profile.firstName || ''} ${alumni.profile.lastName || ''}`.trim() || 'Anonymous',
        profilePhoto: alumni.profile.profilePhotoURL,
        currentCompany: alumni.profile.currentCompany,
        currentPosition: alumni.profile.currentPosition,
        achievements: alumni.achievements || {},
      },
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message,
    });
  }
};

/**
 * @desc    Submit feedback after mentorship session (by student)
 * @route   POST /api/alumni-features/feedback
 * @access  Private (Students)
 */
const submitFeedback = async (req, res) => {
  try {
    const { alumniId, rating, comment, sessionType } = req.body;

    // Validate
    if (!alumniId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Alumni ID and rating are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const student = await User.findById(req.user._id);
    if (!student || student.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit feedback',
      });
    }

    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      });
    }

    // Initialize achievements if not exists
    if (!alumni.achievements) {
      alumni.achievements = {
        totalSessionsConducted: 0,
        averageRating: 0,
        studentFeedback: [],
        leaderboardPoints: 0,
        badges: [],
        totalHelpfulVotes: 0,
      };
    }

    // Add feedback
    const newFeedback = {
      studentId: student._id,
      studentName: `${student.profile.firstName || ''} ${student.profile.lastName || ''}`.trim() || student.name,
      rating,
      comment,
      sessionType,
      date: new Date(),
    };

    alumni.achievements.studentFeedback.push(newFeedback);

    // Recalculate average rating
    const totalRatings = alumni.achievements.studentFeedback.length;
    const sumRatings = alumni.achievements.studentFeedback.reduce((sum, fb) => sum + fb.rating, 0);
    alumni.achievements.averageRating = parseFloat((sumRatings / totalRatings).toFixed(2));

    // Calculate leaderboard points
    alumni.achievements.leaderboardPoints = Math.round(
      alumni.achievements.averageRating * alumni.achievements.totalSessionsConducted
    );

    // Award badges based on achievements
    const badges = [];
    if (alumni.achievements.totalSessionsConducted >= 100) badges.push('100 Sessions');
    if (alumni.achievements.totalSessionsConducted >= 50) badges.push('50 Sessions');
    if (alumni.achievements.averageRating >= 4.5) badges.push('Top Rated');
    if (alumni.achievements.averageRating >= 4.0) badges.push('Star Mentor');
    if (alumni.achievements.totalHelpfulVotes >= 50) badges.push('Community Hero');

    alumni.achievements.badges = [...new Set(badges)]; // Remove duplicates
    alumni.achievements.lastUpdated = new Date();

    await alumni.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        averageRating: alumni.achievements.averageRating,
        leaderboardPoints: alumni.achievements.leaderboardPoints,
        badges: alumni.achievements.badges,
      },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message,
    });
  }
};

/**
 * @desc    Get top alumni leaderboard
 * @route   GET /api/alumni-features/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topAlumni = await User.find({ role: 'alumni' })
      .select(
        'profile.firstName profile.lastName profile.profilePhotoURL profile.currentCompany profile.currentPosition achievements'
      )
      .sort({ 'achievements.leaderboardPoints': -1 })
      .limit(parseInt(limit));

    // Filter alumni with achievements and format response
    const leaderboard = topAlumni
      .filter((alum) => alum.achievements && alum.achievements.leaderboardPoints > 0)
      .map((alum, index) => ({
        rank: index + 1,
        alumniId: alum._id,
        name: `${alum.profile.firstName || ''} ${alum.profile.lastName || ''}`.trim() || 'Anonymous',
        profilePhoto: alum.profile.profilePhotoURL,
        currentCompany: alum.profile.currentCompany,
        currentPosition: alum.profile.currentPosition,
        totalSessions: alum.achievements.totalSessionsConducted,
        averageRating: alum.achievements.averageRating,
        leaderboardPoints: alum.achievements.leaderboardPoints,
        badges: alum.achievements.badges,
        totalFeedback: alum.achievements.studentFeedback?.length || 0,
      }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message,
    });
  }
};

/**
 * @desc    Get my feedback received from students
 * @route   GET /api/alumni-features/my-feedback
 * @access  Private (Alumni only)
 */
const getMyFeedback = async (req, res) => {
  try {
    console.log('💬 Fetching feedback for alumni:', req.user._id);

    const user = await User.findById(req.user._id).select(
      'role achievements.studentFeedback profile.firstName profile.lastName'
    );

    console.log('📌 User found:', user ? 'Yes' : 'No');
    console.log('📌 User role:', user?.role);

    if (!user || user.role !== 'alumni') {
      console.log('❌ Access denied - User role:', user?.role);
      return res.status(403).json({
        success: false,
        message: 'Only alumni can access this route',
      });
    }

    const feedback = user.achievements?.studentFeedback || [];
    console.log('📌 Feedback count:', feedback.length);
    console.log('✅ Sending feedback');

    res.status(200).json({
      success: true,
      count: feedback.length,
      feedback: feedback,
    });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message,
    });
  }
};

/**
 * @desc    Get my achievements (for alumni dashboard)
 * @route   GET /api/alumni-features/my-achievements
 * @access  Private (Alumni only)
 */
const getMyAchievements = async (req, res) => {
  try {
    console.log('🏆 Fetching achievements for user:', req.user._id);
    
    const user = await User.findById(req.user._id).select('role achievements profile.firstName profile.lastName');

    console.log('📌 User found:', user ? 'Yes' : 'No');
    console.log('📌 User role:', user?.role);

    if (!user || user.role !== 'alumni') {
      console.log('❌ Access denied - User role:', user?.role);
      return res.status(403).json({
        success: false,
        message: 'Only alumni can access this route',
      });
    }

    console.log('✅ Sending achievements');

    res.status(200).json({
      success: true,
      data: user.achievements || {
        totalSessionsConducted: 0,
        averageRating: 0,
        studentFeedback: [],
        leaderboardPoints: 0,
        badges: [],
        totalHelpfulVotes: 0,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching my achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message,
    });
  }
};

/**
 * @desc    Get student's workshop bookings
 * @route   GET /api/alumni-features/my-bookings
 * @access  Private (Student only)
 */
const getMyBookings = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 GET /api/alumni-features/my-bookings');
    console.log('👤 Request User:', req.user);
    console.log('🆔 Student ID from token:', studentId);
    console.log('📧 Student Email:', req.user.email);
    console.log('🎭 Student Role:', req.user.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Find all alumni and extract workshops with this student's bookings
    const alumni = await User.find({ role: 'alumni', 'workshops.0': { $exists: true } }).select(
      'profile.firstName profile.lastName profile.currentCompany profile.currentPosition profile.profilePhotoURL workshops'
    );

    console.log(`📊 Found ${alumni.length} alumni with workshops`);

    const myBookings = [];

    alumni.forEach((alum) => {
      alum.workshops.forEach((workshop) => {
        workshop.bookings.forEach((booking) => {
          console.log(`🔍 Checking booking - Student ID in booking: ${booking.studentId}, Logged-in student: ${studentId}`);
          if (booking.studentId && booking.studentId.toString() === studentId.toString()) {
            console.log(`✅ MATCH! Adding booking for workshop: ${workshop.title}`);
            myBookings.push({
              _id: booking._id,
              workshopId: workshop._id,
              workshopTitle: workshop.title,
              category: workshop.category,
              mentorshipType: workshop.mentorshipType,
              sessionMode: workshop.sessionMode,
              duration: workshop.duration,
              isPaidSession: workshop.isPaidSession,
              sessionCharge: workshop.sessionCharge,
              description: workshop.description,
              availableDays: workshop.availableDays,
              availableTime: workshop.availableTime,
              scheduledDate: booking.scheduledDate,
              scheduledTime: booking.scheduledTime,
              status: booking.status,
              notes: booking.notes,
              meetingLink: booking.meetingLink,
              bookedAt: booking.bookedAt,
              mentor: {
                id: alum._id,
                name: `${alum.profile.firstName || ''} ${alum.profile.lastName || ''}`.trim() || 'Anonymous',
                company: alum.profile.currentCompany || 'Not specified',
                position: alum.profile.currentPosition || 'Professional',
                profilePhoto: alum.profile.profilePhotoURL,
              },
            });
          }
        });
      });
    });

    // Sort by bookedAt date (newest first)
    myBookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

    console.log(`📦 Total bookings found: ${myBookings.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.status(200).json({
      success: true,
      count: myBookings.length,
      data: myBookings,
    });
  } catch (error) {
    console.error('❌ Error fetching student bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

module.exports = {
  // Interview Experiences
  addInterviewExperience,
  getAllInterviewExperiences,
  getMyInterviewExperiences,
  updateInterviewExperience,
  deleteInterviewExperience,
  markAsHelpful,

  // Workshops & Mentorship
  createWorkshop,
  getAllWorkshops,
  getMyWorkshops,
  updateWorkshop,
  deleteWorkshop,
  bookWorkshop,
  updateBookingStatus,
  getMyBookings,

  // Achievements & Milestones
  getAlumniAchievements,
  submitFeedback,
  getLeaderboard,
  getMyAchievements,
  getMyFeedback,
};
