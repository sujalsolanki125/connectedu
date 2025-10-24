const MentorshipRequest = require('../models/mentorshipRequestModel');
const User = require('../models/userModel');
const Leaderboard = require('../models/leaderboardModel');
const leaderboardService = require('../services/leaderboardService');

// @desc    Create a mentorship request
// @route   POST /api/mentorship-requests
// @access  Private (Student only)
const createMentorshipRequest = async (req, res) => {
  try {
    const { alumniId, requestType, message } = req.body;

    // Validate that the requester is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can send mentorship requests' });
    }

    // Validate that the alumni exists and is actually an alumni
    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    // Check if there's already a pending request
    const existingRequest = await MentorshipRequest.findOne({
      student: req.user._id,
      alumni: alumniId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You already have a pending request with this alumni' 
      });
    }

    const mentorshipRequest = await MentorshipRequest.create({
      student: req.user._id,
      alumni: alumniId,
      requestType,
      message,
    });

    const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
      .populate('student', 'name email profile college graduationYear department cgpa')
      .populate('alumni', 'name email profile currentCompany currentPosition');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mentorship requests for an alumni
// @route   GET /api/mentorship-requests/alumni
// @access  Private (Alumni only)
const getAlumniRequests = async (req, res) => {
  try {
    if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.query;
    let query = { alumni: req.user._id };

    if (status) {
      query.status = status;
    }

    const requests = await MentorshipRequest.find(query)
      .populate('student', 'name email profile college graduationYear department cgpa backlog skills')
      .populate('alumni', 'name email profile currentCompany currentPosition')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching alumni requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mentorship requests for a student
// @route   GET /api/mentorship-requests/student
// @access  Private (Student only)
const getStudentRequests = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requests = await MentorshipRequest.find({ student: req.user._id })
      .populate('alumni', 'name email profile currentCompany currentPosition expertise')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching student requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a mentorship request
// @route   PUT /api/mentorship-requests/:id/accept
// @access  Private (Alumni only)
const acceptRequest = async (req, res) => {
  try {
    const { responseMessage, meetingLink, meetingDate, meetingTime } = req.body;

    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if the current user is the alumni who received the request
    if (request.alumni.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been responded to' });
    }

    request.status = 'accepted';
    request.responseMessage = responseMessage;
    request.meetingLink = meetingLink;
    request.meetingDate = meetingDate;
    request.meetingTime = meetingTime;
    request.meetingScheduled = !!(meetingDate || meetingTime);
    request.respondedAt = new Date();

    await request.save();

    // ✅ Award points for accepting mentorship request (+10 points)
    await leaderboardService.trackActivity(req.user._id, 'ACCEPT_MENTORSHIP');

    const populatedRequest = await MentorshipRequest.findById(request._id)
      .populate('student', 'name email profile college graduationYear department')
      .populate('alumni', 'name email profile currentCompany currentPosition');

    res.json(populatedRequest);
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a mentorship request
// @route   PUT /api/mentorship-requests/:id/reject
// @access  Private (Alumni only)
const rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if the current user is the alumni who received the request
    if (request.alumni.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been responded to' });
    }

    request.status = 'rejected';
    request.rejectionReason = rejectionReason;
    request.respondedAt = new Date();

    await request.save();

    const populatedRequest = await MentorshipRequest.findById(request._id)
      .populate('student', 'name email profile college graduationYear department')
      .populate('alumni', 'name email profile currentCompany currentPosition');

    res.json(populatedRequest);
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Archive a mentorship request
// @route   PUT /api/mentorship-requests/:id/archive
// @access  Private (Alumni only)
const archiveRequest = async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.alumni.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'archived';
    await request.save();

    res.json({ message: 'Request archived successfully' });
  } catch (error) {
    console.error('Error archiving request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get request statistics for alumni
// @route   GET /api/mentorship-requests/alumni/stats
// @access  Private (Alumni only)
const getAlumniStats = async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await MentorshipRequest.aggregate([
      { $match: { alumni: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      archived: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
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

    if (contributionType === 'mentorshipAccepted') {
      leaderboard.contributions.mentorshipSessions += 1;
    }

    leaderboard.calculatePoints();
    await leaderboard.save();
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};

module.exports = {
  createMentorshipRequest,
  getAlumniRequests,
  getStudentRequests,
  acceptRequest,
  rejectRequest,
  archiveRequest,
  getAlumniStats,
};
