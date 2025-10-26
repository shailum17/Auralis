import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock fetch for backend API calls
global.fetch = jest.fn();

describe('/api/auth/verify-email', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set default environment
    process.env.BACKEND_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    delete process.env.BACKEND_URL;
  });

  it('should verify email successfully', async () => {
    // Mock successful backend response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Email verified successfully',
        user: { id: '1', email: 'test@example.com', emailVerified: true },
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Email verified successfully');
    expect(result.user).toBeDefined();
    expect(result.accessToken).toBe('access_token_123');
    expect(result.refreshToken).toBe('refresh_token_123');

    // Verify backend API was called correctly
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/otp/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });
  });

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Email and OTP are required');
    expect(result.details).toEqual([
      { field: 'email', message: 'Email is required' },
      { field: 'otp', message: 'Verification code is required' },
    ]);
  });

  it('should validate email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        otp: '123456',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email format');
    expect(result.details).toEqual([
      { field: 'email', message: 'Please enter a valid email address' },
    ]);
  });

  it('should validate OTP format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '12345', // Only 5 digits
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid verification code format');
    expect(result.details).toEqual([
      { field: 'otp', message: 'Verification code must be 6 digits' },
    ]);
  });

  it('should handle invalid OTP from backend', async () => {
    // Mock backend error response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        message: 'Invalid or expired OTP',
        details: [{ field: 'otp', message: 'Invalid or expired verification code' }],
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid or expired OTP');
    expect(result.details).toEqual([
      { field: 'otp', message: 'Invalid or expired verification code' },
    ]);
  });

  it('should handle user not found error', async () => {
    // Mock backend 404 response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        message: 'User not found',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        otp: '123456',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result.success).toBe(false);
    expect(result.message).toBe('User not found or already verified');
    expect(result.details).toEqual([
      { field: 'email', message: 'User not found or email already verified' },
    ]);
  });

  it('should handle rate limiting error', async () => {
    // Mock backend 429 response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        success: false,
        message: 'Too many attempts',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(429);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Too many verification attempts');
    expect(result.details).toEqual([
      { field: 'otp', message: 'Too many failed attempts. Please request a new code.' },
    ]);
  });

  it('should handle backend server errors', async () => {
    // Mock backend 500 response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: 'Internal server error',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Verification failed');
    expect(result.details).toEqual([
      { field: 'general', message: 'Server error. Please try again later.' },
    ]);
  });

  it('should handle network errors', async () => {
    // Mock network error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Internal server error');
    expect(result.details).toEqual([
      { field: 'general', message: 'An unexpected error occurred. Please try again.' },
    ]);
  });

  it('should handle malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Internal server error');
  });

  it('should use default backend URL when not set', async () => {
    delete process.env.BACKEND_URL;

    // Mock successful backend response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Email verified successfully',
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });

    await POST(request);

    // Should use default URL
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/otp/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });
  });

  it('should validate OTP contains only digits', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '12345a', // Contains letter
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid verification code format');
    expect(result.details).toEqual([
      { field: 'otp', message: 'Verification code must be 6 digits' },
    ]);
  });

  it('should handle empty request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: '',
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Internal server error');
  });
});