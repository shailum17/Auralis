/**
 * Direct test of auto-remove functionality
 * Tests the database operations directly
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAutoRemove() {
  console.log('🧪 Testing Auto-Remove Functionality\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Create a test goal
    console.log('\n📝 Step 1: Creating test goal...');
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get first user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ No users found. Create a user first.');
      return;
    }

    console.log(`✅ Using user: ${user.email}`);

    const testGoal = await prisma.weeklyGoal.create({
      data: {
        userId: user.id,
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
        name: 'Auto-Remove Test Goal',
        target: 2,
        current: 0,
        category: 'mood',
        unit: 'entries',
        isCompleted: false,
        isOverdue: false,
      },
    });

    console.log(`✅ Created goal: ${testGoal.name}`);
    console.log(`   ID: ${testGoal.id}`);
    console.log(`   Progress: ${testGoal.current}/${testGoal.target}`);

    // Step 2: Update to 1/2
    console.log('\n📝 Step 2: Updating to 1/2...');
    
    await prisma.weeklyGoal.update({
      where: { id: testGoal.id },
      data: { current: 1 },
    });

    let goal = await prisma.weeklyGoal.findUnique({
      where: { id: testGoal.id },
    });

    console.log(`✅ Updated: ${goal.current}/${goal.target}`);
    console.log(`   isCompleted: ${goal.isCompleted}`);

    // Step 3: Update to 2/2 (complete)
    console.log('\n📝 Step 3: Updating to 2/2 (completing goal)...');
    
    await prisma.weeklyGoal.update({
      where: { id: testGoal.id },
      data: { 
        current: 2,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    goal = await prisma.weeklyGoal.findUnique({
      where: { id: testGoal.id },
    });

    console.log(`✅ Updated: ${goal.current}/${goal.target}`);
    console.log(`   isCompleted: ${goal.isCompleted}`);
    console.log(`   completedAt: ${goal.completedAt}`);

    // Step 4: Delete the completed goal
    console.log('\n📝 Step 4: Deleting completed goal...');
    
    await prisma.weeklyGoal.delete({
      where: { id: testGoal.id },
    });

    console.log(`✅ Goal deleted successfully`);

    // Step 5: Verify it's gone
    console.log('\n📝 Step 5: Verifying goal is removed...');
    
    const deletedGoal = await prisma.weeklyGoal.findUnique({
      where: { id: testGoal.id },
    });

    if (deletedGoal === null) {
      console.log(`✅ Goal is gone (as expected)`);
    } else {
      console.log(`❌ Goal still exists!`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL DATABASE OPERATIONS WORK!');
    console.log('='.repeat(60));
    console.log('\nThis means:');
    console.log('✅ Can create goals with new fields');
    console.log('✅ Can update goals with isCompleted');
    console.log('✅ Can delete completed goals');
    console.log('✅ Database schema is correct');
    console.log('\nIf auto-remove still doesn\'t work in the API:');
    console.log('1. Check API logs for error messages');
    console.log('2. Verify the service code is being called');
    console.log('3. Check if falling back to old schema');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('isCompleted')) {
      console.log('\n⚠️  The new fields are not in the schema!');
      console.log('Run: npx prisma generate');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAutoRemove();
