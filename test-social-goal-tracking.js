/**
 * Test Script: Social Connection Goal Tracking
 * 
 * This script tests the integration between social entries and weekly goals.
 * 
 * Prerequisites:
 * 1. API server running on http://localhost:3001
 * 2. User logged in with valid access token
 * 3. User has set a "Social Connection" weekly goal
 * 
 * Usage:
 * node test-social-goal-tracking.js <ACCESS_TOKEN>
 */

const ACCESS_TOKEN = process.argv[2];

if (!ACCESS_TOKEN) {
  console.error('❌ Error: Please provide an access token');
  console.log('Usage: node test-social-goal-tracking.js <ACCESS_TOKEN>');
  process.exit(1);
}

const API_BASE = 'http://localhost:3001/api/v1';

async function testSocialGoalTracking() {
  console.log('🧪 Testing Social Connection Goal Tracking\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Get current weekly goals
    console.log('\n📊 Step 1: Fetching current weekly goals...');
    const goalsResponse = await fetch(`${API_BASE}/wellness/goals`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!goalsResponse.ok) {
      throw new Error(`Failed to fetch goals: ${goalsResponse.status}`);
    }

    const currentGoals = await goalsResponse.json();
    console.log(`✅ Found ${currentGoals.length} weekly goal(s)`);
    
    const socialGoals = currentGoals.filter(g => g.category === 'social');
    
    if (socialGoals.length === 0) {
      console.log('\n⚠️  No social connection goals found!');
      console.log('Please set a "Social Connection" goal first:');
      console.log('1. Go to Dashboard');
      console.log('2. Click "Set Goals" in Wellness Insights');
      console.log('3. Select "Social Connection" goal');
      console.log('4. Save and run this test again\n');
      return;
    }

    console.log('\n📋 Social Connection Goals:');
    socialGoals.forEach(goal => {
      console.log(`   - ${goal.name}: ${goal.current}/${goal.target} (${Math.round((goal.current/goal.target)*100)}%)`);
    });

    const beforeProgress = socialGoals[0].current;

    // Step 2: Create a social connection entry
    console.log('\n📝 Step 2: Creating a social connection entry...');
    const socialEntryData = {
      connectionQuality: 4,
      interactions: ['In-person', 'Coffee/meal'],
      activities: ['Hangout', 'Coffee/meal'],
      feelings: ['Happy', 'Connected'],
      notes: 'Had a great coffee chat with a friend!'
    };

    const createResponse = await fetch(`${API_BASE}/wellness/social`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(socialEntryData),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => null);
      throw new Error(`Failed to create social entry: ${createResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const createdEntry = await createResponse.json();
    console.log(`✅ Social entry created successfully!`);
    console.log(`   - Connection Quality: ${createdEntry.connectionQuality}/5`);
    console.log(`   - Quality Score: ${createdEntry.qualityScoring?.score}/100`);

    // Step 3: Wait a moment for database to update
    console.log('\n⏳ Step 3: Waiting for goal update...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Fetch updated goals
    console.log('\n📊 Step 4: Fetching updated weekly goals...');
    const updatedGoalsResponse = await fetch(`${API_BASE}/wellness/goals`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!updatedGoalsResponse.ok) {
      throw new Error(`Failed to fetch updated goals: ${updatedGoalsResponse.status}`);
    }

    const updatedGoals = await updatedGoalsResponse.json();
    const updatedSocialGoals = updatedGoals.filter(g => g.category === 'social');

    console.log('\n📋 Updated Social Connection Goals:');
    updatedSocialGoals.forEach(goal => {
      console.log(`   - ${goal.name}: ${goal.current}/${goal.target} (${Math.round((goal.current/goal.target)*100)}%)`);
    });

    const afterProgress = updatedSocialGoals[0].current;

    // Step 5: Verify the update
    console.log('\n🔍 Step 5: Verifying goal update...');
    console.log(`   Before: ${beforeProgress}/${socialGoals[0].target}`);
    console.log(`   After:  ${afterProgress}/${updatedSocialGoals[0].target}`);
    console.log(`   Change: +${afterProgress - beforeProgress}`);

    if (afterProgress > beforeProgress) {
      console.log('\n✅ SUCCESS! Social connection entry correctly updated weekly goal! 🎉');
      console.log(`   Progress increased from ${beforeProgress} to ${afterProgress}`);
    } else if (afterProgress === beforeProgress && afterProgress === socialGoals[0].target) {
      console.log('\n✅ Goal already at target! No change expected.');
      console.log(`   Current: ${afterProgress}/${socialGoals[0].target} (100% complete)`);
    } else {
      console.log('\n❌ FAILED! Goal was not updated.');
      console.log('   Possible issues:');
      console.log('   1. Goal update logic not executing');
      console.log('   2. Database transaction issue');
      console.log('   3. Category mismatch');
      console.log('\n   Check API logs for more details.');
    }

    // Step 6: Fetch social history to confirm entry was saved
    console.log('\n📜 Step 6: Verifying social entry was saved...');
    const historyResponse = await fetch(`${API_BASE}/wellness/social/history?days=1`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log(`✅ Found ${history.length} social entry/entries in the last day`);
      if (history.length > 0) {
        const latestEntry = history[0];
        console.log(`   Latest: Quality ${latestEntry.connectionQuality}/5, ${latestEntry.feelings?.join(', ')}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the test
testSocialGoalTracking();
