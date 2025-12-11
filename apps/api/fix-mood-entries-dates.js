const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMoodEntriesDates() {
  console.log('🔧 Checking mood entries for date consistency...');
  
  try {
    // Get all mood entries
    const moodEntries = await prisma.moodEntry.findMany({
      select: {
        id: true,
        createdAt: true,
        moodScore: true,
      }
    });

    console.log(`📊 Found ${moodEntries.length} mood entries`);

    // Check for any entries with invalid dates
    const invalidEntries = moodEntries.filter(entry => 
      !entry.createdAt || isNaN(new Date(entry.createdAt).getTime())
    );

    if (invalidEntries.length > 0) {
      console.log(`⚠️  Found ${invalidEntries.length} entries with invalid dates`);
      
      // Fix invalid dates by setting them to current time
      for (const entry of invalidEntries) {
        await prisma.moodEntry.update({
          where: { id: entry.id },
          data: { createdAt: new Date() }
        });
        console.log(`✅ Fixed date for mood entry ${entry.id}`);
      }
    } else {
      console.log('✅ All mood entries have valid dates');
    }

    // Verify all entries now have valid moodScore values
    const entriesWithoutMoodScore = moodEntries.filter(entry => 
      !entry.moodScore || entry.moodScore < 1 || entry.moodScore > 5
    );

    if (entriesWithoutMoodScore.length > 0) {
      console.log(`⚠️  Found ${entriesWithoutMoodScore.length} entries with invalid mood scores`);
      
      // Set default mood score of 3 for entries without valid scores
      for (const entry of entriesWithoutMoodScore) {
        await prisma.moodEntry.update({
          where: { id: entry.id },
          data: { moodScore: 3 } // Default neutral mood
        });
        console.log(`✅ Fixed mood score for entry ${entry.id}`);
      }
    } else {
      console.log('✅ All mood entries have valid mood scores');
    }

    console.log('🎉 Mood entries date fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing mood entries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMoodEntriesDates();