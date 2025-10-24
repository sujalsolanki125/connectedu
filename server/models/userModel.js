const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: function() {
        // Password not required for Google OAuth users
        return !this.googleId;
      },
      minlength: 6,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but enforce uniqueness when present
    },
    role: {
      type: String,
      enum: ['student', 'alumni', 'admin'],
      default: 'student',
    },
    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    // Password reset
    passwordResetOTP: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    // Profile completion tracking
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    profile: {
      // ===== 1. Personal Information =====
      firstName: String,
      lastName: String,
      phoneNumber: String,
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
      },
      dateOfBirth: Date,
      
      // ===== 2. College / Academic Details =====
      collegeName: String,
      universityName: String,
      branch: String, // e.g., Computer Science, IT, Mechanical
      currentYear: Number, // for students: 1, 2, 3, 4
      graduationYear: Number,
      enrollmentNumber: String,
      cgpa: Number,
      backlogs: Number,
      
      // ===== 3. Skills and Interests =====
      technicalSkills: [String], // e.g., ["Java", "Python", "HTML", "DSA"]
      softSkills: [String], // e.g., ["Communication", "Leadership"]
      careerInterests: [String], // e.g., ["Software Development", "Data Science"]
      preferredCompanies: [String], // e.g., ["Google", "TCS", "Infosys"]
      
      // ===== 4. Placement Preparation Details =====
      resumeLink: String, // URL for uploaded resume
      interestedJobRole: String, // e.g., Frontend Developer, Data Analyst
      interviewExperienceLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', ''],
      },
      interviewPreparationStatus: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Ready', ''],
      },
      
      // ===== 5. Contact & Social Links (Students & Alumni) =====
      linkedinProfile: String,
      githubProfile: String,
      portfolioLink: String,
      contactPreference: {
        type: String,
        enum: ['Email', 'WhatsApp', 'Telegram', 'Phone', ''],
      },
      
      // ===== 6. ALUMNI-SPECIFIC FIELDS =====
      
      // Alumni Personal Information (Additional)
      profilePhotoURL: String, // Uploaded profile picture
      
      // Alumni Educational Background
      collegeCode: String, // Optional college identifier
      degree: {
        type: String,
        enum: ['B.E.', 'B.Tech', 'M.Tech', 'MBA', 'M.Sc', 'B.Sc', 'BCA', 'MCA', 'PhD', 'Other', ''],
      },
      academicPerformance: String, // e.g., CGPA or Grade
      
      // Alumni Professional Information
      numberOfInterviewsFaced: Number,
      currentCompany: String,
      currentPosition: String,
      totalExperience: Number, // in years
      industryDomain: String, // e.g., IT, Finance, Manufacturing
      previousCompanies: [String], // list of past companies
      workLocation: String, // e.g., Bangalore, Pune, Remote
      
      // Legacy/existing fields (for backward compatibility)
      bio: String,
      phone: String,
      linkedin: String,
      github: String,
      company: String,
      position: String,
      skills: [String],
      // Alumni profile fields (legacy)
      jobTitle: String,
      department: String,
      batch: String,
      // Avatar/Profile Image
      avatar: String,
      avatarPublicId: String, // Cloudinary public ID for deletion
      // Resume (for students)
      resume: {
        type: {
          url: String,
          publicId: String,
          originalName: String,
          uploadedAt: Date,
        },
        default: {},
      },
      // Resources (for alumni) - documents, PDFs, etc.
      resources: [
        {
          title: {
            type: String,
            required: true,
          },
          description: String,
          category: {
            type: String,
            default: 'General',
          },
          fileUrl: {
            type: String,
            required: true,
          },
          publicId: String,
          originalName: String,
          fileType: String, // PDF, ZIP, DOC, etc.
          uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
          downloads: {
            type: Number,
            default: 0,
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
              ratedAt: {
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
        },
      ],
      // Rating statistics (for alumni)
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
      categoryRatings: {
        type: {
          knowledge: { type: Number, default: 0 },
          communication: { type: Number, default: 0 },
          helpfulness: { type: Number, default: 0 },
          punctuality: { type: Number, default: 0 },
        },
        default: {
          knowledge: 0,
          communication: 0,
          helpfulness: 0,
          punctuality: 0,
        },
      },
    },
    
    // ===== FEATURE 1: Interview Experiences Shared by Alumni =====
    interviewExperiences: [
      {
        companyName: {
          type: String,
          required: true,
        },
        interviewRounds: Number, // total rounds attended
        questionTypes: [String], // e.g., ["Technical", "HR", "Aptitude"]
        questions: [
          {
            questionText: {
              type: String,
              required: true,
            },
            studentAnswer: String, // Alumni's answer during interview
            expectedAnswer: String, // Company's expected answer (optional)
            roundType: {
              type: String,
              enum: ['Technical', 'HR', 'Aptitude', 'Group Discussion', 'Case Study', 'Other'],
            },
          },
        ],
        companyExpectations: String, // What the company looked for
        tips: String, // Advice for students
        helpful: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        }], // Users who marked as helpful
        helpfulCount: {
          type: Number,
          default: 0,
        }, // Like/Helpful counter
        postedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // ===== FEATURE 2: Workshops & Mentorship Sessions =====
    workshops: [
      {
        title: String, // Workshop title
        category: String, // Workshop category
        workshopType: String, // 'workshop' or 'mentorship'
        availableForMentorship: {
          type: Boolean,
          default: true,
        },
        mentorshipType: [String], // e.g., ["Career Guidance", "Mock Interview", "Resume Review"]
        sessionMode: [String], // e.g., ["Online", "Video Call", "In-Person"]
        isPaidSession: {
          type: Boolean,
          default: false,
        },
        sessionCharge: Number, // charge per session (if paid)
        availableDays: [String], // e.g., ["Saturday", "Sunday", "Monday"]
        availableTime: String, // e.g., "6 PM - 8 PM"
        scheduledDate: Date, // Scheduled date and time for the workshop
        description: String,
        meetingLink: String, // Meeting link for online sessions
        prerequisites: String, // Prerequisites for the workshop
        topics: [String], // Topics covered in the workshop
        maxParticipants: {
          type: Number,
          default: 1,
        }, // For group sessions
        duration: Number, // in minutes
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        bookings: [
          {
            studentId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            studentName: String,
            studentEmail: String,
            bookedAt: {
              type: Date,
              default: Date.now,
            },
            scheduledDate: Date, // Actual date of session
            scheduledTime: String, // Actual time slot
            status: {
              type: String,
              enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
              default: 'Pending',
            },
            meetingLink: String, // For online sessions
            notes: String, // Any additional notes
          },
        ],
      },
    ],
    
    // ===== FEATURE 3: Achievements & Milestones =====
    achievements: {
      totalSessionsConducted: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      studentFeedback: [
        {
          studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          studentName: String,
          rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
          comment: String,
          sessionType: String, // e.g., "Mock Interview", "Career Guidance"
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      leaderboardPoints: {
        type: Number,
        default: 0,
      },
      badges: [String], // e.g., ["Star Mentor", "Top Rated", "100 Sessions"]
      totalHelpfulVotes: {
        type: Number,
        default: 0,
      }, // From interview experiences
      rankPosition: Number, // Current position in leaderboard
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
