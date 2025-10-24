const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('Testing Interview API endpoint...\n');
    
    // First, let's try without authentication
    console.log('1. Testing without authentication:');
    try {
      const response = await axios.get('http://localhost:5000/api/interviews');
      console.log('✅ Success! Data received:', response.data.length, 'experiences');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n2. Testing with mock authentication:');
    // The protect middleware requires a valid JWT token
    // Let's check what happens
    try {
      const response = await axios.get('http://localhost:5000/api/interviews', {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      });
      console.log('✅ Success! Data received:', response.data.length, 'experiences');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
};

testAPI();
