/**
 * Remove all completed goals from the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeCompletedGoals() {
  console.log('🗑️  Removing completed goals...\n');

  try {
    // Find all completed goals
    const completedGoals = await prisma.weeklyGoal.findMany({
      where: {
        OR: [
          { isCompleted: true },
          { 
            current: { gte: prisma.weeklyGoal.fields.target }
          }
        ]
      }
    });

    console.log(`Found ${completedGoals.length} completed goal(s)\n`);

    if (completedGoals.length === 0) {
      console.log('✅ No completed goals to remove!');
      return;
    }

    // Show what will be removed
    completedGoals.forEach(goal => {
      console.log(`📋 ${goal.name}`);
      console.log(`   Progress: ${goal.current}/${goal.target}`);
      console.log(`   Category: ${goal.category}`);
      console.log(`   Completed: ${goal.isCompleted}`);
      console.log('');
    });

    // Remove them
    const result = await prisma.weeklyGoal.deleteMany({
      where: {
        OR: [
          { isCompleted: true },
          {
            current: { gte: prisma.weeklyGoal.fields.target }
          }
        ]
      }
    });

    console.log('='.repeat(60));
    console.log(`✅ Removed ${result.count} completed goal(s)!`);
    console.log('='.repeat(60));
    console.log('\nThese goals were already completed and should have been');
    console.log('auto-removed. They are now cleaned up.');
    console.log('\nNext time you complete a goal, it will auto-remove correctly!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Try alternative method using raw query
    console.log('\nTrying alternative method...');
    
    try {
      const goals = await prisma.$runCommandRaw({
        find: 'weekly_goals',
        filter: {
          $or: [
            { is_completed: true },
            { $expr: { $gte: ['$current', '$target'] } }
          ]
        }
      });

      const goalDocs = goals.cursor.firstBatch;
      console.log(`\nFound ${goalDocs.length} completed goals using raw query`);

      for (const goal of goalDocs) {
        await prisma.$runCommandRaw({
          delete: 'weekly_goals',
          deletes: [{
            q: { _id: goal._id },
            limit: 1
          }]
        });
        console.log(`✅ Removed: ${goal.name}`);
      }

      console.log(`\n✅ Removed ${goalDocs.length} completed goal(s)!`);

    } catch (rawError) {
      console.error('❌ Alternative method also failed:', rawError.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

removeCompletedGoals();
