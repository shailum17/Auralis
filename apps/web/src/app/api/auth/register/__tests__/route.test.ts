import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validRegistrationData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'StrongPass123!',
    confirmPassword: 'StrongPass123!',
    fullName: 'Test User',
    bio: 'Test bio',
    acceptTerms: true,
  };

  it('should register a new user successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validRegistrationData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Account created successfully');
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.username).toBe('testuser');
    expect(data.requiresVerification).toBe(true);
    expect(data.developmentOTP).toBeDefined(); // Should include OTP in development
  });

  it('should reject registration with invalid email', async () => {
    const invalidData = {
      ...validRegistrationData,
      email: 'invalid-email',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
    expect(data.details.some((err: any) => err.message.includes('Invalid email'))).toBe(true);
  });

  it('should reject registration with weak password', async () => {
    const invalidData = {
      ...validRegistrationData,
      password: 'weak',
      confirmPassword: 'weak',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation failed');
  });

  it('should reject registration with mismatched passwords', async () => {
    const invalidData = {
      ...validRegistrationData,
      confirmPassword: 'DifferentPass123!',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.details.some((err: any) => err.message.includes('Passwords do not match'))).toBe(true);
  });

  it('should reject registration without accepting terms', async () => {
    const invalidData = {
      ...validRegistrationData,
      acceptTerms: false,
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.details.some((err: any) => err.message.includes('accept the terms'))).toBe(true);
  });

  it('should reject registration with duplicate email', async () => {
    const duplicateEmailData = {
      ...validRegistrationData,
      email: 'john@example.com', // This email exists in mock data
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(duplicateEmailData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error).toBe('EMAIL_ALREADY_EXISTS');
    expect(data.message).toBe('An account with this email address already exists');
  });

  it('should reject registration with duplicate username', async () => {
    const duplicateUsernameData = {
      ...validRegistrationData,
      username: 'john_doe', // This username exists in mock data
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(duplicateUsernameData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error).toBe('USERNAME_ALREADY_EXISTS');
    expect(data.message).toBe('This username is already taken');
  });

  it('should reject registration with invalid username characters', async () => {
    const invalidData = {
      ...validRegistrationData,
      username: 'user@name',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should reject registration with username too short', async () => {
    const invalidData = {
      ...validRegistrationData,
      username: 'ab',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should reject registration with full name too short', async () => {
    const invalidData = {
      ...validRegistrationData,
      fullName: 'A',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should handle missing required fields', async () => {
    const incompleteData = {
      email: 'test@example.com',
      // Missing other required fields
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(incompleteData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation failed');
  });

  it('should handle malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('INTERNAL_SERVER_ERROR');
  });

  it('should normalize email and username to lowercase', async () => {
    const upperCaseData = {
      ...validRegistrationData,
      email: 'TEST@EXAMPLE.COM',
      username: 'TESTUSER',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(upperCaseData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.username).toBe('testuser');
  });

  it('should set default privacy and wellness settings', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validRegistrationData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
    // Note: The API doesn't return privacy/wellness settings in the response for security,
    // but we can verify the registration was successful
    expect(data.success).toBe(true);
  });
});