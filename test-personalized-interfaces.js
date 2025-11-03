// Test personalized community interfaces
async function testPersonalizedInterfaces() {
  console.log('🧪 Testing personalized community interfaces...\n');

  try {
    // Step 1: Test main community page
    console.log('1. Testing main community page...');
    const communityResponse = await fetch('http://localhost:3000/community');
    
    if (communityResponse.ok) {
      console.log('✅ Community page accessible');
      console.log(`   Status: ${communityResponse.status}`);
    } else {
      console.log('❌ Community page not accessible');
      console.log(`   Status: ${communityResponse.status}`);
    }

    // Step 2: Test interest management page
    console.log('\n2. Testing interest management page...');
    const interestsResponse = await fetch('http://localhost:3000/community/interests');
    
    if (interestsResponse.ok) {
      console.log('✅ Interest management page accessible');
      console.log(`   Status: ${interestsResponse.status}`);
    } else {
      console.log('❌ Interest management page not accessible');
      console.log(`   Status: ${interestsResponse.status}`);
    }

    // Step 3: Test onboarding page
    console.log('\n3. Testing onboarding page...');
    const onboardingResponse = await fetch('http://localhost:3000/community/onboarding');
    
    if (onboardingResponse.ok) {
      console.log('✅ Onboarding page accessible');
      console.log(`   Status: ${onboardingResponse.status}`);
    } else {
      console.log('❌ Onboarding page not accessible');
      console.log(`   Status: ${onboardingResponse.status}`);
    }

    console.log('\n🎉 Personalized interfaces test completed!');
    console.log('\n📝 Manual testing workflow:');
    console.log('');
    console.log('🔄 Complete User Journey:');
    console.log('1. Visit: http://localhost:3000/community/onboarding');
    console.log('   - Complete onboarding by selecting interests');
    console.log('   - Should redirect to community with welcome banner');
    console.log('');
    console.log('2. Community Dashboard View:');
    console.log('   - See "Your Forums" section with selected interests');
    console.log('   - See "Explore More Forums" with other categories');
    console.log('   - Click on forum categories to filter content');
    console.log('');
    console.log('3. Community Feed View:');
    console.log('   - Toggle to "Feed View" to see personalized posts');
    console.log('   - Posts from user interests should be highlighted');
    console.log('   - Try different sort options (personalized, recent, popular)');
    console.log('');
    console.log('4. Interest Management:');
    console.log('   - Visit: http://localhost:3000/community/interests');
    console.log('   - Modify selected interests');
    console.log('   - Save changes and return to community');
    console.log('   - Verify dashboard reflects new interests');
    console.log('');
    console.log('🎯 Key Features to Test:');
    console.log('• Personalized forum recommendations');
    console.log('• Interest-based content filtering');
    console.log('• Dashboard vs Feed view toggle');
    console.log('• Interest management and persistence');
    console.log('• Welcome banner after onboarding');
    console.log('• Visual indicators for user interests');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPersonalizedInterfaces();