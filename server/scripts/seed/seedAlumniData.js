const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const User = require('./models/userModel');
const Leaderboard = require('./models/leaderboardModel');

const seedAlumniData = async () => {
  try {
    await connectDB();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Demo Alumni Users with complete profiles
    const alumniUsers = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@alumni.com',
        password: hashedPassword,
        role: 'alumni',
        isProfileComplete: true,
        profile: {
          firstName: 'Rahul',
          lastName: 'Sharma',
          currentCompany: 'Google',
          currentPosition: 'Senior Software Engineer',
          graduationYear: 2020,
          collegeName: 'IIT Delhi',
          branch: 'Computer Science',
          technicalSkills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
          careerInterests: ['Full Stack Development', 'Cloud Computing', 'AI/ML'],
          linkedinProfile: 'https://linkedin.com/in/rahulsharma',
          totalExperience: 4,
          avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=6366f1&color=fff&size=200',
        },
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@alumni.com',
        password: hashedPassword,
        role: 'alumni',
        isProfileComplete: true,
        profile: {
          firstName: 'Priya',
          lastName: 'Patel',
          currentCompany: 'Microsoft',
          currentPosition: 'Lead Product Manager',
          graduationYear: 2019,
          collegeName: 'IIT Bombay',
          branch: 'Information Technology',
          technicalSkills: ['Product Management', 'Data Analysis', 'SQL', 'Agile'],
          careerInterests: ['Product Strategy', 'User Experience', 'Business Analytics'],
          linkedinProfile: 'https://linkedin.com/in/priyapatel',
          totalExperience: 5,
          avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=ec4899&color=fff&size=200',
        },
      },
      {
        name: 'Amit Kumar',
        email: 'amit.kumar@alumni.com',
        password: hashedPassword,
        role: 'alumni',
        isProfileComplete: true,
        profile: {
          firstName: 'Amit',
          lastName: 'Kumar',
          currentCompany: 'Amazon',
          currentPosition: 'Data Scientist',
          graduationYear: 2018,
          collegeName: 'NIT Trichy',
          branch: 'Computer Science',
          technicalSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Tableau'],
          careerInterests: ['Data Science', 'Machine Learning', 'Deep Learning'],
          linkedinProfile: 'https://linkedin.com/in/amitkumar',
          totalExperience: 6,
          avatar: 'https://ui-avatars.com/api/?name=Amit+Kumar&background=10b981&color=fff&size=200',
        },
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@alumni.com',
        password: hashedPassword,
        role: 'alumni',
        isProfileComplete: true,
        profile: {
          firstName: 'Sneha',
          lastName: 'Reddy',
          currentCompany: 'Flipkart',
          currentPosition: 'Frontend Developer',
          graduationYear: 2021,
          collegeName: 'BITS Pilani',
          branch: 'Computer Science',
          technicalSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Redux'],
          careerInterests: ['Frontend Development', 'UI/UX Design', 'Web Performance'],
          linkedinProfile: 'https://linkedin.com/in/snehareddy',
          totalExperience: 3,
          avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=f59e0b&color=fff&size=200',
        },
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@alumni.com',
        password: hashedPassword,
        role: 'alumni',
        isProfileComplete: true,
        profile: {
          firstName: 'Vikram',
          lastName: 'Singh',
          currentCompany: 'TCS',
          currentPosition: 'DevOps Engineer',
          graduationYear: 2019,
          collegeName: 'VIT Vellore',
          branch: 'Information Technology',
          technicalSkills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Linux'],
          careerInterests: ['DevOps', 'Cloud Infrastructure', 'Automation'],
          linkedinProfile: 'https://linkedin.com/in/vikramsingh',
          totalExperience: 5,
          avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=8b5cf6&color=fff&size=200',
        },
      },
      {
        name: 'Anjali Gupta',
        email: 'anjali.gupta@alumni.com',
        password: hashedPassword,
        role: 'alumni',
        isProfileComplete: true,
        profile: {
          firstName: 'Anjali',
          lastName: 'Gupta',
          currentCompany: 'Infosys',
          currentPosition: 'Full Stack Developer',
          graduationYear: 2020,
          collegeName: 'Manipal Institute',
          branch: 'Computer Science',
          technicalSkills: ['Java', 'Spring Boot', 'React', 'MongoDB', 'REST APIs'],
          careerInterests: ['Full Stack Development', 'Microservices', 'System Design'],
          linkedinProfile: 'https://linkedin.com/in/anjaligupta',
          totalExperience: 4,
          avatar: 'https://ui-avatars.com/api/?name=Anjali+Gupta&background=ef4444&color=fff&size=200',
        },
      },
    ];

    console.log('\n🚀 Starting to seed alumni data...\n');

    // Create alumni users and their leaderboard entries
    for (const alumniData of alumniUsers) {
      const existingUser = await User.findOne({ email: alumniData.email });
      
      if (existingUser) {
        console.log(`✓ User ${alumniData.email} already exists, skipping...`);
      } else {
        const newUser = await User.create(alumniData);
        console.log(`✓ Created alumni: ${alumniData.name} (${alumniData.email})`);
        
        // Create leaderboard entry for each alumni
        const randomPoints = Math.floor(Math.random() * 500) + 50; // Random points between 50-550
        const leaderboardEntry = await Leaderboard.create({
          user: newUser._id,
          points: randomPoints,
          contributions: {
            interviewExperiences: Math.floor(Math.random() * 5),
            companyInsights: Math.floor(Math.random() * 3),
            mentorshipSessions: Math.floor(Math.random() * 10),
            mockInterviews: Math.floor(Math.random() * 8),
            resourcesShared: Math.floor(Math.random() * 5),
          },
        });
        
        // Calculate points and level
        leaderboardEntry.calculatePoints();
        await leaderboardEntry.save();
        
        console.log(`  ↳ Created leaderboard entry with ${leaderboardEntry.points} points (${leaderboardEntry.level} level)`);
      }
    }

    // Update ranks for all leaderboard entries
    const allLeaderboard = await Leaderboard.find().sort({ points: -1 });
    for (let i = 0; i < allLeaderboard.length; i++) {
      allLeaderboard[i].rank = i + 1;
      await allLeaderboard[i].save();
    }

    console.log('\n✅ Alumni data seeded successfully!');
    console.log(`\n📊 Total alumni created: ${alumniUsers.length}`);
    console.log('\nYou can now login with any of these accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    alumniUsers.forEach(user => {
      console.log(`\n${user.name}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: 123456`);
      console.log(`  Company: ${user.profile.currentCompany}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding alumni data:', error);
    process.exit(1);
  }
};

seedAlumniData();
