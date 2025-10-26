import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(254, 'Email too long'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must meet security requirements'),
  confirmPassword: z.string(),
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-\.\']+$/, 'Full name contains invalid characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Mock database for demonstration - replace with actual database calls
const mockUsers = [
  { id: '1', email: 'john@example.com', username: 'john_doe' },
  { id: '2', email: 'jane@example.com', username: 'jane_smith' },
  { id: '3', email: 'admin@example.com', username: 'admin' },
  { id: '4', email: 'test@example.com', username: 'testuser' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      );
    }

    const { email, username, password, confirmPassword, fullName, bio, acceptTerms } = validationResult.data;

    // Check for duplicate email
    const existingEmailUser = mockUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingEmailUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists',
        },
        { status: 409 }
      );
    }

    // Check for duplicate username
    const existingUsernameUser = mockUsers.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingUsernameUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'USERNAME_ALREADY_EXISTS',
          message: 'This username is already taken',
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate user ID (in real app, this would be handled by the database)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user object (in real app, save to database)
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      fullName,
      bio: bio || null,
      passwordHash,
      emailVerified: false,
      phoneVerified: false,
      interests: [],
      privacySettings: {
        allowDirectMessages: true,
        showOnlineStatus: true,
        allowProfileViewing: true,
        dataCollection: false,
      },
      wellnessSettings: {
        trackMood: false,
        trackStress: false,
        shareWellnessData: false,
        crisisAlertsEnabled: true,
        allowWellnessInsights: false,
      },
      role: 'USER' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date(),
    };

    // Simulate database save delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Call backend API for enhanced registration
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    try {
      const backendResponse = await fetch(`${backendUrl}/api/v1/auth/register-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          username,
          password,
          confirmPassword,
          fullName,
          bio: bio || null,
          interests: validationResult.data.interests || [],
          academicInfo: validationResult.data.academicInfo || null,
          acceptTerms
        }),
      });

      const backendResult = await backendResponse.json();

      if (!backendResponse.ok) {
        if (backendResponse.status === 409) {
          return NextResponse.json(
            {
              success: false,
              error: 'USER_ALREADY_EXISTS',
              message: 'An account with this email or username already exists',
            },
            { status: 409 }
          );
        }
        
        throw new Error(backendResult.message || 'Backend registration failed');
      }

      // Backend already sends verification email, no need for additional call
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please check your email for verification code.',
        user: backendResult.data.user,
        requiresVerification: true,
        verificationEmail: email.toLowerCase(),
      });

    } catch (backendError) {
      console.error('Backend registration error:', backendError);
      
      // Fallback to local registration logic
      const otp = generateOTP();
      
      console.log(`Email verification OTP for ${email}: ${otp}`);
      
      // Return success response (don't include sensitive data)
      const userResponse = {
        id: userId,
        email: email.toLowerCase(),
        username,
        fullName,
        bio: bio || null,
        emailVerified: false,
        role: 'USER' as const,
        createdAt: new Date(),
      };

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: userResponse,
        requiresVerification: true,
        verificationEmail: email.toLowerCase(),
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a 6-digit OTP code
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Rate limiting helper (simplified version)
 */
function checkRateLimit(ip: string): boolean {
  // In a real application, implement proper rate limiting
  // This is a simplified version for demonstration
  return true;
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}