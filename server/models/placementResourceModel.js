const mongoose = require('mongoose');

const placementResourceSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      enum: [
        'Resume Template',
        'Aptitude Practice',
        'Soft Skills',
        'Technical Preparation',
        'Coding Practice',
        'Interview Questions',
        'Study Material',
        'Preparation Roadmap',
        'Mock Tests',
        'Other',
      ],
      required: true,
    },
    type: {
      type: String,
      enum: ['Document', 'Video', 'Link', 'Template', 'Article', 'Tool'],
      required: true,
    },
    resourceUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
    },
    fileExtension: {
      type: String,
    },
    fileSize: String,
    thumbnail: String,
    tags: [String],
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
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
        review: String,
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
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating
placementResourceSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
};

module.exports = mongoose.model('PlacementResource', placementResourceSchema);
