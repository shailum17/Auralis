import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ServerApiVersion } from 'mongodb';

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  
  try {
    console.log('🧪 Simple MongoDB connection test...');
    
    const uri = process.env.DATABASE_URL;
    console.log('📊 DATABASE_URL exists:', !!uri);
    console.log('📊 DATABASE_URL preview:', uri?.substring(0, 50) + '...');
    
    if (!uri) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create a new client
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    console.log('🔌 Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Test database access
    const dbName = uri.split('/').pop()?.split('?')[0] || 'auralis';
    console.log('📊 Using database:', dbName);
    
    const db = client.db(dbName);
    
    // Ping the database
    console.log('🏓 Pinging database...');
    await db.admin().ping();
    console.log('✅ Ping successful');

    // List collections
    console.log('📋 Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections found:', collections.length);

    return NextResponse.json({
      success: true,
      message: 'Simple MongoDB connection test successful',
      details: {
        connected: true,
        databaseName: dbName,
        collectionsCount: collections.length,
        collections: collections.map(c => c.name),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Simple connection test failed:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code || 'Unknown',
      codeName: (error as any)?.codeName || 'Unknown'
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'CONNECTION_FAILED',
        message: error instanceof Error ? error.message : 'Connection test failed',
        details: {
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorCode: (error as any)?.code || 'Unknown',
          errorCodeName: (error as any)?.codeName || 'Unknown',
          hasDbUrl: !!process.env.DATABASE_URL,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      console.log('🔌 Closing connection...');
      await client.close();
    }
  }
}