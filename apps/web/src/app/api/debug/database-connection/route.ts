import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Check environment variables
    const dbUrl = process.env.DATABASE_URL;
    console.log('📝 DATABASE_URL exists:', !!dbUrl);
    console.log('📝 DATABASE_URL preview:', dbUrl ? dbUrl.substring(0, 50) + '...' : 'Not set');
    
    // Test 2: Import database server
    let databaseServer;
    try {
      const dbModule = await import('@/lib/database-server');
      databaseServer = dbModule.databaseServer;
      console.log('✅ Database server imported successfully');
    } catch (importError) {
      console.error('❌ Failed to import database server:', importError);
      return NextResponse.json({
        success: false,
        error: 'Failed to import database server',
        details: (importError as Error).message
      }, { status: 500 });
    }
    
    // Test 3: Test connection
    let connected = false;
    let connectionError = null;
    try {
      connected = await databaseServer.connect();
      console.log('🔗 Connection result:', connected);
    } catch (connError) {
      connectionError = connError;
      console.error('❌ Connection failed:', connError);
    }
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError ? (connectionError as Error).message : 'Unknown connection error',
        dbUrlExists: !!dbUrl
      }, { status: 500 });
    }
    
    // Test 4: Test database access
    let dbAccessible = false;
    let collections = [];
    try {
      // Access the database instance
      const db = (databaseServer as any).db;
      if (db) {
        console.log('✅ Database instance accessible');
        dbAccessible = true;
        
        // List collections
        const collectionList = await db.listCollections().toArray();
        collections = collectionList.map((col: any) => col.name);
        console.log('📋 Collections found:', collections);
      } else {
        console.log('❌ Database instance not accessible');
      }
    } catch (dbError) {
      console.error('❌ Database access failed:', dbError);
    }
    
    // Test 5: Test user collection access
    let userCount = 0;
    let userCollectionError = null;
    try {
      if (dbAccessible) {
        const db = (databaseServer as any).db;
        const usersCollection = db.collection('users');
        userCount = await usersCollection.countDocuments();
        console.log('👥 User count:', userCount);
      }
    } catch (userError) {
      userCollectionError = userError;
      console.error('❌ User collection access failed:', userError);
    }
    
    // Test 6: Test getUserByIdentifier method
    let methodTestResult = null;
    try {
      const testResult = await databaseServer.getUserByIdentifier('demo@example.com');
      methodTestResult = testResult ? 'User found' : 'User not found';
      console.log('🔍 Method test result:', methodTestResult);
    } catch (methodError) {
      methodTestResult = 'Method failed: ' + (methodError as Error).message;
      console.error('❌ Method test failed:', methodError);
    }
    
    // Cleanup
    await databaseServer.disconnect();
    
    return NextResponse.json({
      success: true,
      data: {
        dbUrlExists: !!dbUrl,
        connected,
        dbAccessible,
        collections,
        userCount,
        methodTestResult,
        userCollectionError: userCollectionError ? (userCollectionError as Error).message : null
      },
      message: 'Database connection test completed'
    });
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection test failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}