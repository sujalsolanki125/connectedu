const mongoose = require('mongoose');
const InterviewExperience = require('./models/interviewExperienceModel');
require('dotenv').config();

const debugData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get raw data from the collection
    const rawData = await mongoose.connection.db.collection('interviewexperiences').find({}).toArray();
    console.log('📊 Raw Collection Data:');
    console.log('Total documents:', rawData.length);
    console.log('\nFirst document:');
    console.log(JSON.stringify(rawData[0], null, 2));

    // Get data using the model
    console.log('\n\n📝 Using Model:');
    const modelData = await InterviewExperience.find({});
    console.log('Total documents:', modelData.length);
    if (modelData.length > 0) {
      console.log('\nFirst document:');
      console.log(JSON.stringify(modelData[0], null, 2));
    }

    // Check schema fields
    console.log('\n\n🔍 Schema Fields:');
    console.log(Object.keys(InterviewExperience.schema.paths));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

debugData();
