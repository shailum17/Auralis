import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Basic MongoDB test starting...');
    
    // Test 1: Check environment variable
    const uri = process.env.DATABASE_URL;
    console.log('📊 DATABASE_URL exists:', !!uri);
    console.log('📊 DATABASE_URL preview:', uri?.substring(0, 50) + '...');
    
    if (!uri) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not set',
        message: 'DATABASE_URL environment variable is missing'
      }, { status: 500 });
    }

    // Test 2: Try to import MongoDB
    console.log('📦 Importing MongoDB...');
    const { MongoClient, ServerApiVersion } = await import('mongodb');
    console.log('✅ MongoDB import successful');

    // Test 3: Create client (don't connect yet)
    console.log('🔧 Creating MongoDB client...');
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    console.log('✅ MongoDB client created');

    // Test 4: Try to connect
    console.log('🔌 Attempting connection...');
    await client.connect();
    console.log('✅ Connection successful');

    // Test 5: Get database
    const dbName = uri.split('/').pop()?.split('?')[0] || 'auralis';
    console.log('📊 Database name:', dbName);
    const db = client.db(dbName);
    console.log('✅ Database object created');

    // Test 6: Ping database
    console.log('🏓 Pinging database...');
    await db.admin().ping();
    console.log('✅ Ping successful');

    // Test 7: List collections
    console.log('📋 Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log('✅ Collections listed:', collections.length);

    // Test 8: Check users collection
    console.log('👥 Checking users collection...');
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log('✅ Users collection accessible, count:', userCount);

    // Clean up
    await client.close();
    console.log('🔌 Connection closed');

    return NextResponse.json({
      success: true,
      message: 'All MongoDB tests passed',
      details: {
        hasUri: true,
        mongoImported: true,
        clientCreated: true,
        connected: true,
        databaseName: dbName,
        pinged: true,
        collectionsCount: collections.length,
        usersCount: userCount,
        collections: collections.map(c => c.name)
      }
    });

  } catch (error) {
    console.error('❌ Basic MongoDB test failed:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code || 'Unknown',
      codeName: (error as any)?.codeName || 'Unknown',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : 'No stack'
    });
    
    return NextResponse.json({
      success: false,
      error: 'MONGODB_TEST_FAILED',
      message: error instanceof Error ? error.message : 'MongoDB test failed',
      details: {
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorCode: (error as any)?.code || 'Unknown',
        errorCodeName: (error as any)?.codeName || 'Unknown',
        hasUri: !!process.env.DATABASE_URL
      }
    }, { status: 500 });
  }
}