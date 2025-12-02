/**
 * Fix goals with null weekEnd using Prisma raw queries
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixGoals() {
  console.log('🔧 Fixing goals with null or missing fields...\n');

  try {
    // Use raw MongoDB query to get all goals (bypassing Prisma validation)
    const goals = await prisma.$runCommandRaw({
      find: 'weekly_goals',
      filter: {}
    });

    const goalDocs = goals.cursor.firstBatch;
    console.log(`Found ${goalDocs.length} total goals\n`);

    let fixed = 0;
    let alreadyGood = 0;

    for (const goal of goalDocs) {
      const needsFix = !goal.week_end || goal.is_completed === undefined || goal.is_overdue === undefined;

      if (!needsFix) {
        alreadyGood++;
        continue;
      }

      // Calculate weekEnd from weekStart
      let weekStart;
      if (goal.week_start && goal.week_start.$date) {
        weekStart = new Date(goal.week_start.$date);
      } else if (goal.week_start) {
        weekStart = new Date(goal.week_start);
      } else {
        console.log(`⚠️  Skipping goal ${goal.name} - no week_start`);
        continue;
      }

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Check if completed
      const isCompleted = goal.current >= goal.target;

      // Check if overdue
      const now = new Date();
      const isOverdue = weekEnd < now && !isCompleted;

      // Update using raw command
      await prisma.$runCommandRaw({
        update: 'weekly_goals',
        updates: [{
          q: { _id: goal._id },
          u: {
            $set: {
              week_end: weekEnd,
              is_completed: isCompleted,
              is_overdue: isOverdue,
              completed_at: isCompleted ? (goal.updated_at || new Date()) : null
            }
          }
        }]
      });

      fixed++;
      console.log(`✅ Fixed: ${goal.name} (${goal.category})`);
      console.log(`   Progress: ${goal.current}/${goal.target}`);
      console.log(`   Status: ${isCompleted ? '✅ Completed' : isOverdue ? '⏰ Overdue' : '🔄 Active'}`);
      console.log('');
    }

    console.log('='.repeat(60));
    console.log(`✅ Fixed: ${fixed} goal(s)`);
    console.log(`✅ Already good: ${alreadyGood} goal(s)`);
    console.log(`✅ Total: ${goalDocs.length} goal(s)`);
    console.log('='.repeat(60));

    if (fixed > 0) {
      console.log('\n🎉 All goals fixed!');
      console.log('\nNext steps:');
      console.log('1. Restart your API server');
      console.log('2. Test goal completion');
      console.log('3. Auto-remove should work now!');
    } else {
      console.log('\n✅ All goals already have correct fields!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGoals();
