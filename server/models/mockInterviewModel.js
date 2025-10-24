const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema(
  {
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 60,
    },
    meetingLink: {
      type: String,
    },
    status: {
      type: String,
      enum: ['available', 'scheduled', 'completed', 'cancelled'],
      default: 'available',
    },
    feedback: {
      strengths: [String],
      improvements: [String],
      overallRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: String,
    },
    recordingUrl: String,
    isRecorded: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['Technical', 'HR', 'Behavioral', 'Case Study', 'Group Discussion', 'Mixed'],
      default: 'Technical',
    },
    views: {
      type: Number,
      default: 0,
    },
    helpful: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
