// Demo authentication for testing enhanced login functionality

export interface DemoUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  emailVerified: boolean;
}

export const demoUsers: Record<string, DemoUser> = {
  // Email-based users
  'john.doe@example.com': {
    id: '1',
    email: 'john.doe@example.com',
    username: 'john_doe',
    fullName: 'John Doe',
    role: 'student',
    emailVerified: true
  },
  'student123@example.com': {
    id: '2',
    email: 'student123@example.com',
    username: 'student123',
    fullName: 'Student User',
    role: 'student',
    emailVerified: true
  },
  'jane.smith@example.com': {
    id: '3',
    email: 'jane.smith@example.com',
    username: 'jane_smith',
    fullName: 'Jane Smith',
    role: 'student',
    emailVerified: true
  },
  'demo@example.com': {
    id: '4',
    email: 'demo@example.com',
    username: 'demo_user',
    fullName: 'Demo User',
    role: 'student',
    emailVerified: true
  }
};

// Username to email mapping
export const usernameToEmail: Record<string, string> = {
  'john_doe': 'john.doe@example.com',
  'student123': 'student123@example.com',
  'jane_smith': 'jane.smith@example.com',
  'demo_user': 'demo@example.com'
};

// Valid demo passwords
export const validPasswords = ['demo123', 'password123', 'test123'];

// Demo OTP codes (for testing)
export const validOtpCodes = ['123456', '000000', '111111'];

/**
 * Demo authentication functions
 */
export class DemoAuth {
  private static otpStore: Record<string, { otp: string; timestamp: number }> = {};

  /**
   * Resolve identifier (email or username) to user
   */
  static resolveUser(identifier: string): DemoUser | null {
    // Try direct email lookup
    if (demoUsers[identifier]) {
      return demoUsers[identifier];
    }

    // Try username lookup
    const email = usernameToEmail[identifier];
    if (email && demoUsers[email]) {
      return demoUsers[email];
    }

    return null;
  }

  /**
   * Verify password for demo user
   */
  static verifyPassword(identifier: string, password: string): boolean {
    const user = this.resolveUser(identifier);
    return user !== null && validPasswords.includes(password);
  }

  /**
   * Generate and store OTP for user
   */
  static generateOtp(identifier: string): string {
    const user = this.resolveUser(identifier);
    if (!user) return '';

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore[user.email] = {
      otp,
      timestamp: Date.now()
    };

    // For demo purposes, also accept common OTP codes
    return otp;
  }

  /**
   * Verify OTP for user
   */
  static verifyOtp(identifier: string, otp: string): boolean {
    const user = this.resolveUser(identifier);
    if (!user) return false;

    // Accept common demo OTP codes
    if (validOtpCodes.includes(otp)) {
      return true;
    }

    // Check stored OTP
    const storedOtp = this.otpStore[user.email];
    if (!storedOtp) return false;

    // Check if OTP is expired (10 minutes)
    const isExpired = Date.now() - storedOtp.timestamp > 10 * 60 * 1000;
    if (isExpired) {
      delete this.otpStore[user.email];
      return false;
    }

    return storedOtp.otp === otp;
  }

  /**
   * Generate demo tokens
   */
  static generateTokens(user: DemoUser) {
    const accessToken = `demo_access_${user.id}_${Date.now()}`;
    const refreshToken = `demo_refresh_${user.id}_${Date.now()}`;
    
    return { accessToken, refreshToken };
  }

  /**
   * Complete demo login
   */
  static login(identifier: string, password?: string, otp?: string) {
    const user = this.resolveUser(identifier);
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // If password is provided, verify it
    if (password && !this.verifyPassword(identifier, password)) {
      return {
        success: false,
        error: 'Invalid password'
      };
    }

    // If OTP is provided, verify it
    if (otp && !this.verifyOtp(identifier, otp)) {
      return {
        success: false,
        error: 'Invalid or expired OTP'
      };
    }

    const tokens = this.generateTokens(user);

    return {
      success: true,
      data: {
        user,
        ...tokens
      }
    };
  }
}

/**
 * Check if demo mode is enabled
 */
export const isDemoMode = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
};