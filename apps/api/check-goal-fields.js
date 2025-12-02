/**
 * Check if WeeklyGoal has the new fields in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGoalFields() {
  console.log('🔍 Checking WeeklyGoal fields in database...\n');

  try {
    // Get one goal to check its fields
    const goal = await prisma.weeklyGoal.findFirst();

    if (!goal) {
      console.log('⚠️  No goals found in database. Create a goal first.');
      return;
    }

    console.log('📊 Found goal:', goal.name);
    console.log('\n✅ Checking fields:');
    
    // Check each field
    const fields = [
      'id',
      'userId',
      'weekStart',
      'weekEnd',
      'name',
      'target',
      'current',
      'category',
      'unit',
      'isCompleted',
      'isOverdue',
      'completedAt',
      'createdAt',
      'updatedAt'
    ];

    fields.forEach(field => {
      const exists = field in goal;
      const value = goal[field];
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${field}: ${exists ? (value !== null && value !== undefined ? value : 'null') : 'MISSING'}`);
    });

    // Check if new fields exist
    const hasNewFields = 'weekEnd' in goal && 'isCompleted' in goal && 'isOverdue' in goal;
    
    console.log('\n' + '='.repeat(60));
    if (hasNewFields) {
      console.log('✅ SUCCESS! Database has all new fields!');
      console.log('\nNew fields:');
      console.log(`   weekEnd: ${goal.weekEnd}`);
      console.log(`   isCompleted: ${goal.isCompleted}`);
      console.log(`   isOverdue: ${goal.isOverdue}`);
      console.log(`   completedAt: ${goal.completedAt || 'null'}`);
    } else {
      console.log('❌ PROBLEM! Database is missing new fields!');
      console.log('\nYou need to run:');
      console.log('   cd apps/api');
      console.log('   npx prisma db push');
      console.log('   node update-existing-goals.js');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Database connection failed');
    console.log('2. Prisma client not generated');
    console.log('3. Schema not pushed to database');
  } finally {
    await prisma.$disconnect();
  }
}

checkGoalFields();
