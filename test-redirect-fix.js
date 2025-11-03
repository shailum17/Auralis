// Test the redirect fix
async function testRedirectFix() {
  console.log('🧪 Testing redirect fix...\n');

  try {
    // Test all pages are accessible
    const pages = [
      { name: 'Landing', url: 'http://localhost:3000/community/landing' },
      { name: 'Onboarding', url: 'http://localhost:3000/community/onboarding' },
      { name: 'Community', url: 'http://localhost:3000/community' },
      { name: 'Interests', url: 'http://localhost:3000/community/interests' }
    ];

    for (const page of pages) {
      try {
        const response = await fetch(page.url);
        if (response.ok) {
          console.log(`✅ ${page.name} page accessible (${response.status})`);
        } else {
          console.log(`❌ ${page.name} page not accessible (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${page.name} page error:`, error.message);
      }
    }

    console.log('\n🎉 Redirect fix test completed!');
    console.log('\n📝 Manual testing steps:');
    console.log('1. Clear browser storage to simulate new user');
    console.log('2. Visit: http://localhost:3000/community/landing');
    console.log('3. Click "Choose Your Interests" button');
    console.log('4. Should stay on: http://localhost:3000/community/onboarding');
    console.log('5. Click "Browse Forum Categories" button');
    console.log('6. Should also stay on: http://localhost:3000/community/onboarding');
    console.log('7. Select forums and complete onboarding');
    console.log('8. Should redirect to: http://localhost:3000/community');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRedirectFix();