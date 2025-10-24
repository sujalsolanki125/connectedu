const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestType: {
      type: String,
      enum: [
        'Career Guidance',
        'Resume Review',
        'Technical Interview Prep',
        'Behavioral Interview Prep',
        'Project Discussion',
        'Skill Development',
        'General Mentorship',
        'Job Referral',
        'Networking',
        'Other'
      ],
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please add a message explaining your request'],
      maxlength: [1000, 'Message cannot be more than 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'archived'],
      default: 'pending',
    },
    responseMessage: {
      type: String,
      maxlength: [1000, 'Response message cannot be more than 1000 characters'],
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot be more than 500 characters'],
    },
    respondedAt: {
      type: Date,
    },
    meetingScheduled: {
      type: Boolean,
      default: false,
    },
    meetingLink: String,
    meetingDate: String,
    meetingTime: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
mentorshipRequestSchema.index({ alumni: 1, status: 1 });
mentorshipRequestSchema.index({ student: 1, status: 1 });
mentorshipRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
