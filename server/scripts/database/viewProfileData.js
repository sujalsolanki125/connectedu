const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

const viewProfile = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const user = await User.findOne({ email }).select('-password');
    
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      console.log('\nAvailable users:');
      const allUsers = await User.find({}).select('name email role');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.role})`);
      });
      mongoose.disconnect();
      return;
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('👤 USER PROFILE DATA');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role.toUpperCase()}`);
    console.log(`Profile Complete: ${user.isProfileComplete ? '✅ Yes' : '❌ No'}`);
    console.log(`Created: ${user.createdAt?.toLocaleDateString() || 'N/A'}`);
    console.log(`Last Updated: ${user.updatedAt?.toLocaleDateString() || 'N/A'}`);
    console.log(`Last Login: ${user.lastLogin?.toLocaleDateString() || 'N/A'}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (!user.profile || Object.keys(user.profile).length === 0) {
      console.log('⚠️  PROFILE IS EMPTY');
      console.log('ℹ️  User has not completed profile yet.\n');
      console.log('To complete profile:');
      console.log(`  1. Login as: ${email}`);
      console.log('  2. Navigate to: /complete-profile');
      console.log('  3. Fill out and submit the form\n');
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 PROFILE DETAILS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Personal Information
      console.log('👤 Personal Information:');
      console.log(`  First Name: ${user.profile.firstName || 'Not set'}`);
      console.log(`  Last Name: ${user.profile.lastName || 'Not set'}`);
      console.log(`  Phone: ${user.profile.phoneNumber || user.profile.phone || 'Not set'}`);
      console.log(`  Gender: ${user.profile.gender || 'Not set'}`);
      console.log(`  Date of Birth: ${user.profile.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString() : 'Not set'}`);
      console.log(`  Bio: ${user.profile.bio ? user.profile.bio.substring(0, 60) + '...' : 'Not set'}`);
      console.log('');
      
      // College / Academic Details
      console.log('🎓 College / Academic Details:');
      console.log(`  College: ${user.profile.collegeName || 'Not set'}`);
      console.log(`  University: ${user.profile.universityName || 'Not set'}`);
      console.log(`  Branch: ${user.profile.branch || 'Not set'}`);
      console.log(`  Degree: ${user.profile.degree || 'Not set'}`);
      console.log(`  Graduation Year: ${user.profile.graduationYear || 'Not set'}`);
      console.log(`  CGPA: ${user.profile.cgpa !== undefined ? user.profile.cgpa : 'Not set'}`);
      
      if (user.role === 'student') {
        console.log(`  Current Year: ${user.profile.currentYear || 'Not set'}`);
        console.log(`  Enrollment Number: ${user.profile.enrollmentNumber || 'Not set'}`);
        console.log(`  Backlogs: ${user.profile.backlogs !== undefined ? user.profile.backlogs : 'Not set'}`);
      }
      
      if (user.role === 'alumni') {
        console.log(`  College Code: ${user.profile.collegeCode || 'Not set'}`);
        console.log(`  Academic Performance: ${user.profile.academicPerformance || 'Not set'}`);
      }
      console.log('');
      
      // Professional Information (Alumni)
      if (user.role === 'alumni') {
        console.log('💼 Professional Information:');
        console.log(`  Current Company: ${user.profile.currentCompany || user.profile.company || 'Not set'}`);
        console.log(`  Current Position: ${user.profile.currentPosition || user.profile.position || user.profile.jobTitle || 'Not set'}`);
        console.log(`  Total Experience: ${user.profile.totalExperience !== undefined ? user.profile.totalExperience + ' years' : 'Not set'}`);
        console.log(`  Industry Domain: ${user.profile.industryDomain || 'Not set'}`);
        console.log(`  Work Location: ${user.profile.workLocation || 'Not set'}`);
        console.log(`  Department: ${user.profile.department || 'Not set'}`);
        console.log(`  Batch: ${user.profile.batch || 'Not set'}`);
        
        if (user.profile.previousCompanies && user.profile.previousCompanies.length > 0) {
          console.log(`  Previous Companies: ${user.profile.previousCompanies.join(', ')}`);
        }
        
        if (user.profile.numberOfInterviewsFaced) {
          console.log(`  Interviews Faced: ${user.profile.numberOfInterviewsFaced}`);
        }
        console.log('');
      }
      
      // Skills and Interests
      console.log('💪 Skills and Interests:');
      if (user.profile.technicalSkills && user.profile.technicalSkills.length > 0) {
        console.log(`  Technical Skills: ${user.profile.technicalSkills.join(', ')}`);
      } else if (user.profile.skills && user.profile.skills.length > 0) {
        console.log(`  Skills: ${user.profile.skills.join(', ')}`);
      } else {
        console.log(`  Technical Skills: Not set`);
      }
      
      if (user.profile.softSkills && user.profile.softSkills.length > 0) {
        console.log(`  Soft Skills: ${user.profile.softSkills.join(', ')}`);
      }
      
      if (user.profile.careerInterests && user.profile.careerInterests.length > 0) {
        console.log(`  Career Interests: ${user.profile.careerInterests.join(', ')}`);
      }
      
      if (user.profile.preferredCompanies && user.profile.preferredCompanies.length > 0) {
        console.log(`  Preferred Companies: ${user.profile.preferredCompanies.join(', ')}`);
      }
      console.log('');
      
      // Placement Preparation (Students)
      if (user.role === 'student') {
        console.log('🎯 Placement Preparation:');
        console.log(`  Interested Job Role: ${user.profile.interestedJobRole || 'Not set'}`);
        console.log(`  Experience Level: ${user.profile.interviewExperienceLevel || 'Not set'}`);
        console.log(`  Preparation Status: ${user.profile.interviewPreparationStatus || 'Not set'}`);
        console.log(`  Resume Link: ${user.profile.resumeLink || 'Not set'}`);
        
        if (user.profile.resume && user.profile.resume.url) {
          console.log(`  Resume Uploaded: ✅ Yes (${user.profile.resume.originalName})`);
          console.log(`    Uploaded At: ${user.profile.resume.uploadedAt ? new Date(user.profile.resume.uploadedAt).toLocaleDateString() : 'N/A'}`);
        }
        console.log('');
      }
      
      // Contact & Social Links
      console.log('🔗 Contact & Social Links:');
      console.log(`  LinkedIn: ${user.profile.linkedinProfile || user.profile.linkedin || 'Not set'}`);
      console.log(`  GitHub: ${user.profile.githubProfile || user.profile.github || 'Not set'}`);
      console.log(`  Portfolio: ${user.profile.portfolioLink || 'Not set'}`);
      console.log(`  Contact Preference: ${user.profile.contactPreference || 'Not set'}`);
      console.log('');
      
      // Profile Picture (Alumni)
      if (user.role === 'alumni') {
        console.log('📸 Profile Picture:');
        console.log(`  Photo URL: ${user.profile.profilePhotoURL || user.profile.avatar || 'Not set'}`);
        console.log(`  Avatar Public ID: ${user.profile.avatarPublicId || 'Not set'}`);
        console.log('');
      }
      
      // Resources (Alumni)
      if (user.role === 'alumni' && user.profile.resources && user.profile.resources.length > 0) {
        console.log('📚 Uploaded Resources:');
        user.profile.resources.forEach((resource, idx) => {
          console.log(`  ${idx + 1}. ${resource.title || 'Untitled'}`);
          console.log(`     Category: ${resource.category || 'General'}`);
          console.log(`     File: ${resource.originalName || 'N/A'}`);
          console.log(`     Downloads: ${resource.downloads || 0}`);
        });
        console.log('');
      }
      
      // Rating (Alumni)
      if (user.role === 'alumni' && user.profile.rating) {
        console.log('⭐ Rating & Reviews:');
        console.log(`  Overall Rating: ${user.profile.rating}/5`);
        console.log(`  Total Reviews: ${user.profile.reviewCount || 0}`);
        if (user.profile.categoryRatings) {
          console.log(`  Knowledge: ${user.profile.categoryRatings.knowledge || 0}/5`);
          console.log(`  Communication: ${user.profile.categoryRatings.communication || 0}/5`);
          console.log(`  Helpfulness: ${user.profile.categoryRatings.helpfulness || 0}/5`);
          console.log(`  Punctuality: ${user.profile.categoryRatings.punctuality || 0}/5`);
        }
        console.log('');
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RAW PROFILE OBJECT (JSON)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(JSON.stringify(user.profile, null, 2));
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔧 TECHNICAL INFO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`MongoDB Document ID: ${user._id}`);
    console.log(`Collection: users`);
    console.log(`Profile Object Size: ~${JSON.stringify(user.profile).length} bytes`);
    console.log(`Total Document Size: ~${JSON.stringify(user).length} bytes`);
    console.log(`Profile Fields Count: ${Object.keys(user.profile || {}).length}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
};

// Get email from command line argument
const email = process.argv[2] || 'student@test.com';

console.log(`🔍 Fetching profile for: ${email}\n`);
viewProfile(email);
