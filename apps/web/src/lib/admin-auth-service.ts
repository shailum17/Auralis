/**
 * Admin Authentication Service using existing Users Collection
 */

import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from './mongodb';
import { User, UserRole } from '@/types/auth';

export interface AdminLoginResult {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

/**
 * Helper function to create safe user object without sensitive data
 */
function createSafeUser(user: any): User {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    bio: user.bio,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    location: user.location,
    pronouns: user.pronouns,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    academicInfo: user.academicInfo,
    interests: user.interests || [],
    privacySettings: user.privacySettings,
    wellnessSettings: user.wellnessSettings,
    preferences: user.preferences,
    role: user.role,
    isActive: user.isActive,
    lastActive: user.lastActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export class AdminAuthService {
  /**
   * Create a new admin user in the existing users collection
   */
  static async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: 'ADMIN' | 'MODERATOR';
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    console.log('👤 Creating admin user:', userData.username);
    
    try {
      console.log('📊 Getting users collection...');
      const collection = await getUsersCollection();
      console.log('✅ Users collection obtained');

      // Check if user already exists
      console.log('🔍 Checking for existing user...');
      const existingUser = await collection.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });
      console.log('🔍 Existing user check result:', !!existingUser);
      
      if (existingUser) {
        return {
          success: false,
          error: 'User with this username or email already exists'
        };
      }
      
      // Hash password
      console.log('🔐 Hashing password...');
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      console.log('✅ Password hashed successfully');
      
      // Create admin user with full User interface
      const adminUser = {
        id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: userData.username,
        email: userData.email,
        passwordHash, // Extra field for authentication
        fullName: userData.fullName,
        emailVerified: true, // Admin accounts are pre-verified
        phoneVerified: false,
        interests: [],
        privacySettings: {
          allowDirectMessages: false,
          showOnlineStatus: false,
          allowProfileViewing: false,
          dataCollection: false,
        },
        wellnessSettings: {
          trackMood: false,
          trackStress: false,
          shareWellnessData: false,
          crisisAlertsEnabled: false,
          allowWellnessInsights: false,
        },
        role: userData.role as UserRole,
        isActive: true,
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        // Extra fields for admin security
        loginAttempts: 0,
      };
      
      console.log('💾 Inserting admin user into users collection...');
      const result = await collection.insertOne(adminUser);
      console.log('💾 Insert result:', { insertedId: !!result.insertedId });
      
      if (result.insertedId) {
        console.log('✅ Admin user inserted, fetching created user...');
        const createdUser = await collection.findOne({ _id: result.insertedId });
        console.log('✅ Created user fetched successfully');
        
        return {
          success: true,
          user: createSafeUser(createdUser)
        };
      }
      
      return {
        success: false,
        error: 'Failed to create admin user'
      };
      
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.substring(0, 500) : 'No stack trace'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error occurred'
      };
    }
  }
  
  /**
   * Authenticate admin user from users collection
   */
  static async authenticateAdmin(username: string, password: string): Promise<AdminLoginResult> {
    try {
      console.log('🔐 Authenticating admin:', username);
      const collection = await getUsersCollection();
      
      // Find user by username or email
      const user = await collection.findOne({
        $or: [
          { username: username },
          { email: username }
        ]
      });
      
      if (!user) {
        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        };
      }
      
      // Check if user has admin/moderator role
      if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
        return {
          success: false,
          error: 'ACCESS_DENIED',
          message: 'User does not have admin privileges'
        };
      }
      
      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return {
          success: false,
          error: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked due to too many failed attempts'
        };
      }
      
      // Check if account is active
      if (!user.isActive) {
        return {
          success: false,
          error: 'ACCOUNT_DISABLED',
          message: 'User account is disabled'
        };
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        // Increment login attempts
        await this.incrementLoginAttempts(user._id);
        
        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        };
      }
      
      // Reset login attempts and update last login
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            lastActive: new Date(),
            updatedAt: new Date()
          },
          $unset: {
            loginAttempts: 1,
            lockedUntil: 1
          }
        }
      );
      
      return {
        success: true,
        user: createSafeUser(user),
        message: 'Authentication successful'
      };
      
    } catch (error) {
      console.error('Error authenticating admin:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Database error occurred'
      };
    }
  }
  
  /**
   * Increment login attempts and lock account if necessary
   */
  private static async incrementLoginAttempts(userId: ObjectId): Promise<void> {
    try {
      const collection = await getUsersCollection();
      const maxAttempts = 5;
      const lockTime = 30 * 60 * 1000; // 30 minutes
      
      const user = await collection.findOne({ _id: userId });
      if (!user) return;
      
      const attempts = (user.loginAttempts || 0) + 1;
      const updateData: any = {
        loginAttempts: attempts,
        updatedAt: new Date()
      };
      
      // Lock account if max attempts reached
      if (attempts >= maxAttempts) {
        updateData.lockedUntil = new Date(Date.now() + lockTime);
      }
      
      await collection.updateOne(
        { _id: userId },
        { $set: updateData }
      );
      
    } catch (error) {
      console.error('Error incrementing login attempts:', error);
    }
  }
  
  /**
   * Check if any admin users exist
   */
  static async hasAdminUsers(): Promise<boolean> {
    try {
      const collection = await getUsersCollection();
      const count = await collection.countDocuments({
        role: { $in: ['ADMIN', 'MODERATOR'] }
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking admin users:', error);
      return false;
    }
  }
  
  /**
   * Get admin user by ID
   */
  static async getAdminById(adminId: string): Promise<User | null> {
    try {
      const collection = await getUsersCollection();
      const user = await collection.findOne({ 
        id: adminId,
        role: { $in: ['ADMIN', 'MODERATOR'] }
      });
      
      if (user) {
        return createSafeUser(user);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting admin by ID:', error);
      return null;
    }
  }
  
  /**
   * List all admin users
   */
  static async listAdmins(): Promise<User[]> {
    try {
      const collection = await getUsersCollection();
      const admins = await collection.find({
        role: { $in: ['ADMIN', 'MODERATOR'] }
      }).toArray();
      
      // Create safe user objects without sensitive data
      return admins.map(admin => createSafeUser(admin));
    } catch (error) {
      console.error('Error listing admins:', error);
      return [];
    }
  }
  
  /**
   * Promote regular user to admin
   */
  static async promoteUserToAdmin(userId: string, role: 'ADMIN' | 'MODERATOR' = 'MODERATOR'): Promise<boolean> {
    try {
      const collection = await getUsersCollection();
      
      const result = await collection.updateOne(
        { id: userId },
        { 
          $set: { 
            role: role as UserRole, 
            updatedAt: new Date() 
          } 
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      return false;
    }
  }
}