/**
 * Fix goals with null weekEnd values
 * This uses raw MongoDB queries to bypass Prisma validation
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixNullWeekEnds() {
  console.log('🔧 Fixing goals with null weekEnd values...\n');

  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    const collection = db.collection('weekly_goals');

    // Find goals with null weekEnd
    const goalsWithNullWeekEnd = await collection.find({
      week_end: null
    }).toArray();

    console.log(`Found ${goalsWithNullWeekEnd.length} goals with null weekEnd\n`);

    if (goalsWithNullWeekEnd.length === 0) {
      console.log('✅ No goals need fixing!');
      return;
    }

    let fixed = 0;

    for (const goal of goalsWithNullWeekEnd) {
      // Calculate weekEnd from weekStart
      const weekStart = new Date(goal.week_start);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Check if completed
      const isCompleted = goal.current >= goal.target;

      // Check if overdue
      const now = new Date();
      const isOverdue = weekEnd < now && !isCompleted;

      // Update the goal
      await collection.updateOne(
        { _id: goal._id },
        {
          $set: {
            week_end: weekEnd,
            is_completed: isCompleted,
            is_overdue: isOverdue,
            completed_at: isCompleted ? (goal.updated_at || new Date()) : null
          }
        }
      );

      fixed++;
      console.log(`✅ Fixed: ${goal.name} (${goal.category})`);
      console.log(`   Week: ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`);
      console.log(`   Status: ${isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}`);
      console.log('');
    }

    console.log('='.repeat(60));
    console.log(`✅ Fixed ${fixed} goal(s)!`);
    console.log('='.repeat(60));
    console.log('\nNow restart your API server and try again!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
  }
}

fixNullWeekEnds();
