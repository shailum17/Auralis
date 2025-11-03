// Test complete community flow with database integration
async function testCompleteCommunityFlow() {
  console.log('🧪 Testing complete community flow with database integration...\n');

  try {
    // Step 1: Test backend server health
    console.log('1. Testing backend server health...');
    const healthResponse = await fetch('http://localhost:3001/api/v1/health');
    
    if (healthResponse.ok) {
      console.log('✅ Backend server is running');
    } else {
      console.log('❌ Backend server not accessible');
      return;
    }

    // Step 2: Test admin login to get a token
    console.log('\n2. Getting admin token for testing...');
    const loginResponse = await fetch('http://localhost:3001/api/v1/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testadmin',
        password: 'TestAdmin123!'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Failed to get admin token');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Got admin token');

    // Step 3: Test community preferences endpoint
    console.log('\n3. Testing community preferences endpoint...');
    const preferencesResponse = await fetch('http://localhost:3001/api/v1/community/preferences', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (preferencesResponse.ok) {
      const preferencesData = await preferencesResponse.json();
      console.log('✅ Community preferences endpoint working');
      console.log('   Has completed onboarding:', preferencesData.data?.hasCompletedOnboarding);
      console.log('   Current interests:', preferencesData.data?.interests);
    } else {
      console.log('❌ Community preferences endpoint failed');
    }

    // Step 4: Test updating preferences
    console.log('\n4. Testing preferences update...');
    const updateResponse = await fetch('http://localhost:3001/api/v1/community/preferences', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interests: ['academic-help', 'tech-innovation', 'career-guidance'],
        hasCompletedOnboarding: true
      })
    });

    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Preferences updated successfully');
      console.log('   Updated interests:', updateData.data?.interests);
    } else {
      console.log('❌ Failed to update preferences');
    }

    // Step 5: Test personalized feed
    console.log('\n5. Testing personalized feed...');
    const feedResponse = await fetch('http://localhost:3001/api/v1/community/personalized-feed', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (feedResponse.ok) {
      const feedData = await feedResponse.json();
      console.log('✅ Personalized feed endpoint working');
      console.log('   Personalized forums:', feedData.data?.personalizedForums?.length || 0);
      console.log('   Other forums:', feedData.data?.otherForums?.length || 0);
    } else {
      console.log('❌ Personalized feed endpoint failed');
    }

    // Step 6: Test onboarding completion
    console.log('\n6. Testing onboarding completion...');
    const onboardingResponse = await fetch('http://localhost:3001/api/v1/community/onboarding/complete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interests: ['mental-wellness', 'creative-arts', 'sports-fitness']
      })
    });

    if (onboardingResponse.ok) {
      const onboardingData = await onboardingResponse.json();
      console.log('✅ Onboarding completion endpoint working');
      console.log('   Completed interests:', onboardingData.data?.interests);
    } else {
      console.log('❌ Onboarding completion endpoint failed');
    }

    // Step 7: Test frontend pages
    console.log('\n7. Testing frontend pages...');
    
    const pages = [
      { name: 'Community Landing', url: 'http://localhost:3000/community/landing' },
      { name: 'Community Onboarding', url: 'http://localhost:3000/community/onboarding' },
      { name: 'Community Main', url: 'http://localhost:3000/community' },
      { name: 'Community Interests', url: 'http://localhost:3000/community/interests' }
    ];

    for (const page of pages) {
      try {
        const pageResponse = await fetch(page.url);
        if (pageResponse.ok) {
          console.log(`✅ ${page.name} page accessible`);
        } else {
          console.log(`❌ ${page.name} page not accessible (${pageResponse.status})`);
        }
      } catch (error) {
        console.log(`❌ ${page.name} page error:`, error.message);
      }
    }

    console.log('\n🎉 Complete community flow test completed!');
    console.log('\n📝 Manual testing steps:');
    console.log('1. Visit: http://localhost:3000/community (first time)');
    console.log('2. Should redirect to: http://localhost:3000/community/landing');
    console.log('3. Click "Get Started" to go to onboarding');
    console.log('4. Select interests and complete onboarding');
    console.log('5. Should redirect to community with personalized forums');
    console.log('6. Interests should be saved in database');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteCommunityFlow();