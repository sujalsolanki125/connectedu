const mongoose = require('mongoose');

const interviewExperienceSchema = new mongoose.Schema(
  {
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    position: {
      type: String,
      required: [true, 'Please add a position'],
    },
    interviewDate: {
      type: Date,
      required: true,
    },
    rounds: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    outcome: {
      type: String,
      enum: ['selected', 'rejected', 'pending'],
      required: true,
    },
    tips: {
      type: String,
    },
    technicalQuestions: [
      {
        question: String,
        answer: String,
      },
    ],
    hrQuestions: [
      {
        question: String,
        answer: String,
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
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
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating
interviewExperienceSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
};

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
