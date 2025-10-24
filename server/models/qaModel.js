const mongoose = require('mongoose');

const qaSchema = new mongoose.Schema(
  {
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a question title'],
    },
    question: {
      type: String,
      required: [true, 'Please add question details'],
    },
    category: {
      type: String,
      enum: [
        'Interview Preparation',
        'Resume',
        'Career Guidance',
        'Technical',
        'Company Specific',
        'Aptitude',
        'Soft Skills',
        'Other',
      ],
      required: true,
    },
    tags: [String],
    answers: [
      {
        answeredBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        answer: {
          type: String,
          required: true,
        },
        upvotes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        downvotes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        isAccepted: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QA', qaSchema);
