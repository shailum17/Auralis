/**
 * Registration Service Module
 * 
 * This module handles user registration flow and related operations.
 */

import { emailService } from './email-service';

interface RegistrationData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  bio?: string;
  acceptTerms: boolean;
}

interface RegistrationResult {
  success: boolean;
  userId?: string;
  verificationEmail?: string;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

interface OTPVerificationData {
  email: string;
  otp: string;
}

interface OTPVerificationResult {
  success: boolean;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

class RegistrationService {
  private otpStore = new Map<string, { otp: string; expiresAt: Date; attempts: number }>();
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_OTP_ATTEMPTS = 5;

  async registerUser(data: RegistrationData): Promise<RegistrationResult> {
    try {
      console.log('📝 Starting user registration for:', data.email);

      // Validate registration data
      const validation = await this.validateRegistrationData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors.map(error => ({ field: error.field, message: error.message })),
        };
      }

      // Check if user already exists
      const existingUser = await this.checkUserExists(data.email, data.username);
      if (existingUser.exists) {
        return {
          success: false,
          error: 'User already exists',
          details: existingUser.conflicts.map(conflict => ({ 
            field: conflict.field, 
            message: conflict.message 
          })),
        };
      }

      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP for verification
      this.otpStore.set(data.email, {
        otp,
        expiresAt,
        attempts: 0,
      });

      // Send verification email
      const emailResult = await emailService.sendOTPEmail({
        to: data.email,
        otp,
        fullName: data.fullName,
      });

      if (!emailResult.success) {
        console.error('❌ Failed to send verification email:', emailResult.error);
        // Don't fail registration if email fails, but log it
      }

      console.log('✅ User registration initiated successfully');

      return {
        success: true,
        userId: `temp_${Date.now()}`, // Temporary ID until verification
        verificationEmail: data.email,
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return {
        success: false,
        error: 'Registration failed',
        details: [{ field: 'general', message: (error as Error).message }],
      };
    }
  }

  async verifyOTP(data: OTPVerificationData): Promise<OTPVerificationResult> {
    try {
      console.log('🔍 Verifying OTP for:', data.email);

      const storedOTP = this.otpStore.get(data.email);
      if (!storedOTP) {
        return {
          success: false,
          error: 'OTP not found or expired',
          details: [{ field: 'otp', message: 'Verification code not found or has expired' }],
        };
      }

      // Check if OTP has expired
      if (new Date() > storedOTP.expiresAt) {
        this.otpStore.delete(data.email);
        return {
          success: false,
          error: 'OTP expired',
          details: [{ field: 'otp', message: 'Verification code has expired' }],
        };
      }

      // Check attempt limit
      if (storedOTP.attempts >= this.MAX_OTP_ATTEMPTS) {
        this.otpStore.delete(data.email);
        return {
          success: false,
          error: 'Too many attempts',
          details: [{ field: 'otp', message: 'Too many verification attempts. Please request a new code.' }],
        };
      }

      // Verify OTP
      if (storedOTP.otp !== data.otp) {
        storedOTP.attempts++;
        return {
          success: false,
          error: 'Invalid OTP',
          details: [{ field: 'otp', message: 'Invalid verification code' }],
        };
      }

      // OTP verified successfully
      this.otpStore.delete(data.email);

      // Generate tokens (in a real implementation, this would use JWT)
      const accessToken = this.generateAccessToken(data.email);
      const refreshToken = this.generateRefreshToken(data.email);

      console.log('✅ OTP verified successfully');

      return {
        success: true,
        userId: `user_${Date.now()}`,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      return {
        success: false,
        error: 'OTP verification failed',
        details: [{ field: 'general', message: (error as Error).message }],
      };
    }
  }

  async resendOTP(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Resending OTP for:', email);

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Update stored OTP
      this.otpStore.set(email, {
        otp,
        expiresAt,
        attempts: 0,
      });

      // Send verification email
      const emailResult = await emailService.sendOTPEmail({
        to: email,
        otp,
      });

      if (!emailResult.success) {
        console.error('❌ Failed to resend verification email:', emailResult.error);
        return {
          success: false,
          error: 'Failed to send verification email',
        };
      }

      console.log('✅ OTP resent successfully');

      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Failed to resend OTP:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async validateRegistrationData(data: RegistrationData): Promise<{ 
    isValid: boolean; 
    errors: Array<{ field: string; message: string }> 
  }> {
    const errors: Array<{ field: string; message: string }> = [];

    // Email validation
    if (!data.email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    } else if (data.email.length > 254) {
      errors.push({ field: 'email', message: 'Email address is too long' });
    }

    // Username validation
    if (!data.username) {
      errors.push({ field: 'username', message: 'Username is required' });
    } else if (data.username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    } else if (data.username.length > 30) {
      errors.push({ field: 'username', message: 'Username must be less than 30 characters' });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.push({ field: 'username', message: 'Username can only contain letters, numbers, underscores, and hyphens' });
    }

    // Password validation
    if (!data.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else {
      const passwordRequirements = {
        minLength: data.password.length >= 8,
        hasUppercase: /[A-Z]/.test(data.password),
        hasLowercase: /[a-z]/.test(data.password),
        hasNumber: /\d/.test(data.password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(data.password),
      };

      const missingRequirements = Object.entries(passwordRequirements)
        .filter(([_, met]) => !met)
        .map(([req]) => req);

      if (missingRequirements.length > 0) {
        errors.push({ 
          field: 'password', 
          message: `Password must meet all requirements: ${missingRequirements.join(', ')}` 
        });
      }
    }

    // Full name validation
    if (!data.fullName || data.fullName.trim().length === 0) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    } else if (data.fullName.length > 100) {
      errors.push({ field: 'fullName', message: 'Full name must be less than 100 characters' });
    }

    // Bio validation (optional)
    if (data.bio && data.bio.length > 500) {
      errors.push({ field: 'bio', message: 'Bio must be less than 500 characters' });
    }

    // Terms acceptance validation
    if (!data.acceptTerms) {
      errors.push({ field: 'acceptTerms', message: 'You must accept the terms and conditions' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async checkUserExists(email: string, username: string): Promise<{ 
    exists: boolean; 
    conflicts: Array<{ field: string; message: string }> 
  }> {
    const conflicts: Array<{ field: string; message: string }> = [];

    // In a real implementation, this would check the database
    // For now, simulate some conflicts for testing
    const existingEmails = ['existing@example.com', 'test@example.com'];
    const existingUsernames = ['existinguser', 'testuser'];

    if (existingEmails.includes(email.toLowerCase())) {
      conflicts.push({ field: 'email', message: 'Email address is already registered' });
    }

    if (existingUsernames.includes(username.toLowerCase())) {
      conflicts.push({ field: 'username', message: 'Username is already taken' });
    }

    return {
      exists: conflicts.length > 0,
      conflicts,
    };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateAccessToken(email: string): string {
    // In a real implementation, this would use JWT
    const payload = {
      email,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    };
    
    return `access_${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
  }

  private generateRefreshToken(email: string): string {
    // In a real implementation, this would use JWT
    const payload = {
      email,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    };
    
    return `refresh_${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; otpStoreSize: number }> {
    return {
      status: 'operational',
      otpStoreSize: this.otpStore.size,
    };
  }

  // Cleanup expired OTPs (should be called periodically)
  cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [email, otpData] of Array.from(this.otpStore.entries())) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }
}

// Export singleton instance
export const registrationService = new RegistrationService();

// Export types
export type { RegistrationData, RegistrationResult, OTPVerificationData, OTPVerificationResult };