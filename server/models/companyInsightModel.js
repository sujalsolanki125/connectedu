const mongoose = require('mongoose');

const companyInsightSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    logo: {
      type: String,
    },
    industry: {
      type: String,
      required: true,
    },
    recruitmentPattern: {
      type: String,
      required: true,
    },
    rolesOffered: [String],
    expectations: {
      technical: [String],
      behavioral: [String],
      educational: String,
    },
    hiringProcess: {
      rounds: Number,
      duration: String,
      description: String,
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR',
      },
    },
    workCulture: String,
    benefits: [String],
    tips: String,
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
companyInsightSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
};

module.exports = mongoose.model('CompanyInsight', companyInsightSchema);
