// Test the new flexible forum layout
async function testForumLayout() {
  console.log('🧪 Testing flexible forum layout...\n');

  try {
    // Step 1: Test community dashboard access
    console.log('1. Testing community dashboard...');
    const dashboardResponse = await fetch('http://localhost:3000/community');
    
    if (dashboardResponse.ok) {
      console.log('✅ Community dashboard accessible');
      console.log(`   Status: ${dashboardResponse.status}`);
    } else {
      console.log('❌ Community dashboard not accessible');
      console.log(`   Status: ${dashboardResponse.status}`);
    }

    // Step 2: Test new forum layout
    console.log('\n2. Testing flexible forum layout...');
    const forumResponse = await fetch('http://localhost:3000/community/forum');
    
    if (forumResponse.ok) {
      console.log('✅ Forum layout accessible');
      console.log(`   Status: ${forumResponse.status}`);
    } else {
      console.log('❌ Forum layout not accessible');
      console.log(`   Status: ${forumResponse.status}`);
    }

    // Step 3: Test onboarding flow
    console.log('\n3. Testing onboarding flow...');
    const onboardingResponse = await fetch('http://localhost:3000/community/onboarding');
    
    if (onboardingResponse.ok) {
      console.log('✅ Onboarding flow accessible');
      console.log(`   Status: ${onboardingResponse.status}`);
    } else {
      console.log('❌ Onboarding flow not accessible');
      console.log(`   Status: ${onboardingResponse.status}`);
    }

    console.log('\n🎉 Forum layout test completed!');
    console.log('\n📝 Manual testing steps:');
    console.log('1. Visit: http://localhost:3000/community');
    console.log('2. Click "Browse Forum" to see the new flexible layout');
    console.log('3. Test sidebar collapse/expand functionality');
    console.log('4. Try different screen sizes to see responsive behavior');
    console.log('5. Test category filtering and search functionality');

    console.log('\n🎨 New Features:');
    console.log('• Collapsible sidebar with toggle button');
    console.log('• Responsive design that adapts to screen size');
    console.log('• More space for content when sidebar is collapsed');
    console.log('• Improved user profile section in sidebar');
    console.log('• Better category navigation with counts');
    console.log('• Enhanced post cards with engagement metrics');
    console.log('• Quick actions in sidebar');
    console.log('• Smooth animations and transitions');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testForumLayout();