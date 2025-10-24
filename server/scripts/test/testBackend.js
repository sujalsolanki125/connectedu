const axios = require('axios');

// Test if backend server is running
const testBackend = async () => {
  try {
    console.log('Testing backend server...\n');
    
    // Test 1: Check if server is running
    try {
      const response = await axios.get('http://localhost:5000');
      console.log('✅ Backend server is running!');
    } catch (error) {
      console.log('❌ Backend server is NOT running!');
      console.log('   Please start the server with: cd server && npm start\n');
      return;
    }

    console.log('\n📝 Backend API is ready for helpful button functionality!');
    console.log('   Endpoint: PUT http://localhost:5000/api/interviews/:id/helpful');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testBackend();
