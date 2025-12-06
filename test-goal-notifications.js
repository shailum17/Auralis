/**
 * Test Goal Notification System
 * 
 * This script tests the email notification system for:
 * 1. Goal completion notifications
 * 2. Overdue goal notifications
 * 
 * Usage:
 * node test-goal-notifications.js <ACCESS_TOKEN>
 */

const ACCESS_TOKEN = process.argv[2];

if (!ACCESS_TOKEN) {
  console.error('❌ Error: Please provide an access token');
  console.log('Usage: node test-goal-notifications.js <ACCESS_TOKEN>');
  process.exit(1);
}

const API_BASE = 'http://localhost:3001/api/v1';

async function testGoalNotifications() {
  console.log('📧 Testing Goal Notification System\n');
  console.log('='.repeat(70));

  try {
    // Test 1: Set a goal with low target for easy completion
    console.log('\n📝 Test 1: Setting a test goal...');
    const setGoalsResponse = await fetch(`${API_BASE}/wellness/goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goals: [
          {
            name: 'Test Notification Goal',
            category: 'mood',
            target: 2,
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

    // Test 2: Complete the goal by creating mood entries
    console.log('\n📝 Test 2: Creating mood entries to complete goal...');
    
    // First entry
    await fetch(`${API_BASE}/wellness/mood`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moodScore: 4,
        tags: ['Happy'],
        notes: 'Testing notification system - entry 1'
      }),
    });
    console.log('   ✅ Created entry 1/2');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Second entry (should complete the goal)
    const moodResponse = await fetch(`${API_BASE}/wellness/mood`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moodScore: 5,
        tags: ['Excited'],
        notes: 'Testing notification system - entry 2 (completing goal!)'
      }),
    });

    if (!moodResponse.ok) {
      throw new Error('Failed to create mood entry');
    }

    const moodResult = await moodResponse.json();
    console.log('   ✅ Created entry 2/2');

    // Check if goal was completed
    if (moodResult.completedGoals && moodResult.completedGoals.length > 0) {
      console.log('\n🎉 Goal completed!');
      console.log(`   Goal: ${moodResult.completedGoals[0].name}`);
      console.log('   📧 Completion email should have been sent!');
    } else {
      console.log('\n⚠️  Goal not marked as completed in response');
    }

    // Test 3: Check for overdue goals (manual trigger)
    console.log('\n📝 Test 3: Checking for overdue goals...');
    const overdueResponse = await fetch(`${API_BASE}/wellness/goals/check-overdue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (overdueResponse.ok) {
      console.log('✅ Overdue goals check completed');
      console.log('   📧 Overdue notifications sent (if any goals were overdue)');
    } else {
      console.log('⚠️  Overdue check endpoint may not be accessible');
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ NOTIFICATION TEST SUMMARY');
    console.log('='.repeat(70));
    console.log('\n✅ Goal completion notification system tested');
    console.log('✅ Overdue goal check system tested');
    console.log('\n📧 Check your email inbox for:');
    console.log('   1. Goal completion email (if goal was completed)');
    console.log('   2. Overdue goal email (if you had overdue goals)');
    console.log('\n💡 Note: If SMTP is not configured, check API logs for email content');
    console.log('   The system will log email details to console in development mode.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure API server is running on http://localhost:3001');
    console.log('2. Check that you have a valid access token');
    console.log('3. Review API logs for email sending details');
    console.log('4. Verify SMTP configuration in .env file\n');
    process.exit(1);
  }
}

// Run the test
testGoalNotifications();
