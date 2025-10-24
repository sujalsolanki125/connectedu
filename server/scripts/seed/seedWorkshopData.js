const mongoose = require('mongoose');
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

const seedWorkshops = async () => {
  try {
    await connectDB();

    console.log('\n🎯 Starting to seed workshop data...\n');

    // Find all alumni users
    const alumniUsers = await User.find({ role: 'alumni', isProfileComplete: true });

    if (alumniUsers.length === 0) {
      console.log('❌ No alumni users found. Please create alumni users first.');
      process.exit(1);
    }

    console.log(`📊 Found ${alumniUsers.length} alumni users\n`);

    // Workshop templates to add
    const workshopTemplates = [
      {
        title: 'System Design Fundamentals',
        category: 'Technical',
        workshopType: 'workshop',
        mentorshipType: ['Technical Guidance', 'Career Guidance'],
        sessionMode: ['Online', 'Video Call'],
        isPaidSession: false,
        sessionCharge: 0,
        availableDays: ['Saturday', 'Sunday'],
        availableTime: '10:00 AM - 12:00 PM',
        description: 'Learn the fundamentals of system design including scalability, load balancing, caching, and database design. Perfect for interview preparation.',
        prerequisites: 'Basic understanding of software development',
        topics: ['Scalability', 'Load Balancing', 'Caching', 'Database Design', 'Microservices'],
        maxParticipants: 5,
        duration: 120,
        isActive: true,
      },
      {
        title: 'Mock Interview - FAANG Level',
        category: 'Interview Preparation',
        workshopType: 'mentorship',
        mentorshipType: ['Mock Interview', 'Career Guidance'],
        sessionMode: ['Video Call'],
        isPaidSession: true,
        sessionCharge: 500,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTime: '6:00 PM - 8:00 PM',
        description: 'One-on-one mock interview sessions focusing on DSA, system design, and behavioral questions. Get detailed feedback and improvement strategies.',
        prerequisites: 'Basic programming knowledge in any language',
        topics: ['Data Structures', 'Algorithms', 'System Design', 'Behavioral Questions'],
        maxParticipants: 1,
        duration: 90,
        isActive: true,
      },
      {
        title: 'Resume Review & LinkedIn Optimization',
        category: 'Career Development',
        workshopType: 'mentorship',
        mentorshipType: ['Resume Review', 'Career Guidance'],
        sessionMode: ['Online', 'Video Call'],
        isPaidSession: false,
        sessionCharge: 0,
        availableDays: ['Tuesday', 'Thursday'],
        availableTime: '7:00 PM - 8:00 PM',
        description: 'Get your resume reviewed by industry experts and learn how to optimize your LinkedIn profile to attract recruiters.',
        prerequisites: 'None',
        topics: ['Resume Writing', 'LinkedIn Optimization', 'Personal Branding'],
        maxParticipants: 3,
        duration: 60,
        isActive: true,
      },
      {
        title: 'Web Development Bootcamp',
        category: 'Technical',
        workshopType: 'workshop',
        mentorshipType: ['Technical Guidance', 'Project Guidance'],
        sessionMode: ['Online'],
        isPaidSession: true,
        sessionCharge: 1000,
        availableDays: ['Saturday', 'Sunday'],
        availableTime: '2:00 PM - 5:00 PM',
        description: 'Comprehensive workshop covering React, Node.js, MongoDB, and deployment. Build a full-stack project from scratch.',
        prerequisites: 'Basic HTML, CSS, JavaScript knowledge',
        topics: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Deployment'],
        maxParticipants: 10,
        duration: 180,
        isActive: true,
      },
      {
        title: 'Data Science & Machine Learning Fundamentals',
        category: 'Technical',
        workshopType: 'workshop',
        mentorshipType: ['Technical Guidance', 'Career Guidance'],
        sessionMode: ['Online', 'Video Call'],
        isPaidSession: true,
        sessionCharge: 800,
        availableDays: ['Wednesday', 'Saturday'],
        availableTime: '5:00 PM - 7:00 PM',
        description: 'Introduction to data science and ML concepts including Python, pandas, scikit-learn, and basic ML algorithms.',
        prerequisites: 'Basic Python programming',
        topics: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'ML Algorithms'],
        maxParticipants: 8,
        duration: 120,
        isActive: true,
      },
      {
        title: 'Cloud Computing - AWS Basics',
        category: 'Technical',
        workshopType: 'workshop',
        mentorshipType: ['Technical Guidance'],
        sessionMode: ['Online'],
        isPaidSession: false,
        sessionCharge: 0,
        availableDays: ['Friday', 'Saturday'],
        availableTime: '11:00 AM - 1:00 PM',
        description: 'Learn AWS fundamentals including EC2, S3, RDS, Lambda, and deployment strategies. Hands-on workshop with live demos.',
        prerequisites: 'Basic understanding of web applications',
        topics: ['AWS EC2', 'S3', 'RDS', 'Lambda', 'CloudFormation'],
        maxParticipants: 6,
        duration: 120,
        isActive: true,
      },
    ];

    let totalWorkshopsCreated = 0;

    // Add 2-3 workshops to each alumni
    for (let i = 0; i < alumniUsers.length; i++) {
      const alumni = alumniUsers[i];
      
      // Randomly select 2-3 workshops for each alumni
      const numWorkshops = Math.floor(Math.random() * 2) + 2; // 2 or 3 workshops
      const selectedWorkshops = [];
      
      // Shuffle and select workshops
      const shuffled = [...workshopTemplates].sort(() => 0.5 - Math.random());
      for (let j = 0; j < Math.min(numWorkshops, shuffled.length); j++) {
        selectedWorkshops.push({ ...shuffled[j] });
      }

      // Add workshops to alumni
      alumni.workshops = alumni.workshops || [];
      selectedWorkshops.forEach(workshop => {
        alumni.workshops.push(workshop);
        totalWorkshopsCreated++;
      });

      await alumni.save();
      
      console.log(`✅ ${alumni.name || 'Alumni'} (${alumni.email})`);
      console.log(`   Added ${selectedWorkshops.length} workshops`);
      selectedWorkshops.forEach(ws => {
        console.log(`   - ${ws.title} (${ws.isPaidSession ? '₹' + ws.sessionCharge : 'Free'})`);
      });
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Workshop data seeded successfully!');
    console.log(`📊 Total workshops created: ${totalWorkshopsCreated}`);
    console.log(`👥 Alumni with workshops: ${alumniUsers.length}`);
    console.log('\n🔄 Please refresh your Student Dashboard and click "Browse Workshops" tab!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding workshop data:', error);
    process.exit(1);
  }
};

seedWorkshops();
