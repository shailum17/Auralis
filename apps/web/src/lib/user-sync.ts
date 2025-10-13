import { User } from '@/contexts/AuthContext';

interface RegistrationData {
  email: string;
  username: string;
  fullName: string;
  bio?: string;
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
  };
  interests?: string[];
  dateOfBirth?: string;
  gender?: string;
}

export class UserDataSync {
  private static instance: UserDataSync;
  
  static getInstance(): UserDataSync {
    if (!UserDataSync.instance) {
      UserDataSync.instance = new UserDataSync();
    }
    return UserDataSync.instance;
  }

  async syncUserToBackend(userData: RegistrationData): Promise<boolean> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/auth/register-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ User data synced to backend:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Backend sync failed:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend sync error:', error);
      return false;
    }
  }

  async verifyUserInBackend(email: string, otp: string): Promise<User | null> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          type: 'email_verification'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.user) {
          console.log('✅ User verified in backend:', result.data.user);
          return result.data.user;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Backend verification error:', error);
      return null;
    }
  }

  async checkBackendHealth(): Promise<boolean> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET'
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Store user data temporarily for OTP verification
  storeUserForVerification(email: string, userData: any): void {
    if (typeof globalThis !== 'undefined') {
      globalThis.pendingUsers = globalThis.pendingUsers || {};
      globalThis.pendingUsers[email.toLowerCase()] = {
        ...userData,
        storedAt: new Date().toISOString()
      };
      console.log('📝 User data stored for verification:', email);
    }
  }

  // Retrieve stored user data
  getStoredUser(email: string): any | null {
    if (typeof globalThis !== 'undefined') {
      const pendingUsers = globalThis.pendingUsers || {};
      const userData = pendingUsers[email.toLowerCase()];
      
      if (userData) {
        console.log('📖 Retrieved stored user data:', email);
        return userData;
      }
    }
    
    return null;
  }

  // Clear stored user data after successful verification
  clearStoredUser(email: string): void {
    if (typeof globalThis !== 'undefined') {
      const pendingUsers = globalThis.pendingUsers || {};
      delete pendingUsers[email.toLowerCase()];
      console.log('🗑️ Cleared stored user data:', email);
    }
  }

  // Get registration statistics
  getRegistrationStats(): {
    pendingUsers: number;
    activeOtps: number;
    backendConnected: boolean;
  } {
    const pendingUsers = typeof globalThis !== 'undefined' 
      ? Object.keys(globalThis.pendingUsers || {}).length 
      : 0;
    
    const activeOtps = typeof globalThis !== 'undefined' 
      ? Object.keys(globalThis.otpStore || {}).length 
      : 0;

    return {
      pendingUsers,
      activeOtps,
      backendConnected: false // Will be updated by health check
    };
  }
}

export const userDataSync = UserDataSync.getInstance();