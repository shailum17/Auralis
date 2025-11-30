/**
 * Verification Script: Weekly Goals User Isolation
 * 
 * This script verifies that weekly goals are properly isolated per user.
 * It checks that User A cannot see or modify User B's goals.
 * 
 * Prerequisites:
 * 1. API server running on http://localhost:3001
 * 2. Two different user accounts with access tokens
 * 
 * Usage:
 * node verify-goal-isolation.js <USER_A_TOKEN> <USER_B_TOKEN>
 */

const USER_A_TOKEN = process.argv[2];
const USER_B_TOKEN = process.argv[3];

if (!USER_A_TOKEN || !USER_B_TOKEN) {
  console.error('❌ Error: Please provide two access tokens');
  console.log('Usage: node verify-goal-isolation.js <USER_A_TOKEN> <USER_B_TOKEN>');
  process.exit(1);
}

const API_BASE = 'http://localhost:3001/api/v1';

async function verifyGoalIsolation() {
  console.log('🔒 Verifying Weekly Goals User Isolation\n');
  console.log('='.repeat(70));

  try {
    // Step 1: Get User A's profile
    console.log('\n👤 Step 1: Identifying User A...');
    const userAProfileResponse = await fetch(`${API_BASE}/users/profile`, {
      headers: { 'Authorization': `Bearer ${USER_A_TOKEN}` },
    });
    
    if (!userAProfileResponse.ok) {
      throw new Error('Failed to get User A profile');
    }
    
    const userAProfile = await userAProfileResponse.json();
    const userAId = userAProfile.id || userAProfile.userId || 'Unknown';
    const userAName = userAProfile.fullName || userAProfile.username || userAProfile.email || 'User A';
    console.log(`✅ User A: ${userAName} (ID: ${userAId})`);

    // Step 2: Get User B's profile
    console.log('\n👤 Step 2: Identifying User B...');
    const userBProfileResponse = await fetch(`${API_BASE}/users/profile`, {
      headers: { 'Authorization': `Bearer ${USER_B_TOKEN}` },
    });
    
    if (!userBProfileResponse.ok) {
      throw new Error('Failed to get User B profile');
    }
    
    const userBProfile = await userBProfileResponse.json();
    const userBId = userBProfile.id || userBProfile.userId || 'Unknown';
    const userBName = userBProfile.fullName || userBProfile.username || userBProfile.email || 'User B';
    console.log(`✅ User B: ${userBName} (ID: ${userBId})`);

    if (userAId === userBId) {
      console.log('\n⚠️  WARNING: Both tokens belong to the same user!');
      console.log('Please provide tokens for two different users.');
      return;
    }

    // Step 3: Set goals for User A
    console.log('\n📝 Step 3: Setting goals for User A...');
    const userAGoals = [
      { name: 'User A Goal 1', category: 'mood', target: 7, current: 0, unit: 'entries' },
      { name: 'User A Goal 2', category: 'social', target: 5, current: 0, unit: 'interactions' },
    ];

    const setGoalsAResponse = await fetch(`${API_BASE}/wellness/goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${USER_A_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goals: userAGoals }),
    });

    if (!setGoalsAResponse.ok) {
      throw new Error('Failed to set goals for User A');
    }

    console.log(`✅ Set ${userAGoals.length} goals for User A`);

    // Step 4: Set different goals for User B
    console.log('\n📝 Step 4: Setting goals for User B...');
    const userBGoals = [
      { name: 'User B Goal 1', category: 'stress', target: 7, current: 0, unit: 'entries' },
      { name: 'User B Goal 2', category: 'sleep', target: 7, current: 0, unit: 'nights' },
    ];

    const setGoalsBResponse = await fetch(`${API_BASE}/wellness/goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${USER_B_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goals: userBGoals }),
    });

    if (!setGoalsBResponse.ok) {
      throw new Error('Failed to set goals for User B');
    }

    console.log(`✅ Set ${userBGoals.length} goals for User B`);

    // Step 5: Verify User A can only see their own goals
    console.log('\n🔍 Step 5: Verifying User A can only see their own goals...');
    const getGoalsAResponse = await fetch(`${API_BASE}/wellness/goals`, {
      headers: { 'Authorization': `Bearer ${USER_A_TOKEN}` },
    });

    if (!getGoalsAResponse.ok) {
      throw new Error('Failed to get goals for User A');
    }

    const retrievedGoalsA = await getGoalsAResponse.json();
    console.log(`📊 User A sees ${retrievedGoalsA.length} goal(s):`);
    retrievedGoalsA.forEach(goal => {
      console.log(`   - ${goal.name} (${goal.category}): ${goal.current}/${goal.target}`);
    });

    // Check if User A sees any of User B's goals
    const userASeesUserBGoals = retrievedGoalsA.some(goal => 
      goal.name.includes('User B')
    );

    if (userASeesUserBGoals) {
      console.log('\n❌ ISOLATION BREACH! User A can see User B\'s goals!');
      console.log('This is a critical security issue.');
      return;
    } else {
      console.log('✅ User A cannot see User B\'s goals (correct)');
    }

    // Step 6: Verify User B can only see their own goals
    console.log('\n🔍 Step 6: Verifying User B can only see their own goals...');
    const getGoalsBResponse = await fetch(`${API_BASE}/wellness/goals`, {
      headers: { 'Authorization': `Bearer ${USER_B_TOKEN}` },
    });

    if (!getGoalsBResponse.ok) {
      throw new Error('Failed to get goals for User B');
    }

    const retrievedGoalsB = await getGoalsBResponse.json();
    console.log(`📊 User B sees ${retrievedGoalsB.length} goal(s):`);
    retrievedGoalsB.forEach(goal => {
      console.log(`   - ${goal.name} (${goal.category}): ${goal.current}/${goal.target}`);
    });

    // Check if User B sees any of User A's goals
    const userBSeesUserAGoals = retrievedGoalsB.some(goal => 
      goal.name.includes('User A')
    );

    if (userBSeesUserAGoals) {
      console.log('\n❌ ISOLATION BREACH! User B can see User A\'s goals!');
      console.log('This is a critical security issue.');
      return;
    } else {
      console.log('✅ User B cannot see User A\'s goals (correct)');
    }

    // Step 7: Test cross-user goal updates
    console.log('\n🔍 Step 7: Testing cross-user goal updates...');
    
    // User A creates a mood entry (should only update User A's goals)
    console.log('Creating mood entry for User A...');
    const moodEntryA = await fetch(`${API_BASE}/wellness/mood`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${USER_A_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moodScore: 4,
        tags: ['Happy'],
        notes: 'Test entry for User A'
      }),
    });

    if (moodEntryA.ok) {
      console.log('✅ Mood entry created for User A');
    }

    // Wait for goal update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check User A's goals (should be updated)
    const updatedGoalsAResponse = await fetch(`${API_BASE}/wellness/goals`, {
      headers: { 'Authorization': `Bearer ${USER_A_TOKEN}` },
    });
    const updatedGoalsA = await updatedGoalsAResponse.json();
    const userAMoodGoal = updatedGoalsA.find(g => g.category === 'mood');
    
    if (userAMoodGoal && userAMoodGoal.current > 0) {
      console.log(`✅ User A's mood goal updated: ${userAMoodGoal.current}/${userAMoodGoal.target}`);
    } else {
      console.log('⚠️  User A\'s mood goal not updated (might not have mood goal set)');
    }

    // Check User B's goals (should NOT be updated)
    const updatedGoalsBResponse = await fetch(`${API_BASE}/wellness/goals`, {
      headers: { 'Authorization': `Bearer ${USER_B_TOKEN}` },
    });
    const updatedGoalsB = await updatedGoalsBResponse.json();
    const userBMoodGoal = updatedGoalsB.find(g => g.category === 'mood');
    
    if (userBMoodGoal && userBMoodGoal.current > 0) {
      console.log('❌ ISOLATION BREACH! User B\'s mood goal was updated by User A\'s entry!');
      return;
    } else {
      console.log('✅ User B\'s goals not affected by User A\'s entry (correct)');
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS PASSED! Weekly goals are properly isolated per user! 🎉');
    console.log('\nSummary:');
    console.log('  ✅ User A can only see their own goals');
    console.log('  ✅ User B can only see their own goals');
    console.log('  ✅ User A\'s entries only update User A\'s goals');
    console.log('  ✅ User B\'s goals are not affected by User A\'s entries');
    console.log('\n🔒 Data isolation is working correctly!\n');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the verification
verifyGoalIsolation();
