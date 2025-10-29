// Test community onboarding flow
async function testCommunityOnboarding() {
  console.log('🧪 Testing community onboarding flow...\n');

  try {
    // Step 1: Test onboarding page access
    console.log('1. Testing onboarding page access...');
    const onboardingResponse = await fetch('http://localhost:3000/community/onboarding');
    
    if (onboardingResponse.ok) {
      console.log('✅ Community onboarding page accessible');
      console.log(`   Status: ${onboardingResponse.status}`);
    } else {
      console.log('❌ Community onboarding page not accessible');
      console.log(`   Status: ${onboardingResponse.status}`);
    }

    // Step 2: Test community page access
    console.log('\n2. Testing community page access...');
    const communityResponse = await fetch('http://localhost:3000/community');
    
    if (communityResponse.ok) {
      console.log('✅ Community page accessible');
      console.log(`   Status: ${communityResponse.status}`);
    } else {
      console.log('❌ Community page not accessible');
      console.log(`   Status: ${communityResponse.status}`);
    }

    // Step 3: Check if pages contain expected content
    console.log('\n3. Checking page content...');
    
    const onboardingContent = await onboardingResponse.text();
    if (onboardingContent.includes('Welcome to Auralis Community')) {
      console.log('✅ Onboarding page contains welcome message');
    } else {
      console.log('❌ Onboarding page missing welcome message');
    }

    if (onboardingContent.includes('Academic Help') && onboardingContent.includes('Career Guidance')) {
      console.log('✅ Onboarding page contains forum categories');
    } else {
      console.log('❌ Onboarding page missing forum categories');
    }

    console.log('\n🎉 Community onboarding flow test completed!');
    console.log('\n📝 Manual testing steps:');
    console.log('1. Visit: http://localhost:3000/community/onboarding');
    console.log('2. Click "Choose Your Interests"');
    console.log('3. Select some forum categories');
    console.log('4. Click "Join Selected Forums"');
    console.log('5. Should redirect to community with welcome banner');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCommunityOnboarding();