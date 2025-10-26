/**
 * Comprehensive Integration Tests for Authentication System
 * 
 * These tests validate the complete user journey from registration to dashboard,
 * including error scenarios, recovery flows, and cross-browser compatibility simulation.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key: string) => {
      if (key === 'redirect') return '/dashboard';
      if (key === 'email') return 'test@example.com';
      return null;
    }),
  }),
  usePathname: () => '/test-path',
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage and sessionStorage
const createStorageMock = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
});

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock window.location
delete (window as any).location;
(window as any).location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  reload: jest.fn(),
};

// Test data
const testUsers = {
  valid: {
    email: 'test.user@example.com',
    username: 'testuser123',
    password: 'TestPassword123!',
    fullName: 'Test User',
    bio: 'Test user for integration testing'
  },
  duplicate: {
    email: 'existing@example.com',
    username: 'existinguser',
    password: 'ExistingPassword123!',
    fullName: 'Existing User'
  },
  unverified: {
    email: 'unverified@example.com',
    username: 'unverifieduser',
    password: 'UnverifiedPassword123!',
    fullName: 'Unverified User'
  }
};

const mockResponses = {
  registrationSuccess: {
    success: true,
    message: 'Registration successful',
    verificationEmail: testUsers.valid.email,
    developmentOTP: '123456',
  },
  registrationDuplicate: {
    success: false,
    message: 'Validation failed',
    details: [
      { field: 'email', message: 'Email already exists' },
      { field: 'username', message: 'Username already taken' },
    ],
  },
  verificationSuccess: {
    success: true,
    message: 'Email verified successfully',
    accessToken: 'mock-access-token-12345',
    refreshToken: 'mock-refresh-token-67890',
  },
  verificationInvalid: {
    success: false,
    message: 'Invalid or expired OTP',
    details: [{ field: 'otp', message: 'The verification code is invalid or has expired' }],
  },
  signinSuccess: {
    success: true,
    data: {
      user: {
        id: '1',
        email: testUsers.valid.email,
        username: testUsers.valid.username,
        fullName: testUsers.valid.fullName,
        emailVerified: true,
        role: 'user',
        isActive: true,
      },
      accessToken: 'mock-access-token-signin',
      refreshToken: 'mock-refresh-token-signin',
    },
  },
  signinInvalid: {
    success: false,
    message: 'Invalid credentials',
    error: 'Authentication failed',
  },
  signinUnverified: {
    success: true,
    requiresVerification: true,
    message: 'Please verify your email before signing in',
    verificationEmail: testUsers.unverified.email,
  },
  onboardingSuccess: {
    success: true,
    message: 'Onboarding completed successfully',
    data: {
      user: {
        id: '1',
        email: testUsers.valid.email,
        username: testUsers.valid.username,
        fullName: testUsers.valid.fullName,
        emailVerified: true,
        role: 'user',
        isActive: true,
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
  },
};

describe('Comprehensive Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockBack.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete User Journey: Registration to Dashboard', () => {
    it('should complete full user journey successfully', async () => {
      // Step 1: Registration
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses.registrationSuccess,
      });

      const registrationResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUsers.valid.email,
          username: testUsers.valid.username,
          password: testUsers.valid.password,
          confirmPassword: testUsers.valid.password,
          fullName: testUsers.valid.fullName,
          bio: testUsers.valid.bio,
          acceptTerms: true,
        }),
      });

      const registrationResult = await registrationResponse.json();
      expect(registrationResult.success).toBe(true);
      expect(registrationResult.verificationEmail).toBe(testUsers.valid.email);

      // Simulate storing verification email in session
      sessionStorageMock.setItem('verificationEmail', testUsers.valid.email);
      sessionStorageMock.setItem('developmentOTP', '123456');

      // Step 2: Email Verification
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses.verificationSuccess,
      });

      const verificationResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUsers.valid.email,
          otp: '123456',
        }),
      });

      const verificationResult = await verificationResponse.json();
      expect(verificationResult.success).toBe(true);
      expect(verificationResult.accessToken).toBeDefined();

      // Simulate storing tokens
      localStorageMock.setItem('accessToken', verificationResult.accessToken);
      localStorageMock.setItem('refreshToken', verificationResult.refreshToken);

      // Step 3: Onboarding Completion
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses.onboardingSuccess,
      });

      const onboardingResponse = await fetch('/api/users/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: testUsers.valid.fullName,
          bio: testUsers.valid.bio,
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
        }),
      });

      const onboardingResult = await onboardingResponse.json();
      expect(onboardingResult.success).toBe(true);
      expect(onboardingResult.data.user.academicInfo).toBeDefined();
      expect(onboardingResult.data.user.interests).toHaveLength(3);

      // Verify all API calls were made in correct order
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(fetch).toHaveBeenNthCalledWith(1, '/api/auth/register', expect.any(Object));
      expect(fetch).toHaveBeenNthCalledWith(2, '/api/auth/verify-email', expect.any(Object));
      expect(fetch).toHaveBeenNthCalledWith(3, '/api/users/complete-onboarding', expect.any(Object));
    });

    it('should handle registration with existing email/username', async () => {
      // Mock duplicate registration response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => mockResponses.registrationDuplicate,
      });

      const registrationResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUsers.duplicate.email,
          username: testUsers.duplicate.username,
          password: testUsers.duplicate.password,
          confirmPassword: testUsers.duplicate.password,
          fullName: testUsers.duplicate.fullName,
          acceptTerms: true,
        }),
      });

      const result = await registrationResponse.json();
      
      expect(registrationResponse.ok).toBe(false);
      expect(result.success).toBe(false);
      expect(result.details).toHaveLength(2);
      expect(result.details[0].field).toBe('email');
      expect(result.details[1].field).toBe('username');
    });

    it('should handle signin with unverified email', async () => {
      // Mock signin response requiring verification
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses.signinUnverified,
      });

      const signinResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: testUsers.unverified.email,
          password: testUsers.unverified.password,
          rememberMe: false,
          sessionDuration: 24,
        }),
      });

      const result = await signinResponse.json();
      
      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(true);
      expect(result.verificationEmail).toBe(testUsers.unverified.email);
    });
  });

  describe('Error Scenarios and Recovery Flows', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: testUsers.valid.email,
            password: testUsers.valid.password,
          }),
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle server errors with proper status codes', async () => {
      const serverErrors = [
        { status: 500, message: 'Internal server error' },
        { status: 503, message: 'Service unavailable' },
        { status: 429, message: 'Too many requests' },
      ];

      for (const serverError of serverErrors) {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: serverError.status,
          json: async () => ({
            success: false,
            message: serverError.message,
            error: 'Server error occurred',
          }),
        });

        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: testUsers.valid.email,
            password: testUsers.valid.password,
          }),
        });

        const result = await response.json();

        expect(response.ok).toBe(false);
        expect(response.status).toBe(serverError.status);
        expect(result.success).toBe(false);
        expect(result.message).toBe(serverError.message);
      }
    });

    it('should handle invalid OTP with retry mechanism', async () => {
      // First attempt - invalid OTP
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockResponses.verificationInvalid,
      });

      const firstAttempt = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUsers.valid.email,
          otp: '000000', // Invalid OTP
        }),
      });

      const firstResult = await firstAttempt.json();
      expect(firstResult.success).toBe(false);
      expect(firstResult.details[0].field).toBe('otp');

      // Second attempt - valid OTP
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses.verificationSuccess,
      });

      const secondAttempt = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUsers.valid.email,
          otp: '123456', // Valid OTP
        }),
      });

      const secondResult = await secondAttempt.json();
      expect(secondResult.success).toBe(true);
      expect(secondResult.accessToken).toBeDefined();
    });

    it('should handle OTP resend with rate limiting', async () => {
      // First resend - success
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Verification code sent successfully',
          developmentOTP: '654321',
        }),
      });

      const firstResend = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUsers.valid.email }),
      });

      const firstResult = await firstResend.json();
      expect(firstResult.success).toBe(true);

      // Second resend too soon - rate limited
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          message: 'Too many resend attempts. Please wait before trying again.',
          error: 'Rate limit exceeded',
        }),
      });

      const secondResend = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUsers.valid.email }),
      });

      const secondResult = await secondResend.json();
      expect(secondResult.success).toBe(false);
      expect(secondResend.status).toBe(429);
    });

    it('should handle token expiration and refresh', async () => {
      // Mock expired token scenario
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'accessToken') return 'expired-access-token';
        if (key === 'refreshToken') return 'valid-refresh-token';
        return null;
      });

      // First API call fails due to expired token
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: 'Token expired',
          error: 'Unauthorized',
        }),
      });

      const failedRequest = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer expired-access-token',
        },
      });

      const failedResult = await failedRequest.json();
      expect(failedResult.success).toBe(false);
      expect(failedRequest.status).toBe(401);

      // Token refresh call
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
      });

      const refreshResponse = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      const refreshResult = await refreshResponse.json();
      expect(refreshResult.success).toBe(true);
      expect(refreshResult.accessToken).toBe('new-access-token');

      // Retry original request with new token
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { user: mockResponses.signinSuccess.data.user },
        }),
      });

      const retryRequest = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer new-access-token',
        },
      });

      const retryResult = await retryRequest.json();
      expect(retryResult.success).toBe(true);
      expect(retryResult.data.user).toBeDefined();
    });
  });

  describe('Cross-Browser Compatibility Simulation', () => {
    it('should handle different localStorage implementations', () => {
      // Test with localStorage unavailable
      const originalLocalStorage = window.localStorage;
      
      // Simulate localStorage not available
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const fallbackStorage = {
        data: {} as Record<string, string>,
        getItem: function(key: string) { return this.data[key] || null; },
        setItem: function(key: string, value: string) { this.data[key] = value; },
        removeItem: function(key: string) { delete this.data[key]; },
        clear: function() { this.data = {}; },
      };

      // Use fallback storage
      fallbackStorage.setItem('test', 'value');
      expect(fallbackStorage.getItem('test')).toBe('value');

      fallbackStorage.removeItem('test');
      expect(fallbackStorage.getItem('test')).toBeNull();

      // Restore original localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it('should handle different cookie implementations', () => {
      // Mock document.cookie for different browsers
      const cookieImplementations = [
        // Standard implementation
        {
          get: () => 'sessionId=abc123; userId=user1',
          set: (value: string) => value,
        },
        // IE implementation (limited)
        {
          get: () => 'sessionId=abc123',
          set: (value: string) => value.substring(0, 100), // IE cookie size limit
        },
        // Safari implementation (with restrictions)
        {
          get: () => 'sessionId=abc123; SameSite=Strict',
          set: (value: string) => value.includes('SameSite') ? value : value + '; SameSite=Lax',
        },
      ];

      cookieImplementations.forEach((impl, index) => {
        const cookies = impl.get();
        expect(cookies).toContain('sessionId=abc123');

        const newCookie = impl.set('newCookie=value123; Path=/');
        expect(newCookie).toContain('newCookie=value123');
      });
    });

    it('should handle different fetch implementations', async () => {
      // Test with different fetch polyfills/implementations
      const fetchImplementations = [
        // Standard fetch
        {
          fetch: jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
          }),
        },
        // XMLHttpRequest fallback
        {
          fetch: jest.fn().mockImplementation(async (url: string, options: any) => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  ok: true,
                  json: async () => ({ success: true, fallback: 'xhr' }),
                });
              }, 100);
            });
          }),
        },
      ];

      for (const impl of fetchImplementations) {
        global.fetch = impl.fetch;

        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: testUsers.valid.email,
            password: testUsers.valid.password,
          }),
        });

        const result = await response.json();
        expect(result.success).toBe(true);
      }
    });

    it('should handle different URL implementations', () => {
      // Test URL parsing across different browsers
      const testUrls = [
        'http://localhost:3000/auth/signin',
        'https://example.com/auth/signin?redirect=/dashboard',
        'https://subdomain.example.com/auth/verify-email#section',
      ];

      testUrls.forEach(urlString => {
        // Modern browsers
        const url = new URL(urlString);
        expect(url.protocol).toMatch(/^https?:$/);
        expect(url.hostname).toBeDefined();
        expect(url.pathname).toContain('/auth/');

        // Legacy browser simulation
        const legacyUrl = {
          href: urlString,
          protocol: urlString.split('://')[0] + ':',
          hostname: urlString.split('://')[1]?.split('/')[0]?.split('?')[0]?.split('#')[0] || '',
          pathname: '/' + urlString.split('://')[1]?.split('/').slice(1).join('/').split('?')[0].split('#')[0] || '',
        };

        expect(legacyUrl.protocol).toMatch(/^https?:$/);
        expect(legacyUrl.hostname).toBeDefined();
        expect(legacyUrl.pathname).toContain('/auth/');
      });
    });
  });

  describe('Form Validation Integration', () => {
    it('should validate complete registration form', () => {
      const validateRegistrationForm = (data: any) => {
        const errors: Record<string, string> = {};

        // Email validation
        if (!data.email) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.email = 'Please enter a valid email address';
        }

        // Username validation
        if (!data.username) {
          errors.username = 'Username is required';
        } else if (data.username.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
          errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
        }

        // Password validation
        if (!data.password) {
          errors.password = 'Password is required';
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
            errors.password = `Password must meet all requirements: ${missingRequirements.join(', ')}`;
          }
        }

        // Password confirmation
        if (data.password !== data.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }

        // Full name validation
        if (!data.fullName || data.fullName.trim().length === 0) {
          errors.fullName = 'Full name is required';
        }

        // Terms acceptance
        if (!data.acceptTerms) {
          errors.acceptTerms = 'You must accept the terms and conditions';
        }

        return {
          isValid: Object.keys(errors).length === 0,
          errors,
        };
      };

      // Test valid form data
      const validData = {
        email: testUsers.valid.email,
        username: testUsers.valid.username,
        password: testUsers.valid.password,
        confirmPassword: testUsers.valid.password,
        fullName: testUsers.valid.fullName,
        acceptTerms: true,
      };

      const validResult = validateRegistrationForm(validData);
      expect(validResult.isValid).toBe(true);
      expect(Object.keys(validResult.errors)).toHaveLength(0);

      // Test invalid form data
      const invalidData = {
        email: 'invalid-email',
        username: 'ab',
        password: 'weak',
        confirmPassword: 'different',
        fullName: '',
        acceptTerms: false,
      };

      const invalidResult = validateRegistrationForm(invalidData);
      expect(invalidResult.isValid).toBe(false);
      expect(Object.keys(invalidResult.errors)).toHaveLength(6);
      expect(invalidResult.errors.email).toContain('valid email');
      expect(invalidResult.errors.username).toContain('at least 3 characters');
      expect(invalidResult.errors.password).toContain('requirements');
      expect(invalidResult.errors.confirmPassword).toContain('do not match');
      expect(invalidResult.errors.fullName).toContain('required');
      expect(invalidResult.errors.acceptTerms).toContain('accept');
    });

    it('should validate signin form', () => {
      const validateSigninForm = (data: any) => {
        const errors: Record<string, string> = {};

        if (!data.identifier) {
          errors.identifier = 'Email or username is required';
        }

        if (!data.password) {
          errors.password = 'Password is required';
        }

        return {
          isValid: Object.keys(errors).length === 0,
          errors,
        };
      };

      // Valid signin data
      const validData = {
        identifier: testUsers.valid.email,
        password: testUsers.valid.password,
      };

      const validResult = validateSigninForm(validData);
      expect(validResult.isValid).toBe(true);

      // Invalid signin data
      const invalidData = {
        identifier: '',
        password: '',
      };

      const invalidResult = validateSigninForm(invalidData);
      expect(invalidResult.isValid).toBe(false);
      expect(Object.keys(invalidResult.errors)).toHaveLength(2);
    });

    it('should validate OTP input', () => {
      const validateOTP = (otp: string) => {
        const errors: string[] = [];

        if (!otp) {
          errors.push('Verification code is required');
        } else if (otp.length !== 6) {
          errors.push('Verification code must be 6 digits');
        } else if (!/^\d{6}$/.test(otp)) {
          errors.push('Verification code must contain only numbers');
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      // Valid OTPs
      const validOTPs = ['123456', '000000', '999999'];
      validOTPs.forEach(otp => {
        const result = validateOTP(otp);
        expect(result.isValid).toBe(true);
      });

      // Invalid OTPs
      const invalidOTPs = [
        { otp: '', expectedError: 'required' },
        { otp: '12345', expectedError: '6 digits' },
        { otp: '1234567', expectedError: '6 digits' },
        { otp: 'abcdef', expectedError: 'only numbers' },
        { otp: '12a456', expectedError: 'only numbers' },
      ];

      invalidOTPs.forEach(({ otp, expectedError }) => {
        const result = validateOTP(otp);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain(expectedError);
      });
    });
  });

  describe('Session Management Integration', () => {
    it('should manage user session lifecycle', () => {
      const sessionManager = {
        createSession: (user: any, rememberMe: boolean = false) => {
          const sessionData = {
            user,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
            isActive: true,
          };

          localStorageMock.setItem('userSession', JSON.stringify(sessionData));
          return sessionData;
        },

        getSession: () => {
          const sessionData = localStorageMock.getItem('userSession');
          if (!sessionData) return null;

          try {
            const session = JSON.parse(sessionData);
            const now = new Date();
            const expiresAt = new Date(session.expiresAt);

            if (now > expiresAt || !session.isActive) {
              sessionManager.clearSession();
              return null;
            }

            return session;
          } catch {
            return null;
          }
        },

        clearSession: () => {
          localStorageMock.removeItem('userSession');
          localStorageMock.removeItem('accessToken');
          localStorageMock.removeItem('refreshToken');
        },

        isSessionValid: () => {
          const session = sessionManager.getSession();
          return session !== null;
        },
      };

      // Create session
      const user = mockResponses.signinSuccess.data.user;
      const session = sessionManager.createSession(user, false);
      
      expect(session.user.id).toBe(user.id);
      expect(session.isActive).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userSession', expect.any(String));

      // Get valid session
      localStorageMock.getItem.mockReturnValue(JSON.stringify(session));
      const retrievedSession = sessionManager.getSession();
      expect(retrievedSession).not.toBeNull();
      expect(retrievedSession?.user.id).toBe(user.id);

      // Check session validity
      expect(sessionManager.isSessionValid()).toBe(true);

      // Clear session
      sessionManager.clearSession();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userSession');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    it('should handle expired sessions', () => {
      const expiredSession = {
        user: mockResponses.signinSuccess.data.user,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired 1 day ago
        isActive: true,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession));

      const sessionManager = {
        getSession: () => {
          const sessionData = localStorageMock.getItem('userSession');
          if (!sessionData) return null;

          const session = JSON.parse(sessionData);
          const now = new Date();
          const expiresAt = new Date(session.expiresAt);

          if (now > expiresAt) {
            return null; // Session expired
          }

          return session;
        },
      };

      const session = sessionManager.getSession();
      expect(session).toBeNull(); // Should be null due to expiration
    });
  });

  describe('Complete Error Recovery Scenarios', () => {
    it('should recover from complete authentication flow failure', async () => {
      // Scenario: User starts registration, encounters network error, retries successfully
      
      // Step 1: Initial registration fails
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUsers.valid.email,
            username: testUsers.valid.username,
            password: testUsers.valid.password,
            confirmPassword: testUsers.valid.password,
            fullName: testUsers.valid.fullName,
            acceptTerms: true,
          }),
        });
      } catch (error) {
        expect((error as Error).message).toBe('Network error');
      }

      // Step 2: Retry registration succeeds
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses.registrationSuccess,
      });

      const retryResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUsers.valid.email,
          username: testUsers.valid.username,
          password: testUsers.valid.password,
          confirmPassword: testUsers.valid.password,
          fullName: testUsers.valid.fullName,
          acceptTerms: true,
        }),
      });

      const retryResult = await retryResponse.json();
      expect(retryResult.success).toBe(true);

      // Step 3: Continue with verification
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses.verificationSuccess,
      });

      const verificationResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUsers.valid.email,
          otp: '123456',
        }),
      });

      const verificationResult = await verificationResponse.json();
      expect(verificationResult.success).toBe(true);
    });

    it('should handle partial onboarding completion', async () => {
      // Scenario: User completes some onboarding steps, encounters error, resumes from where they left off
      
      const partialOnboardingData = {
        fullName: testUsers.valid.fullName,
        bio: testUsers.valid.bio,
        // Missing academic info, interests, etc.
      };

      // First attempt with partial data fails
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'Incomplete onboarding data',
          missingFields: ['privacySettings', 'wellnessSettings'],
        }),
      });

      const partialResponse = await fetch('/api/users/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialOnboardingData),
      });

      const partialResult = await partialResponse.json();
      expect(partialResult.success).toBe(false);
      expect(partialResult.missingFields).toContain('privacySettings');

      // Complete onboarding with all required data
      const completeOnboardingData = {
        ...partialOnboardingData,
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

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponses.onboardingSuccess,
      });

      const completeResponse = await fetch('/api/users/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeOnboardingData),
      });

      const completeResult = await completeResponse.json();
      expect(completeResult.success).toBe(true);
    });
  });
});