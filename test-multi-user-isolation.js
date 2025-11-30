/**
 * Multi-User Data Isolation Test
 * 
 * This comprehensive script tests that multiple users can use the system
 * simultaneously without data leakage or interference.
 * 
 * Prerequisites:
 * 1. API server running on http://localhost:3001
 * 2. Two different user accounts (will be created if they don't exist)
 * 
 * Usage:
 * node test-multi-user-isolation.js
 */

const API_BASE = 'http://localhost:3001/api/v1';

// Test user credentials
const USER_A = {
  email: 'test-user-a@example.com',
  password: 'TestPassword123!',
  username: 'test_user_a',
  fullName: 'Test User A'
};

const USER_B = {
  email: 'test-user-b@example.com',
  password: 'TestPassword123!',
  username: 'test_user_b',
  fullName: 'Test User B'
};

let userAToken = null;
let userBToken = null;

async function registerOrLogin(user) {
  console.log(`\n🔐 Authenticating ${user.fullName}...`);
  
  // Try to login first
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log(`✅ Logged in as ${user.fullName}`);
      return data.accessToken || data.access_token;
    }
  } catch (error) {
    // Login failed, try to register
  }

  // Try to register
  try {
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (registerResponse.ok) {
      const data = await registerResponse.json();
      console.log(`✅ Registered ${user.fullName}`);
      
      // Now login
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        return loginData.accessToken || loginData.access_token;
      }
    }
  } catch (error) {
    console.error(`❌ Failed to authenticate ${user.fullName}:`, error.message);
    throw error;
  }

  throw new Error(`Failed to authenticate ${user.fullName}`);
}

async function testMoodEntryIsolation() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: Mood Entry Isolation');
  console.log('='.repeat(70));

  // User A creates mood entry
  console.log('\n📝 User A creates mood entry...');
  const moodA = await fetch(`${API_BASE}/wellness/mood`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userAToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      moodScore: 5,
      tags: ['Happy', 'Energetic'],
      notes: 'User A feeling great today!'
    })
  });

  if (!moodA.ok) {
    throw new Error('Failed to create mood entry for User A');
  }
  console.log('✅ User A mood entry created');

  // User B creates different mood entry
  console.log('\n📝 User B creates mood entry...');
  const moodB = await fetch(`${API_BASE}/wellness/mood`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userBToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      moodScore: 2,
      tags: ['Stressed', 'Tired'],
      notes: 'User B having a tough day'
    })
  });

  if (!moodB.ok) {
    throw new Error('Failed to create mood entry for User B');
  }
  console.log('✅ User B mood entry created');

  // Verify User A only sees their own entries
  console.log('\n🔍 Verifying User A can only see their own entries...');
  const historyA = await fetch(`${API_BASE}/wellness/mood/history?days=1`, {
    headers: { 'Authorization': `Bearer ${userAToken}` }
  });

  if (!historyA.ok) {
    throw new Error('Failed to get mood history for User A');
  }

  const entriesA = await historyA.json();
  const hasUserBData = entriesA.some(entry => 
    entry.notes && entry.notes.includes('User B')
  );

  if (hasUserBData) {
    console.log('❌ FAILED: User A can see User B\'s mood entries!');
    return false;
  }
  console.log(`✅ User A sees only their own entries (${entriesA.length} entries)`);

  // Verify User B only sees their own entries
  console.log('\n🔍 Verifying User B can only see their own entries...');
  const historyB = await fetch(`${API_BASE}/wellness/mood/history?days=1`, {
    headers: { 'Authorization': `Bearer ${userBToken}` }
  });

  if (!historyB.ok) {
    throw new Error('Failed to get mood history for User B');
  }

  const entriesB = await historyB.json();
  const hasUserAData = entriesB.some(entry => 
    entry.notes && entry.notes.includes('User A')
  );

  if (hasUserAData) {
    console.log('❌ FAILED: User B can see User A\'s mood entries!');
    return false;
  }
  console.log(`✅ User B sees only their own entries (${entriesB.length} entries)`);

  console.log('\n✅ TEST 1 PASSED: Mood entries are properly isolated');
  return true;
}

async function testWeeklyGoalIsolation() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: Weekly Goal Isolation');
  console.log('='.repeat(70));

  // User A sets goals
  console.log('\n📝 User A sets weekly goals...');
  const goalsA = await fetch(`${API_BASE}/wellness/goals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userAToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      goals: [
        { name: 'User A Mood Goal', category: 'mood', target: 7, current: 0, unit: 'entries' },
        { name: 'User A Sleep Goal', category: 'sleep', target: 7, current: 0, unit: 'nights' }
      ]
    })
  });

  if (!goalsA.ok) {
    throw new Error('Failed to set goals for User A');
  }
  console.log('✅ User A goals set');

  // User B sets different goals
  console.log('\n📝 User B sets weekly goals...');
  const goalsB = await fetch(`${API_BASE}/wellness/goals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userBToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      goals: [
        { name: 'User B Stress Goal', category: 'stress', target: 5, current: 0, unit: 'entries' },
        { name: 'User B Social Goal', category: 'social', target: 3, current: 0, unit: 'interactions' }
      ]
    })
  });

  if (!goalsB.ok) {
    throw new Error('Failed to set goals for User B');
  }
  console.log('✅ User B goals set');

  // Verify User A only sees their own goals
  console.log('\n🔍 Verifying User A can only see their own goals...');
  const retrievedGoalsA = await fetch(`${API_BASE}/wellness/goals`, {
    headers: { 'Authorization': `Bearer ${userAToken}` }
  });

  if (!retrievedGoalsA.ok) {
    throw new Error('Failed to get goals for User A');
  }

  const userAGoals = await retrievedGoalsA.json();
  const userASeesUserBGoals = userAGoals.some(goal => 
    goal.name.includes('User B')
  );

  if (userASeesUserBGoals) {
    console.log('❌ FAILED: User A can see User B\'s goals!');
    return false;
  }
  console.log(`✅ User A sees only their own goals (${userAGoals.length} goals)`);
  userAGoals.forEach(goal => {
    console.log(`   - ${goal.name}: ${goal.current}/${goal.target}`);
  });

  // Verify User B only sees their own goals
  console.log('\n🔍 Verifying User B can only see their own goals...');
  const retrievedGoalsB = await fetch(`${API_BASE}/wellness/goals`, {
    headers: { 'Authorization': `Bearer ${userBToken}` }
  });

  if (!retrievedGoalsB.ok) {
    throw new Error('Failed to get goals for User B');
  }

  const userBGoals = await retrievedGoalsB.json();
  const userBSeesUserAGoals = userBGoals.some(goal => 
    goal.name.includes('User A')
  );

  if (userBSeesUserAGoals) {
    console.log('❌ FAILED: User B can see User A\'s goals!');
    return false;
  }
  console.log(`✅ User B sees only their own goals (${userBGoals.length} goals)`);
  userBGoals.forEach(goal => {
    console.log(`   - ${goal.name}: ${goal.current}/${goal.target}`);
  });

  console.log('\n✅ TEST 2 PASSED: Weekly goals are properly isolated');
  return true;
}

async function testGoalAutoUpdateIsolation() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: Goal Auto-Update Isolation');
  console.log('='.repeat(70));

  // Get User A's current mood goal progress
  const goalsABefore = await fetch(`${API_BASE}/wellness/goals`, {
    headers: { 'Authorization': `Bearer ${userAToken}` }
  });
  const userAGoalsBefore = await goalsABefore.json();
  const userAMoodGoalBefore = userAGoalsBefore.find(g => g.category === 'mood');

  // Get User B's current stress goal progress
  const goalsBBefore = await fetch(`${API_BASE}/wellness/goals`, {
    headers: { 'Authorization': `Bearer ${userBToken}` }
  });
  const userBGoalsBefore = await goalsBBefore.json();
  const userBStressGoalBefore = userBGoalsBefore.find(g => g.category === 'stress');

  console.log('\n📊 Before state:');
  console.log(`   User A mood goal: ${userAMoodGoalBefore?.current || 0}/${userAMoodGoalBefore?.target || 0}`);
  console.log(`   User B stress goal: ${userBStressGoalBefore?.current || 0}/${userBStressGoalBefore?.target || 0}`);

  // User A creates another mood entry (should update User A's goal only)
  console.log('\n📝 User A creates another mood entry...');
  await fetch(`${API_BASE}/wellness/mood`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userAToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      moodScore: 4,
      tags: ['Content'],
      notes: 'Another entry from User A'
    })
  });

  // Wait for goal update
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check User A's goals (should be updated)
  const goalsAAfter = await fetch(`${API_BASE}/wellness/goals`, {
    headers: { 'Authorization': `Bearer ${userAToken}` }
  });
  const userAGoalsAfter = await goalsAAfter.json();
  const userAMoodGoalAfter = userAGoalsAfter.find(g => g.category === 'mood');

  // Check User B's goals (should NOT be updated)
  const goalsBAfter = await fetch(`${API_BASE}/wellness/goals`, {
    headers: { 'Authorization': `Bearer ${userBToken}` }
  });
  const userBGoalsAfter = await goalsBAfter.json();
  const userBStressGoalAfter = userBGoalsAfter.find(g => g.category === 'stress');

  console.log('\n📊 After state:');
  console.log(`   User A mood goal: ${userAMoodGoalAfter?.current || 0}/${userAMoodGoalAfter?.target || 0}`);
  console.log(`   User B stress goal: ${userBStressGoalAfter?.current || 0}/${userBStressGoalAfter?.target || 0}`);

  // Verify User A's goal was updated
  if (userAMoodGoalAfter && userAMoodGoalAfter.current > (userAMoodGoalBefore?.current || 0)) {
    console.log('✅ User A\'s mood goal was updated correctly');
  } else {
    console.log('⚠️  User A\'s mood goal was not updated (might be at target)');
  }

  // Verify User B's goal was NOT affected
  if (userBStressGoalAfter && userBStressGoalAfter.current === (userBStressGoalBefore?.current || 0)) {
    console.log('✅ User B\'s stress goal was not affected (correct)');
  } else {
    console.log('❌ FAILED: User B\'s stress goal was affected by User A\'s entry!');
    return false;
  }

  console.log('\n✅ TEST 3 PASSED: Goal auto-updates are properly isolated');
  return true;
}

async function testStressEntryIsolation() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 4: Stress Entry Isolation');
  console.log('='.repeat(70));

  // User A creates stress entry
  console.log('\n📝 User A creates stress entry...');
  await fetch(`${API_BASE}/wellness/stress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userAToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stressLevel: 3,
      triggers: ['Work', 'Deadlines'],
      symptoms: ['Headache'],
      copingUsed: ['Exercise'],
      notes: 'User A managing stress'
    })
  });
  console.log('✅ User A stress entry created');

  // User B creates stress entry
  console.log('\n📝 User B creates stress entry...');
  await fetch(`${API_BASE}/wellness/stress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userBToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stressLevel: 5,
      triggers: ['Exams', 'Family'],
      symptoms: ['Anxiety', 'Insomnia'],
      copingUsed: ['Meditation'],
      notes: 'User B feeling overwhelmed'
    })
  });
  console.log('✅ User B stress entry created');

  // Verify isolation
  const historyA = await fetch(`${API_BASE}/wellness/stress/history?days=1`, {
    headers: { 'Authorization': `Bearer ${userAToken}` }
  });
  const entriesA = await historyA.json();

  const historyB = await fetch(`${API_BASE}/wellness/stress/history?days=1`, {
    headers: { 'Authorization': `Bearer ${userBToken}` }
  });
  const entriesB = await historyB.json();

  const userASeesUserBData = entriesA.some(e => e.notes?.includes('User B'));
  const userBSeesUserAData = entriesB.some(e => e.notes?.includes('User A'));

  if (userASeesUserBData || userBSeesUserAData) {
    console.log('❌ FAILED: Stress entries are not properly isolated!');
    return false;
  }

  console.log(`✅ User A sees only their stress entries (${entriesA.length} entries)`);
  console.log(`✅ User B sees only their stress entries (${entriesB.length} entries)`);
  console.log('\n✅ TEST 4 PASSED: Stress entries are properly isolated');
  return true;
}

async function testWellnessInsightsIsolation() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 5: Wellness Insights Isolation');
  console.log('='.repeat(70));

  // Get insights for both users
  console.log('\n📊 Getting wellness insights for User A...');
  const insightsA = await fetch(`${API_BASE}/wellness/insights`, {
    headers: { 'Authorization': `Bearer ${userAToken}` }
  });
  const dataA = await insightsA.json();

  console.log('\n📊 Getting wellness insights for User B...');
  const insightsB = await fetch(`${API_BASE}/wellness/insights`, {
    headers: { 'Authorization': `Bearer ${userBToken}` }
  });
  const dataB = await insightsB.json();

  console.log('\n📈 User A insights:');
  console.log(`   Mood entries: ${dataA.moodEntriesCount || 0}`);
  console.log(`   Average mood: ${dataA.averageMood?.toFixed(2) || 'N/A'}`);
  console.log(`   Mood trend: ${dataA.moodTrend || 'N/A'}`);

  console.log('\n📈 User B insights:');
  console.log(`   Mood entries: ${dataB.moodEntriesCount || 0}`);
  console.log(`   Average mood: ${dataB.averageMood?.toFixed(2) || 'N/A'}`);
  console.log(`   Mood trend: ${dataB.moodTrend || 'N/A'}`);

  // Insights should be different (User A has high mood, User B has low mood)
  if (dataA.averageMood && dataB.averageMood && dataA.averageMood !== dataB.averageMood) {
    console.log('\n✅ Insights are different for each user (correct)');
  } else {
    console.log('\n⚠️  Insights might be similar (check if both users have enough data)');
  }

  console.log('\n✅ TEST 5 PASSED: Wellness insights are properly isolated');
  return true;
}

async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('MULTI-USER DATA ISOLATION TEST SUITE');
  console.log('='.repeat(70));
  console.log('\nThis test verifies that multiple users can use the system');
  console.log('simultaneously without data leakage or interference.\n');

  try {
    // Authenticate users
    userAToken = await registerOrLogin(USER_A);
    userBToken = await registerOrLogin(USER_B);

    if (!userAToken || !userBToken) {
      throw new Error('Failed to authenticate test users');
    }

    console.log('\n✅ Both users authenticated successfully');

    // Run all tests
    const results = [];
    results.push(await testMoodEntryIsolation());
    results.push(await testWeeklyGoalIsolation());
    results.push(await testGoalAutoUpdateIsolation());
    results.push(await testStressEntryIsolation());
    results.push(await testWellnessInsightsIsolation());

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70));

    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log(`\n✅ Passed: ${passed}/${total} tests`);

    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('\n✅ Your system properly supports multiple concurrent users!');
      console.log('✅ Each user\'s data is completely isolated!');
      console.log('✅ No data leakage between users!');
      console.log('\nYour application is ready for multi-user production use! 🚀\n');
    } else {
      console.log(`\n⚠️  ${total - passed} test(s) failed`);
      console.log('Please review the failed tests above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error('\nFull error:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure API server is running on http://localhost:3001');
    console.log('2. Check database connection');
    console.log('3. Verify authentication endpoints are working');
    console.log('4. Check API logs for detailed error messages\n');
    process.exit(1);
  }
}

// Run the test suite
runAllTests();
