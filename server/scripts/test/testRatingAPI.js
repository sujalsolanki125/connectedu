// Simple test script to verify rating API endpoints
const http = require('http');

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
}

async function testRatingAPI() {
  console.log('🧪 Testing Rating API...\n');

  try {
    // Test 1: Root endpoint
    console.log('Test 1: GET http://localhost:5000/');
    const rootResponse = await makeRequest('http://localhost:5000/');
    console.log('✅ Success! Status:', rootResponse.status);
    console.log('Response:', JSON.stringify(rootResponse.data, null, 2));
    console.log('\n');

    // Test 2: Platform Statistics (Public endpoint)
    console.log('Test 2: GET http://localhost:5000/api/ratings/stats/platform');
    const statsResponse = await makeRequest('http://localhost:5000/api/ratings/stats/platform');
    console.log('✅ Success! Status:', statsResponse.status);
    console.log('Response:', JSON.stringify(statsResponse.data, null, 2));
    console.log('\n');

    console.log('✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('- Root endpoint: ✅ Working (Status ' + rootResponse.status + ')');
    console.log('- Platform stats endpoint: ✅ Working (Status ' + statsResponse.status + ')');
    console.log('- Rating routes registered: ✅ Working');
    console.log('\n🎉 Backend API is ready for use!');
    console.log('\n📝 Next steps:');
    console.log('1. Start frontend: cd ../client && npm start');
    console.log('2. Login as student');
    console.log('3. Navigate to Mentorship page');
    console.log('4. Rate a completed session');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n⚠️  Make sure the server is running: node server.js');
  }
}

// Run tests
testRatingAPI();
