const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    category: {
      type: String,
      enum: [
        'Resume Review',
        'Career Guidance',
        'Technical Interview Prep',
        'Behavioral Interview Prep',
        'Project Discussion',
        'Skill Development',
        'General Mentorship',
      ],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    expertise: [String],
    availableSlots: [
      {
        date: Date,
        startTime: String,
        endTime: String,
        isBooked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
      default: 'Online',
    },
    meetingLink: String,
    status: {
      type: String,
      enum: ['Available', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'Available',
    },
    tips: String,
    preparationMaterial: [
      {
        title: String,
        link: String,
        type: String,
      },
    ],
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: Date,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Mentorship', mentorshipSchema);
