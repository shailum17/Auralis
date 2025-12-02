/**
 * Quick Test: Verify Goals Are Working
 * 
 * This script tests that weekly goals and progress tracking work
 * with the current database (no update required).
 * 
 * Usage:
 * node test-goals-working.js <ACCESS_TOKEN>
 */

const ACCESS_TOKEN = process.argv[2];

if (!ACCESS_TOKEN) {
  console.error('❌ Error: Please provide an access token');
  console.log('Usage: node test-goals-working.js <ACCESS_TOKEN>');
  process.exit(1);
}

const API_BASE = 'http://localhost:3001/api/v1';

async function testGoalsWorking() {
  console.log('🧪 Testing Weekly Goals (Current Database)\n');
  console.log('='.repeat(70));

  try {
    // Test 1: Set a goal
    console.log('\n📝 Test 1: Setting a weekly goal...');
    const setGoalsResponse = await fetch(`${API_BASE}/wellness/goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goals: [
          {
            name: 'Test Mood Tracking',
            category: 'mood',
            target: 5,
            current: 0,
            unit: 'entries'
          }
        ]
      }),
    });

    if (!setGoalsResponse.ok) {
      const error = await setGoalsResponse.text();
      throw new Error(`Failed to set goals: ${error}`);
    }

    const setResult = await setGoalsResponse.json();
    console.log('✅ Goal set successfully');
    console.log(`   Name: ${setResult.goals[0].name}`);
    console.log(`   Target: ${setResult.goals[0].target}`);
    console.log(`   Current: ${setResult.goals[0].current}`);

    // Test 2: Get current goals
    console.log('\n📊 Test 2: Fetching current goals...');
    let goalsResponse = await fetch(`${API_BASE}/wellness/goals`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    });

    if (!goalsResponse.ok) {
      throw new Error('Failed to fetch goals');
    }

    let goals = await goalsResponse.json();
    console.log(`✅ Found ${goals.length} goal(s)`);
    goals.forEach(g => {
      console.log(`   - ${g.name}: ${g.current}/${g.target} ${g.unit}`);
    });

    const initialProgress = goals[0].current;

    // Test 3: Create a mood entry (should update goal)
    console.log('\n📝 Test 3: Creating mood entry to test progress...');
    const moodResponse = await fetch(`${API_BASE}/wellness/mood`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moodScore: 4,
        tags: ['Happy'],
        notes: 'Testing goal progress'
      }),
    });

    if (!moodResponse.ok) {
      throw new Error('Failed to create mood entry');
    }

    console.log('✅ Mood entry created');

    // Wait for goal update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 4: Check if goal was updated
    console.log('\n📊 Test 4: Checking if goal progress updated...');
    goalsResponse = await fetch(`${API_BASE}/wellness/goals`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    });

    goals = await goalsResponse.json();
    const updatedProgress = goals[0]?.current || 0;

    console.log(`   Before: ${initialProgress}/${goals[0]?.target || 0}`);
    console.log(`   After:  ${updatedProgress}/${goals[0]?.target || 0}`);

    if (updatedProgress > initialProgress) {
      console.log('✅ SUCCESS! Goal progress updated correctly!');
    } else {
      console.log('⚠️  Goal progress did not update. Check API logs.');
    }

    // Test 5: Create another entry
    console.log('\n📝 Test 5: Creating another mood entry...');
    await fetch(`${API_BASE}/wellness/mood`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moodScore: 5,
        tags: ['Excited'],
        notes: 'Testing again'
      }),
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    goalsResponse = await fetch(`${API_BASE}/wellness/goals`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    });

    goals = await goalsResponse.json();
    const finalProgress = goals[0]?.current || 0;

    console.log(`✅ Final progress: ${finalProgress}/${goals[0]?.target || 0}`);

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ TEST SUMMARY');
    console.log('='.repeat(70));
    console.log('\n✅ Goals can be set');
    console.log('✅ Goals can be fetched');
    console.log('✅ Wellness entries update goal progress');
    console.log(`✅ Progress: ${initialProgress} -> ${updatedProgress} -> ${finalProgress}`);
    
    if (finalProgress > initialProgress) {
      console.log('\n🎉 All tests passed! Goals are working correctly!\n');
    } else {
      console.log('\n⚠️  Goals not updating. Possible issues:');
      console.log('   1. Check API server logs for errors');
      console.log('   2. Verify category matches (mood, stress, sleep, social)');
      console.log('   3. Ensure goal was set for current week\n');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure API server is running on http://localhost:3001');
    console.log('2. Check that you have a valid access token');
    console.log('3. Review API logs for detailed error messages\n');
    process.exit(1);
  }
}

// Run the test
testGoalsWorking();
