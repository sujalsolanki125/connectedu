const mongoose = require('mongoose');

const mentorshipRatingSchema = new mongoose.Schema(
  {
    mentorshipSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentorship',
      required: true,
    },
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
    overallRating: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: 1,
      max: 5,
    },
    categoryRatings: {
      knowledge: {
        type: Number,
        required: [true, 'Knowledge rating is required'],
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        required: [true, 'Communication rating is required'],
        min: 1,
        max: 5,
      },
      helpfulness: {
        type: Number,
        required: [true, 'Helpfulness rating is required'],
        min: 1,
        max: 5,
      },
      punctuality: {
        type: Number,
        required: [true, 'Punctuality rating is required'],
        min: 1,
        max: 5,
      },
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot be more than 500 characters'],
    },
    sessionType: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: true, // Auto-verify since it's tied to actual completed sessions
    },
    helpful: {
      type: Number,
      default: 0, // For "helpful" votes from other students
    },
    reported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one rating per student per mentorship session
mentorshipRatingSchema.index({ student: 1, mentorshipSession: 1 }, { unique: true });

// Calculate average category rating
mentorshipRatingSchema.virtual('averageCategoryRating').get(function () {
  const { knowledge, communication, helpfulness, punctuality } = this.categoryRatings;
  return ((knowledge + communication + helpfulness + punctuality) / 4).toFixed(1);
});

// Ensure virtuals are included in JSON
mentorshipRatingSchema.set('toJSON', { virtuals: true });
mentorshipRatingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MentorshipRating', mentorshipRatingSchema);
