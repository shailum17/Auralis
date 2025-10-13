import bcrypt from 'bcryptjs';
import { databaseClient } from './database-client';

interface RegistrationData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
  };
  interests?: string[];
  acceptMarketing?: boolean;
}

interface RegistrationResult {
  success: boolean;
  data?: {
    user: any;
    message: string;
    savedToDatabase: boolean;
    method: 'backend' | 'direct' | 'memory';
  };
  error?: string;
}

class RegistrationService {
  private static instance: RegistrationService;

  static getInstance(): RegistrationService {
    if (!RegistrationService.instance) {
      RegistrationService.instance = new RegistrationService();
    }
    return RegistrationService.instance;
  }

  async registerUser(data: RegistrationData): Promise<RegistrationResult> {
    console.log('🚀 Starting user registration process...');

    // Validate required fields
    if (!data.email || !data.password || !data.username || !data.fullName) {
      return {
        success: false,
        error: 'Missing required fields: email, password, username, and fullName are required'
      };
    }

    // Try Method 1: Backend API
    const backendResult = await this.tryBackendRegistration(data);
    if (backendResult.success) {
      return backendResult;
    }

    // Try Method 2: Direct Database Connection
    const directResult = await this.tryDirectDatabaseRegistration(data);
    if (directResult.success) {
      return directResult;
    }

    // Fallback Method 3: Memory Storage
    return this.fallbackMemoryRegistration(data);
  }

  private async tryBackendRegistration(data: RegistrationData): Promise<RegistrationResult> {
    try {
      console.log('📡 Attempting backend API registration...');
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/auth/register-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backend registration successful');
        
        return {
          success: true,
          data: {
            user: result.data?.user || this.createUserObject(data),
            message: 'Account created successfully via backend API',
            savedToDatabase: true,
            method: 'backend'
          }
        };
      } else {
        const error = await response.json();
        console.log('❌ Backend registration failed:', error);
        throw new Error(error.message || 'Backend registration failed');
      }
    } catch (error) {
      console.log('⚠️ Backend API unavailable:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  }

  private async tryDirectDatabaseRegistration(data: RegistrationData): Promise<RegistrationResult> {
    try {
      console.log('🗄️ Attempting direct database registration...');
      
      // Connect to database
      const connected = await databaseClient.connect();
      if (!connected) {
        throw new Error('Failed to connect to database');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Prepare user data
      const userData = {
        email: data.email.toLowerCase(),
        username: data.username,
        passwordHash,
        fullName: data.fullName,
        bio: data.bio || null,
        interests: data.interests || [],
        emailVerified: false,
        role: 'USER',
        academicInfo: data.academicInfo || null,
        privacySettings: {
          allowDirectMessages: true,
          showOnlineStatus: true,
          allowProfileViewing: true,
          dataCollection: true,
        },
        wellnessSettings: {
          trackMood: false,
          trackStress: false,
          shareWellnessData: false,
          crisisAlertsEnabled: true,
          allowWellnessInsights: false,
        },
        preferences: {
          feedAlgorithm: 'personalized',
          privacyLevel: 'public',
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            messageNotifications: true,
            postReactions: true,
            commentReplies: true,
            studyGroupInvites: true,
            sessionReminders: true,
            wellnessAlerts: true,
            moderationActions: true,
            systemAnnouncements: true,
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
      };

      // Save to database
      const savedUser = await databaseClient.saveUser(userData);
      
      if (savedUser) {
        console.log('✅ Direct database registration successful');
        
        return {
          success: true,
          data: {
            user: this.formatUserForFrontend(savedUser),
            message: 'Account created successfully via direct database connection',
            savedToDatabase: true,
            method: 'direct'
          }
        };
      } else {
        throw new Error('Failed to save user to database');
      }
    } catch (error) {
      console.log('❌ Direct database registration failed:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    } finally {
      await databaseClient.disconnect();
    }
  }

  private fallbackMemoryRegistration(data: RegistrationData): RegistrationResult {
    console.log('💾 Using memory storage fallback...');
    
    const userObject = this.createUserObject(data);
    
    // Store in memory
    globalThis.pendingUsers = globalThis.pendingUsers || {};
    globalThis.pendingUsers[data.email.toLowerCase()] = userObject;
    
    console.log('✅ Memory registration successful (fallback)');
    
    return {
      success: true,
      data: {
        user: userObject,
        message: 'Account created successfully (stored in memory - database unavailable)',
        savedToDatabase: false,
        method: 'memory'
      }
    };
  }

  private createUserObject(data: RegistrationData) {
    return {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      email: data.email.toLowerCase(),
      username: data.username,
      fullName: data.fullName,
      bio: data.bio || null,
      interests: data.interests || [],
      emailVerified: false,
      role: 'user',
      academicInfo: data.academicInfo || null,
      privacySettings: {
        allowDirectMessages: true,
        showOnlineStatus: true,
        allowProfileViewing: true,
        dataCollection: true,
      },
      wellnessSettings: {
        trackMood: false,
        trackStress: false,
        shareWellnessData: false,
        crisisAlertsEnabled: true,
        allowWellnessInsights: false,
      },
      preferences: {
        feedAlgorithm: 'personalized',
        privacyLevel: 'public',
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          messageNotifications: true,
          postReactions: true,
          commentReplies: true,
          studyGroupInvites: true,
          sessionReminders: true,
          wellnessAlerts: true,
          moderationActions: true,
          systemAnnouncements: true,
        }
      },
      acceptMarketing: data.acceptMarketing || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
  }

  private formatUserForFrontend(dbUser: any) {
    return {
      id: dbUser._id?.toString() || dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      fullName: dbUser.fullName,
      bio: dbUser.bio,
      interests: dbUser.interests,
      emailVerified: dbUser.emailVerified,
      role: dbUser.role,
      academicInfo: dbUser.academicInfo,
      privacySettings: dbUser.privacySettings,
      wellnessSettings: dbUser.wellnessSettings,
      preferences: dbUser.preferences,
      createdAt: dbUser.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: dbUser.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async verifyUserEmail(email: string): Promise<boolean> {
    console.log('📧 Verifying user email...');

    // Try backend API first
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        console.log('✅ Email verified via backend API');
        return true;
      }
    } catch (error) {
      console.log('⚠️ Backend email verification failed');
    }

    // Try direct database
    try {
      const connected = await databaseClient.connect();
      if (connected) {
        const updated = await databaseClient.updateUserEmailVerification(email);
        await databaseClient.disconnect();
        
        if (updated) {
          console.log('✅ Email verified via direct database');
          return true;
        }
      }
    } catch (error) {
      console.log('⚠️ Direct database email verification failed');
    }

    // Fallback to memory
    const pendingUsers = globalThis.pendingUsers || {};
    const user = pendingUsers[email.toLowerCase()];
    if (user) {
      user.emailVerified = true;
      user.updatedAt = new Date().toISOString();
      console.log('✅ Email verified in memory (fallback)');
      return true;
    }

    return false;
  }
}

export const registrationService = RegistrationService.getInstance();