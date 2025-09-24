const fetch = require('node-fetch');

async function testApiEndpoints() {
  const baseUrl = 'http://localhost:3001/api/v1';
  
  console.log('Testing API endpoints...\n');
  
  // Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health endpoint working');
      console.log(`   Response: ${JSON.stringify(healthData, null, 2)}`);
    } else {
      console.log('   ❌ Health endpoint failed');
    }
  } catch (error) {
    console.log(`   ❌ Health endpoint error: ${error.message}`);
  }
  
  console.log('\n2. Testing auth register endpoint...');
  try {
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!',
        username: 'testuser'
      })
    });
    
    console.log(`   Status: ${registerResponse.status}`);
    const responseText = await registerResponse.text();
    console.log(`   Response: ${responseText}`);
    
    if (registerResponse.status === 409) {
      console.log('   ✅ Register endpoint working (user already exists)');
    } else if (registerResponse.status === 201) {
      console.log('   ✅ Register endpoint working (user created)');
    } else {
      console.log('   ❌ Register endpoint failed');
    }
  } catch (error) {
    console.log(`   ❌ Register endpoint error: ${error.message}`);
  }
  
  console.log('\n3. Testing auth login OTP endpoint...');
  try {
    const otpResponse = await fetch(`${baseUrl}/auth/otp/request-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    
    console.log(`   Status: ${otpResponse.status}`);
    const responseText = await otpResponse.text();
    console.log(`   Response: ${responseText}`);
    
    if (otpResponse.ok) {
      console.log('   ✅ OTP request endpoint working');
    } else {
      console.log('   ❌ OTP request endpoint failed');
    }
  } catch (error) {
    console.log(`   ❌ OTP request endpoint error: ${error.message}`);
  }
}

testApiEndpoints().catch(console.error);