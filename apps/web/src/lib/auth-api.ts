// Enhanced authentication API utilities for username/email support

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface OTPRequest {
  email?: string;
  username?: string;
  type: 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET' | 'PASSWORD_LOGIN' | 'REGISTRATION';
}

export interface OTPVerification {
  email?: string;
  username?: string;
  otp: string;
  type: 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET' | 'PASSWORD_LOGIN' | 'REGISTRATION';
  rememberMe?: boolean;
  sessionDuration?: number;
}

export interface OTPStatus {
  exists: boolean;
  status?: string;
  attemptsRemaining?: number;
  expiresAt?: string;
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  email?: string; // Returned email even when username is used
  message?: string; // Optional success message
}

export interface UserData {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: UserData;
  accessToken: string;
  refreshToken: string;
}

/**
 * Enhanced authentication API client with username/email support
 * Falls back to existing API endpoints with username resolution
 */
export class AuthAPI {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Resolve username to email if needed (mock implementation for demo)
   */
  private async resolveIdentifierToEmail(identifier: string): Promise<string> {
    // In a real implementation, this would query the backend to resolve username to email
    // For demo purposes, we'll use mock data
    const usernameToEmailMap: Record<string, string> = {
      'john_doe': 'john.doe@example.com',
      'student123': 'student123@example.com',
      'jane_smith': 'jane.smith@example.com',
      'demo_user': 'demo@example.com'
    };

    return usernameToEmailMap[identifier] || identifier;
  }

  /**
   * Verify password and request OTP (supports both email and username)
   */
  async verifyPasswordAndRequestOtp(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/enhanced/verify-password-request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        email: data.email,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * Request OTP for login (supports both email and username)
   */
  async requestLoginOtp(request: OTPRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/enhanced/otp/request-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        ...data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * Verify OTP for password-based login
   */
  async verifyPasswordOtp(verification: OTPVerification): Promise<AuthResponse<LoginResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/enhanced/verify-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verification)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * Verify OTP for OTP-only login
   */
  async verifyLoginOtp(verification: OTPVerification): Promise<AuthResponse<LoginResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/enhanced/otp/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verification)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // New OTP System Methods

  /**
   * Request OTP using new system
   */
  async requestOtpNew(request: OTPRequest): Promise<AuthResponse<{ otpId: string; email: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data,
        email: data.email
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * Verify OTP using new system
   */
  async verifyOtpNew(verification: OTPVerification): Promise<AuthResponse<LoginResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verification)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * Get OTP status
   */
  async getOtpStatus(email: string, type: string): Promise<AuthResponse<OTPStatus>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/otp/status?email=${encodeURIComponent(email)}&type=${encodeURIComponent(type)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * Check if identifier is available (for registration)
   */
  async checkAvailability(identifier: string, type: 'email' | 'username'): Promise<AuthResponse<{ available: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: identifier })
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * Get user profile by identifier (email or username)
   */
  async getUserProfile(identifier: string): Promise<AuthResponse<UserData>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${encodeURIComponent(identifier)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }
}

// Default instance
export const authAPI = new AuthAPI();

// Utility functions
export const isEmail = (identifier: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
};

export const isUsername = (identifier: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(identifier) && identifier.length >= 3;
};

export const detectIdentifierType = (identifier: string): 'email' | 'username' | 'invalid' => {
  if (isEmail(identifier)) return 'email';
  if (isUsername(identifier)) return 'username';
  return 'invalid';
};