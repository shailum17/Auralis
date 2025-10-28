// Test admin login flow
async function testAdminLogin() {
  console.log('🧪 Testing admin login flow...\n');

  try {
    // Step 1: Test admin login API
    console.log('1. Testing admin login API...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'AdminPass123!'
      })
    });

    const loginResult = await loginResponse.json();
    
    if (loginResult.success) {
      console.log('✅ Admin login API successful');
      console.log(`   User: ${loginResult.user.username} (${loginResult.user.role})`);
      console.log(`   Token: ${loginResult.accessToken.substring(0, 20)}...`);
    } else {
      console.log('❌ Admin login API failed:', loginResult.error);
      return;
    }

    // Step 2: Test admin dashboard access
    console.log('\n2. Testing admin dashboard access...');
    const dashboardResponse = await fetch('http://localhost:3000/admin/dashboard');
    
    if (dashboardResponse.ok) {
      console.log('✅ Admin dashboard accessible');
      console.log(`   Status: ${dashboardResponse.status}`);
    } else {
      console.log('❌ Admin dashboard not accessible');
      console.log(`   Status: ${dashboardResponse.status}`);
    }

    // Step 3: Test backend admin endpoints
    console.log('\n3. Testing backend admin endpoints...');
    const backendResponse = await fetch('http://localhost:3001/api/v1/auth/admin/users');
    const backendResult = await backendResponse.json();
    
    if (backendResult.success) {
      console.log('✅ Backend admin endpoints working');
      console.log(`   Admin users count: ${backendResult.count}`);
      console.log('   Admin users:');
      backendResult.admins.forEach(admin => {
        console.log(`     - ${admin.username} (${admin.role}) - ${admin.email}`);
      });
    } else {
      console.log('❌ Backend admin endpoints failed');
    }

    console.log('\n🎉 Admin login flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminLogin();