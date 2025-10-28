import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Minimal MongoDB test...');
    
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      return NextResponse.json({
        success: false,
        error: 'No DATABASE_URL'
      }, { status: 500 });
    }

    console.log('📊 URI exists, importing MongoDB...');
    
    // Try dynamic import
    const mongodb = await import('mongodb');
    console.log('✅ MongoDB imported');
    
    const { MongoClient } = mongodb;
    console.log('✅ MongoClient extracted');
    
    const client = new MongoClient(uri);
    console.log('✅ Client created');
    
    await client.connect();
    console.log('✅ Connected');
    
    const db = client.db('auralis');
    console.log('✅ Database selected');
    
    await db.admin().ping();
    console.log('✅ Pinged');
    
    await client.close();
    console.log('✅ Closed');

    return NextResponse.json({
      success: true,
      message: 'Minimal MongoDB test passed'
    });

  } catch (error) {
    console.error('❌ Minimal test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      code: (error as any)?.code || 'Unknown'
    }, { status: 500 });
  }
}