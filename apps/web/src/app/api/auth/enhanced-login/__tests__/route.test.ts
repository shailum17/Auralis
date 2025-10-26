import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/auth/enhanced-login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  });

  const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      headers: {
        get: jest.fn((key: string) => headers[key] || null),
      },
    } as unknown as NextRequest;
  };

  describe('Successful Authentication', () => {
    it('should authenticate user with email and password', async () => {
      const mockBackendResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          emailVerified: true,
          role: 'USER',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBackendResponse),
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
        sessionDuration: 24,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/enhanced-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': 'unknown',
          'user-agent': 'unknown',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          username: undefined,
          password: 'password123',
          rememberMe: false,
          sessionDuration: 24,
        }),
      });

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        user: mockBackendResponse.user,
        accessToken: mockBackendResponse.accessToken,
        refreshToken: mockBackendResponse.refreshToken,
        message: 'Login successful',
      });
    });

    it('should authenticate user with username and password', async () => {
      const mockBackendResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          emailVerified: true,
          role: 'USER',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBackendResponse),
      });

      const request = createMockRequest({
        username: 'testuser',
        password: 'password123',
        rememberMe: true,
        sessionDuration: 168,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/enhanced-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': 'unknown',
          'user-agent': 'unknown',
        },
        body: JSON.stringify({
          email: undefined,
          username: 'testuser',
          password: 'password123',
          rememberMe: true,
          sessionDuration: 168,
        }),
      });

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should include client IP and user agent in request', async () => {
      const mockBackendResponse = {
        user: { id: '1', emailVerified: true },
        accessToken: 'token',
        refreshToken: 'refresh',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBackendResponse),
      });

      const request = createMockRequest(
        {
          email: 'test@example.com',
          password: 'password123',
        },
        {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0 Test Browser',
        }
      );

      await POST(request);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/enhanced-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0 Test Browser',
        },
        body: expect.any(String),
      });
    });
  });

  describe('Email Verification Required', () => {
    it('should handle unverified email', async () => {
      const mockBackendResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          emailVerified: false,
          role: 'USER',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBackendResponse),
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        success: false,
        error: 'Please verify your email address before signing in',
        requiresVerification: true,
        user: {
          email: 'test@example.com',
          username: 'testuser',
        },
      });
    });
  });

  describe('Authentication Errors', () => {
    it('should handle invalid credentials', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          message: 'Invalid credentials',
        }),
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: 'Invalid credentials',
        requiresVerification: false,
      });
    });

    it('should handle backend server errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({
          error: 'Internal server error',
        }),
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Internal server error. Please try again.',
      });
    });
  });

  describe('Input Validation', () => {
    it('should require password', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Password is required',
      });
    });

    it('should require either email or username', async () => {
      const request = createMockRequest({
        password: 'password123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Either email or username is required',
      });
    });

    it('should handle malformed JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('Session Configuration', () => {
    it('should handle remember me and custom session duration', async () => {
      const mockBackendResponse = {
        user: { id: '1', emailVerified: true },
        accessToken: 'token',
        refreshToken: 'refresh',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBackendResponse),
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
        sessionDuration: 720, // 30 days
      });

      await POST(request);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/enhanced-login', {
        method: 'POST',
        headers: expect.any(Object),
        body: JSON.stringify({
          email: 'test@example.com',
          username: undefined,
          password: 'password123',
          rememberMe: true,
          sessionDuration: 720,
        }),
      });
    });

    it('should use default values for optional parameters', async () => {
      const mockBackendResponse = {
        user: { id: '1', emailVerified: true },
        accessToken: 'token',
        refreshToken: 'refresh',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBackendResponse),
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      await POST(request);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/enhanced-login', {
        method: 'POST',
        headers: expect.any(Object),
        body: JSON.stringify({
          email: 'test@example.com',
          username: undefined,
          password: 'password123',
          rememberMe: false,
          sessionDuration: 24,
        }),
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should use custom API URL from environment', async () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

      const mockBackendResponse = {
        user: { id: '1', emailVerified: true },
        accessToken: 'token',
        refreshToken: 'refresh',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBackendResponse),
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      await POST(request);

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/auth/enhanced-login', {
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      });
    });
  });
});