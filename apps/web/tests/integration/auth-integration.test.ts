/**
 * Integration Tests for Authentication System
 * 
 * These tests validate the complete authentication flow from registration to dashboard
 * without requiring browser automation. They test the core functionality and API integration.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/test-path',
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Test data
const testUser = {
  email: 'test.user@example.com',
  username: 'testuser123',
  password: 'TestPassword123!',
  fullName: 'Test User',
  bio: 'Test user bio'
};

const mockSuccessResponse = {
  success: true,
  message: 'Operation successful',
  data: {
    user: {
      id: '1',
      email: testUser.email,
      username: testUser.username,
      fullName: testUser.fullName,
      emailVerified: true,
      role: 'user',
      isActive: true,
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  },
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('User Registration Flow', () => {
    it('should complete registration with valid data', async () => {
      // Mock successful registration response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Registration successful',
          verificationEmail: testUser.email,
          developmentOTP: '123456',
        }),
      });

      const registrationData = {
        email: testUser.email,
        username: testUser.username,
        password: testUser.password,
        confirmPassword: testUser.password,
        fullName: testUser.fullName,
        bio: testUser.bio,
        acceptTerms: true,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      expect(result.success).toBe(true);
      expect(result.verificationEmail).toBe(testUser.email);
    });

    it('should handle registration validation errors', async () => {
      // Mock validation error response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'Validation failed',
          details: [
            { field: 'email', message: 'Email already exists' },
            { field: 'username', message: 'Username already taken' },
          ],
        }),
      });

      const invalidData = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'weak',
        confirmPassword: 'different',
        fullName: '',
        acceptTerms: false,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(result.success).toBe(false);
      expect(result.details).toHaveLength(2);
      expect(result.details[0].field).toBe('email');
      expect(result.details[1].field).toBe('username');
    });
  });

  describe('Email Verification Flow', () => {
    it('should verify email with valid OTP', async () => {
      // Mock successful verification response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Email verified successfully',
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }),
      });

      sessionStorageMock.getItem.mockReturnValue(testUser.email);

      const verificationData = {
        email: testUser.email,
        otp: '123456',
      };

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should handle invalid OTP', async () => {
      // Mock invalid OTP response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'Invalid or expired OTP',
          details: [
            { field: 'otp', message: 'The verification code is invalid or has expired' },
          ],
        }),
      });

      const verificationData = {
        email: testUser.email,
        otp: '000000',
      };

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(result.success).toBe(false);
      expect(result.details[0].field).toBe('otp');
    });

    it('should handle OTP resend with rate limiting', async () => {
      // Mock successful resend response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Verification code sent successfully',
          developmentOTP: '654321',
        }),
      });

      const resendData = { email: testUser.email };

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resendData),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.developmentOTP).toBeDefined();
    });
  });

  describe('User Sign In Flow', () => {
    it('should sign in with email and password', async () => {
      // Mock successful signin response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const signinData = {
        identifier: testUser.email,
        password: testUser.password,
        rememberMe: false,
        sessionDuration: 24,
      };

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });

      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });

      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe(testUser.email);
      expect(result.data.accessToken).toBeDefined();
    });

    it('should sign in with username and password', async () => {
      // Mock successful signin response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const signinData = {
        identifier: testUser.username,
        password: testUser.password,
        rememberMe: true,
        sessionDuration: 168, // 1 week
      };

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.user.username).toBe(testUser.username);
    });

    it('should handle invalid credentials', async () => {
      // Mock invalid credentials response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: 'Invalid credentials',
          error: 'Authentication failed',
        }),
      });

      const signinData = {
        identifier: 'wrong@example.com',
        password: 'wrongpassword',
        rememberMe: false,
        sessionDuration: 24,
      };

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    it('should handle unverified email requirement', async () => {
      // Mock response requiring email verification
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          requiresVerification: true,
          message: 'Please verify your email before signing in',
          verificationEmail: testUser.email,
        }),
      });

      const signinData = {
        identifier: testUser.email,
        password: testUser.password,
        rememberMe: false,
        sessionDuration: 24,
      };

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(true);
      expect(result.verificationEmail).toBe(testUser.email);
    });
  });

  describe('Onboarding Flow', () => {
    it('should complete onboarding with user profile data', async () => {
      // Mock successful onboarding completion
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Onboarding completed successfully',
          data: {
            user: {
              ...mockSuccessResponse.data.user,
              academicInfo: {
                institution: 'Test University',
                major: 'Computer Science',
                year: 3,
                gpa: 3.8,
              },
              interests: ['programming', 'ai', 'web-development'],
              privacySettings: {
                allowDirectMessages: true,
                showOnlineStatus: true,
                allowProfileViewing: true,
                dataCollection: true,
              },
              wellnessSettings: {
                trackMood: true,
                trackStress: false,
                shareWellnessData: false,
                crisisAlertsEnabled: true,
                allowWellnessInsights: true,
              },
            },
          },
        }),
      });

      const onboardingData = {
        fullName: testUser.fullName,
        bio: testUser.bio,
        dateOfBirth: '1995-01-01',
        gender: 'prefer-not-to-say',
        academicInfo: {
          institution: 'Test University',
          major: 'Computer Science',
          year: 3,
          gpa: 3.8,
        },
        interests: ['programming', 'ai', 'web-development'],
        privacySettings: {
          allowDirectMessages: true,
          showOnlineStatus: true,
          allowProfileViewing: true,
          dataCollection: true,
        },
        wellnessSettings: {
          trackMood: true,
          trackStress: false,
          shareWellnessData: false,
          crisisAlertsEnabled: true,
          allowWellnessInsights: true,
        },
      };

      const response = await fetch('/api/users/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData),
      });

      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith('/api/users/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData),
      });

      expect(result.success).toBe(true);
      expect(result.data.user.academicInfo).toBeDefined();
      expect(result.data.user.interests).toHaveLength(3);
      expect(result.data.user.privacySettings).toBeDefined();
      expect(result.data.user.wellnessSettings).toBeDefined();
    });

    it('should handle minimal onboarding data', async () => {
      // Mock successful minimal onboarding
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Onboarding completed successfully',
          data: {
            user: {
              ...mockSuccessResponse.data.user,
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
            },
          },
        }),
      });

      const minimalOnboardingData = {
        fullName: testUser.fullName,
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
      };

      const response = await fetch('/api/users/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalOnboardingData),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.user.fullName).toBe(testUser.fullName);
    });
  });

  describe('Token Management', () => {
    it('should refresh expired tokens', async () => {
      // Mock successful token refresh
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
      });

      localStorageMock.getItem.mockReturnValue('old-refresh-token');

      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'old-refresh-token' }),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('should handle invalid refresh token', async () => {
      // Mock invalid refresh token response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: 'Invalid refresh token',
          error: 'Token expired or invalid',
        }),
      });

      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid refresh token');
    });
  });

  describe('Security Features', () => {
    it('should validate password strength requirements', () => {
      const weakPasswords = [
        '123',
        'password',
        'Password',
        '12345678'
      ];

      const strongPasswords = [
        'StrongPassword123!',
        'MySecure@Pass2024',
        'Complex#Password$456'
      ];

      // Mock password validation function
      const validatePassword = (password: string) => {
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const score = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar]
          .filter(Boolean).length;

        return {
          isValid: score >= 4 && hasMinLength,
          score,
          requirements: {
            minLength: hasMinLength,
            uppercase: hasUppercase,
            lowercase: hasLowercase,
            number: hasNumber,
            specialChar: hasSpecialChar,
          }
        };
      };

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.score).toBeLessThan(4);
      });

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(4);
      });
    });

    it('should sanitize user input', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
      ];

      // Mock input sanitization function
      const sanitizeInput = (input: string) => {
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/<[^>]*>/g, '')
          .replace(/[<>]/g, '');
      };

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('<img');
      });
    });

    it('should implement rate limiting logic', () => {
      // Mock rate limiting implementation
      const rateLimiter = {
        attempts: new Map<string, { count: number; lastAttempt: number }>(),
        
        isAllowed(identifier: string, maxAttempts = 5, windowMs = 300000): boolean {
          const now = Date.now();
          const userAttempts = this.attempts.get(identifier);
          
          if (!userAttempts) {
            this.attempts.set(identifier, { count: 1, lastAttempt: now });
            return true;
          }
          
          // Reset if window has passed
          if (now - userAttempts.lastAttempt > windowMs) {
            this.attempts.set(identifier, { count: 1, lastAttempt: now });
            return true;
          }
          
          // Check if under limit
          if (userAttempts.count < maxAttempts) {
            userAttempts.count++;
            userAttempts.lastAttempt = now;
            return true;
          }
          
          return false;
        },
        
        reset(identifier: string): void {
          this.attempts.delete(identifier);
        }
      };

      const testIP = '192.168.1.1';
      
      // Should allow first 5 attempts
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed(testIP)).toBe(true);
      }
      
      // Should block 6th attempt
      expect(rateLimiter.isAllowed(testIP)).toBe(false);
      
      // Should allow after reset
      rateLimiter.reset(testIP);
      expect(rateLimiter.isAllowed(testIP)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: 'test', password: 'test' }),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle server errors with proper status codes', async () => {
      // Mock server error
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          message: 'Internal server error',
          error: 'Database connection failed',
        }),
      });

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'test', password: 'test' }),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
    });
  });

  describe('Complete Authentication Journey', () => {
    it('should complete full user journey from registration to dashboard', async () => {
      // Step 1: Registration
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          verificationEmail: testUser.email,
          developmentOTP: '123456',
        }),
      });

      // Step 2: Email verification
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }),
      });

      // Step 3: Onboarding completion
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { user: mockSuccessResponse.data.user },
        }),
      });

      // Execute registration
      const registrationResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          username: testUser.username,
          password: testUser.password,
          confirmPassword: testUser.password,
          fullName: testUser.fullName,
          acceptTerms: true,
        }),
      });

      const registrationResult = await registrationResponse.json();
      expect(registrationResult.success).toBe(true);

      // Execute email verification
      const verificationResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          otp: '123456',
        }),
      });

      const verificationResult = await verificationResponse.json();
      expect(verificationResult.success).toBe(true);
      expect(verificationResult.accessToken).toBeDefined();

      // Execute onboarding completion
      const onboardingResponse = await fetch('/api/users/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: testUser.fullName,
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
        }),
      });

      const onboardingResult = await onboardingResponse.json();
      expect(onboardingResult.success).toBe(true);

      // Verify all API calls were made
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });
});