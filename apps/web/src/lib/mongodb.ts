/**
 * MongoDB connection utility for admin authentication
 */

import { MongoClient, Db, Collection, ServerApiVersion } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Get MongoDB connection
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    console.log('♻️ Reusing existing MongoDB connection');
    return { client, db };
  }

  const uri = process.env.DATABASE_URL;
  console.log('🔗 DATABASE_URL exists:', !!uri);

  if (!uri) {
    const error = new Error('DATABASE_URL environment variable is not set');
    console.error('❌', error.message);
    throw error;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');

    // Create client with proper options for MongoDB Atlas
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    await client.connect();

    // Extract database name from URI or use default
    const dbName = uri.split('/').pop()?.split('?')[0] || 'auralis';
    console.log('📊 Using database:', dbName);
    db = client.db(dbName);

    // Test the connection
    await db.admin().ping();
    console.log('✅ Connected to MongoDB for admin authentication');

    return { client, db };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.error('Connection details:', {
      hasUri: !!uri,
      uriStart: uri ? uri.substring(0, 20) + '...' : 'N/A',
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    // Reset connection variables
    client = null;
    db = null;

    throw error;
  }
}

/**
 * Get regular users collection
 */
export async function getUsersCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection('users');
}

/**
 * Close database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Disconnected from MongoDB');
  }
}