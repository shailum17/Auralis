/**
 * Script to update existing weekly goals with new fields
 * - Add weekEnd field
 * - Add isCompleted field
 * - Add isOverdue field
 * - Mark completed goals
 * - Mark overdue goals
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateExistingGoals() {
  console.log('🔄 Updating existing weekly goals...\n');

  try {
    // Get all existing goals
    const goals = await prisma.weeklyGoal.findMany();
    console.log(`Found ${goals.length} existing goals to update\n`);

    let updatedCount = 0;
    let completedCount = 0;
    let overdueCount = 0;

    for (const goal of goals) {
      // Calculate weekEnd from weekStart
      const weekEnd = new Date(goal.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Check if goal is completed
      const isCompleted = goal.current >= goal.target;

      // Check if goal is overdue (week has passed and not completed)
      const now = new Date();
      const isOverdue = weekEnd < now && !isCompleted;

      // Update the goal
      await prisma.weeklyGoal.update({
        where: { id: goal.id },
        data: {
          weekEnd,
          isCompleted,
          isOverdue,
          completedAt: isCompleted ? goal.updatedAt : null,
        },
      });

      updatedCount++;
      if (isCompleted) completedCount++;
      if (isOverdue) overdueCount++;

      console.log(`✅ Updated: ${goal.name} (${goal.category})`);
      console.log(`   Week: ${goal.weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`);
      console.log(`   Progress: ${goal.current}/${goal.target}`);
      console.log(`   Status: ${isCompleted ? '✅ Completed' : isOverdue ? '⏰ Overdue' : '🔄 In Progress'}`);
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('📊 Update Summary:');
    console.log(`   Total goals updated: ${updatedCount}`);
    console.log(`   Completed goals: ${completedCount}`);
    console.log(`   Overdue goals: ${overdueCount}`);
    console.log(`   In progress: ${updatedCount - completedCount - overdueCount}`);
    console.log('='.repeat(60));
    console.log('\n✅ All existing goals have been updated!\n');

    // Auto-remove completed goals
    if (completedCount > 0) {
      console.log('🗑️  Auto-removing completed goals...');
      const deleted = await prisma.weeklyGoal.deleteMany({
        where: { isCompleted: true },
      });
      console.log(`✅ Removed ${deleted.count} completed goal(s)\n`);
    }

  } catch (error) {
    console.error('❌ Error updating goals:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingGoals();
