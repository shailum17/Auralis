/**
 * Fallback MongoDB connection utility
 */

export async function testMongoConnection() {
  try {
    // Dynamic import to avoid build issues
    const { MongoClient } = await import('mongodb');
    
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('DATABASE_URL not set');
    }

    console.log('🔌 Testing MongoDB connection with fallback method...');
    
    const client = new MongoClient(uri);
    
    // Connect with timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]);
    
    console.log('✅ Fallback connection successful');
    
    // Test database operations
    const db = client.db('auralis');
    await db.admin().ping();
    
    console.log('✅ Database ping successful');
    
    await client.close();
    
    return { success: true, message: 'Fallback connection test passed' };
    
  } catch (error) {
    console.error('❌ Fallback connection failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}