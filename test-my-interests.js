// Test script to verify "My Interests" tab shows selected forums

async function testMyInterests() {
  console.log('🧪 Testing My Interests Tab Fix...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@auralis.com',
        password: 'Admin@123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const accessToken = loginData.data.accessToken;
    console.log('✅ Login successful\n');

    // Step 2: Get user preferences to see current interests
    console.log('2️⃣ Fetching user preferences...');
    const prefsResponse = await fetch('http://localhost:3001/api/community/preferences', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (prefsResponse.ok) {
      const prefsData = await prefsResponse.json();
      console.log('✅ Current interests:', prefsData.data.interests);
      console.log('   Interests count:', prefsData.data.interests.length, '\n');
    }

    // Step 3: Get forums with isJoined property
    console.log('3️⃣ Fetching forums with join status...');
    const forumsResponse = await fetch('http://localhost:3001/api/community/forums', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!forumsResponse.ok) {
      throw new Error(`Forums fetch failed: ${forumsResponse.status}`);
    }

    const forumsData = await forumsResponse.json();
    console.log('✅ Forums retrieved:', forumsData.data.forums.length);
    
    // Check if isJoined property exists
    const joinedForums = forumsData.data.forums.filter(f => f.isJoined);
    console.log('✅ Joined forums:', joinedForums.length);
    
    if (joinedForums.length > 0) {
      console.log('\n📋 Your Joined Forums:');
      joinedForums.forEach(forum => {
        console.log(`   - ${forum.name} (${forum.id})`);
      });
    } else {
      console.log('\n⚠️  No joined forums found. You may need to complete onboarding first.');
    }

    // Step 4: Verify isJoined property exists on all forums
    console.log('\n4️⃣ Verifying isJoined property...');
    const hasIsJoinedProperty = forumsData.data.forums.every(f => 'isJoined' in f);
    
    if (hasIsJoinedProperty) {
      console.log('✅ All forums have isJoined property');
    } else {
      console.log('❌ Some forums missing isJoined property');
    }

    console.log('\n✅ TEST COMPLETE!');
    console.log('\n📝 Summary:');
    console.log(`   - Total forums: ${forumsData.data.forums.length}`);
    console.log(`   - Joined forums: ${joinedForums.length}`);
    console.log(`   - isJoined property present: ${hasIsJoinedProperty ? 'Yes' : 'No'}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Visit: http://localhost:3000/community');
    console.log('   2. Click on "My Interests" tab');
    console.log('   3. You should see your joined forums displayed');
    
    if (joinedForums.length === 0) {
      console.log('\n💡 To test with forums:');
      console.log('   1. Visit: http://localhost:3000/community/onboarding');
      console.log('   2. Select some forums');
      console.log('   3. Complete onboarding');
      console.log('   4. Return to community page and check "My Interests" tab');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   - Make sure the API is running on http://localhost:3001');
    console.error('   - Make sure the web app is running on http://localhost:3000');
    console.error('   - Check that admin credentials are correct');
  }
}

testMyInterests();
