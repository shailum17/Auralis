// Direct database client for frontend when backend is unavailable
import { MongoClient, Db, Collection } from 'mongodb';

interface UserDocument {
  _id?: string;
  email: string;
  username: string;
  passwordHash: string;
  fullName?: string;
  bio?: string | null;
  interests?: string[];
  emailVerified: boolean;
  role: string;
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
  } | null;
  privacySettings?: any;
  wellnessSettings?: any;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

class DatabaseClient {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  async connect(): Promise<boolean> {
    try {
      // Use the same MongoDB connection string as the backend
      const connectionString = process.env.DATABASE_URL || 
        'mongodb+srv://Auralis:xhJMlSjhYZxr6JG0@cluster0.t1pmkbm.mongodb.net/auralis?retryWrites=true&w=majority&appName=Cluster0&ssl=true&authSource=admin';
      
      this.client = new MongoClient(connectionString);
      await this.client.connect();
      this.db = this.client.db('auralis');
      this.isConnected = true;
      
      console.log('✅ Direct database connection established');
      return true;
    } catch (error) {
      console.error('❌ Direct database connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
    }
  }

  async saveUser(userData: Omit<UserDocument, '_id'>): Promise<UserDocument | null> {
    if (!this.isConnected || !this.db) {
      console.error('❌ Database not connected');
      return null;
    }

    try {
      const usersCollection: Collection<UserDocument> = this.db.collection('users');
      
      // Check if user already exists
      const existingUser = await usersCollection.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Insert new user
      const result = await usersCollection.insertOne(userData);
      
      if (result.insertedId) {
        const newUser = await usersCollection.findOne({ _id: result.insertedId });
        console.log('✅ User saved to database:', {
          id: newUser?._id,
          email: newUser?.email,
          username: newUser?.username
        });
        return newUser;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to save user to database:', error);
      throw error;
    }
  }

  async updateUserEmailVerification(email: string): Promise<boolean> {
    if (!this.isConnected || !this.db) {
      return false;
    }

    try {
      const usersCollection: Collection<UserDocument> = this.db.collection('users');
      const result = await usersCollection.updateOne(
        { email: email.toLowerCase() },
        { 
          $set: { 
            emailVerified: true,
            updatedAt: new Date()
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('❌ Failed to update email verification:', error);
      return false;
    }
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    if (!this.isConnected || !this.db) {
      return null;
    }

    try {
      const usersCollection: Collection<UserDocument> = this.db.collection('users');
      return await usersCollection.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error('❌ Failed to get user by email:', error);
      return null;
    }
  }

  isConnectionActive(): boolean {
    return this.isConnected;
  }
}

export const databaseClient = new DatabaseClient();