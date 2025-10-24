const mongoose = require('mongoose');
const InterviewExperience = require('./models/interviewExperienceModel');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const experiences = await InterviewExperience.find({})
      .populate('alumni', 'name email')
      .limit(10);
    
    console.log(`\nTotal interview experiences found: ${experiences.length}\n`);
    
    experiences.forEach((exp, index) => {
      console.log(`${index + 1}. Company: ${exp.company}`);
      console.log(`   Position: ${exp.position}`);
      console.log(`   Alumni: ${exp.alumni?.name} (${exp.alumni?.email})`);
      console.log(`   Difficulty: ${exp.difficulty}`);
      console.log(`   Outcome: ${exp.outcome}`);
      console.log(`   Date: ${exp.interviewDate}`);
      console.log(`   Created: ${exp.createdAt}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();
