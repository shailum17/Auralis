import { NextRequest, NextResponse } from 'next/server';
import { databaseServer } from '@/lib/database-server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting user migration...');
    
    // Connect to database
    const connected = await databaseServer.connect();
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 });
    }

    try {
      // Get all users
      const users = await databaseServer.getAllUsers();
      console.log(`📊 Found ${users.length} users to migrate`);

      let migratedCount = 0;
      let alreadyVerifiedCount = 0;

      for (const user of users) {
        if (!user.emailVerified) {
          // Update user to be email verified
          const updated = await databaseServer.updateUserEmailVerification(user.email);
          if (updated) {
            migratedCount++;
            console.log(`✅ Migrated user: ${user.email}`);
          }
        } else {
          alreadyVerifiedCount++;
        }
      }

      await databaseServer.disconnect();

      console.log(`✅ Migration completed: ${migratedCount} users migrated, ${alreadyVerifiedCount} already verified`);

      return NextResponse.json({
        success: true,
        data: {
          totalUsers: users.length,
          migratedUsers: migratedCount,
          alreadyVerified: alreadyVerifiedCount
        },
        message: `Migration completed successfully. ${migratedCount} users migrated.`
      });

    } catch (dbError) {
      await databaseServer.disconnect();
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Migration failed: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check current user verification status
    const connected = await databaseServer.connect();
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 });
    }

    try {
      const users = await databaseServer.getAllUsers();
      const verifiedCount = users.filter(u => u.emailVerified).length;
      const unverifiedCount = users.filter(u => !u.emailVerified).length;

      await databaseServer.disconnect();

      return NextResponse.json({
        success: true,
        data: {
          totalUsers: users.length,
          verifiedUsers: verifiedCount,
          unverifiedUsers: unverifiedCount,
          needsMigration: unverifiedCount > 0
        }
      });

    } catch (dbError) {
      await databaseServer.disconnect();
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Status check error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Status check failed: ' + (error as Error).message
    }, { status: 500 });
  }
}