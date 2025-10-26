/**
 * Database Server Module
 * 
 * This module provides database connectivity and operations for the authentication system.
 * It uses MongoDB as the primary database.
 */

import { MongoClient, Db, Collection } from 'mongodb';

interface User {
  _id?: string;
  email: string;
  username: string;
  fullName: string;
  password: string;
  emailVerified: boolean;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
  dateOfBirth?: Date;
  gender?: string;
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
    gpa?: number;
  };
  interests?: string[];
  privacySettings?: {
    allowDirectMessages: boolean;
    showOnlineStatus: boolean;
    allowProfileViewing: boolean;
    dataCollection: boolean;
  };
  wellnessSettings?: {
    trackMood: boolean;
    trackStress: boolean;
    shareWellnessData: boolean;
    crisisAlertsEnabled: boolean;
    allowWellnessInsights: boolean;
  };
}

class DatabaseServer {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  constructor() {
    // Initialize with environment variables
  }

  async connect(): Promise<boolean> {
    try {
      const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
      
      if (!dbUrl) {
        console.error('❌ No database URL provided');
        return false;
      }

      this.client = new MongoClient(dbUrl);
      await this.client.connect();
      
      // Extract database name from URL or use default
      const dbName = process.env.DATABASE_NAME || 'student_community';
      this.db = this.client.db(dbName);
      
      this.isConnected = true;
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        this.isConnected = false;
        console.log('✅ Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  private getUsersCollection(): Collection<User> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection<User>('users');
  }

  async getUserByIdentifier(identifier: string): Promise<User | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      
      // Search by email or username
      const user = await collection.findOne({
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      });

      return user;
    } catch (error) {
      console.error('❌ Error getting user by identifier:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      const user = await collection.findOne({ email });

      return user;
    } catch (error) {
      console.error('❌ Error getting user by email:', error);
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      const user = await collection.findOne({ _id: id as any });

      return user;
    } catch (error) {
      console.error('❌ Error getting user by ID:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      
      const newUser: User = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newUser);
      
      if (result.insertedId) {
        return { ...newUser, _id: result.insertedId.toString() };
      }

      return null;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { _id: id as any },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      return result;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      const result = await collection.deleteOne({ _id: id as any });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return false;
    }
  }

  async listUsers(limit = 10, skip = 0): Promise<User[]> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      const users = await collection
        .find({})
        .limit(limit)
        .skip(skip)
        .toArray();

      return users;
    } catch (error) {
      console.error('❌ Error listing users:', error);
      return [];
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      const users = await collection.find({}).toArray();

      return users;
    } catch (error) {
      console.error('❌ Error getting all users:', error);
      return [];
    }
  }

  async updateUserEmailVerification(email: string): Promise<User | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      
      const result = await collection.findOneAndUpdate(
        { email },
        { 
          $set: { 
            emailVerified: true,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      return result;
    } catch (error) {
      console.error('❌ Error updating user email verification:', error);
      return null;
    }
  }

  async getUserCount(): Promise<number> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const collection = this.getUsersCollection();
      return await collection.countDocuments();
    } catch (error) {
      console.error('❌ Error getting user count:', error);
      return 0;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ connected: boolean; dbName?: string; collections?: string[] }> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.db) {
        return { connected: false };
      }

      const collections = await this.db.listCollections().toArray();
      
      return {
        connected: true,
        dbName: this.db.databaseName,
        collections: collections.map(col => col.name),
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { connected: false };
    }
  }

  // Getter for database instance (for advanced operations)
  get database(): Db | null {
    return this.db;
  }

  // Getter for connection status
  get connected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const databaseServer = new DatabaseServer();

// Export types
export type { User };