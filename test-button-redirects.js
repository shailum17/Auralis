// Test button redirects to forum selection
async function testButtonRedirects() {
  console.log('🧪 Testing button redirects to forum selection...\n');

  try {
    // Step 1: Test landing page accessibility
    console.log('1. Testing landing page...');
    const landingResponse = await fetch('http://localhost:3000/community/landing');
    
    if (landingResponse.ok) {
      console.log('✅ Landing page accessible');
      
      const landingContent = await landingResponse.text();
      
      // Check for updated button text
      if (landingContent.includes('Choose Your Interests')) {
        console.log('✅ "Choose Your Interests" button found');
      } else {
        console.log('❌ "Choose Your Interests" button not found');
      }
      
      if (landingContent.includes('Browse Forum Categories')) {
        console.log('✅ "Browse Forum Categories" button found');
      } else {
        console.log('❌ "Browse Forum Categories" button not found');
      }
      
    } else {
      console.log('❌ Landing page not accessible');
    }

    // Step 2: Test onboarding page
    console.log('\n2. Testing onboarding page...');
    const onboardingResponse = await fetch('http://localhost:3000/community/onboarding');
    
    if (onboardingResponse.ok) {
      console.log('✅ Onboarding page accessible');
      
      const onboardingContent = await onboardingResponse.text();
      
      // Check for forum selection features
      if (onboardingContent.includes('Select All')) {
        console.log('✅ "Select All" functionality found');
      } else {
        console.log('❌ "Select All" functionality not found');
      }
      
      if (onboardingContent.includes('Clear All')) {
        console.log('✅ "Clear All" functionality found');
      } else {
        console.log('❌ "Clear All" functionality not found');
      }
      
    } else {
      console.log('❌ Onboarding page not accessible');
    }

    // Step 3: Test community page
    console.log('\n3. Testing community page...');
    const communityResponse = await fetch('http://localhost:3000/community');
    
    if (communityResponse.ok) {
      console.log('✅ Community page accessible');
    } else {
      console.log('❌ Community page not accessible');
    }

    console.log('\n🎉 Button redirect test completed!');
    console.log('\n📝 Manual testing steps:');
    console.log('1. Visit: http://localhost:3000/community/landing');
    console.log('2. Click "Choose Your Interests" button');
    console.log('3. Should redirect to: http://localhost:3000/community/onboarding');
    console.log('4. Click "Browse Forum Categories" button');
    console.log('5. Should also redirect to: http://localhost:3000/community/onboarding');
    console.log('6. On onboarding page, you can:');
    console.log('   - Select individual forums');
    console.log('   - Use "Select All" to choose all forums');
    console.log('   - Use "Clear All" to deselect all forums');
    console.log('   - Complete onboarding to get personalized dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testButtonRedirects();