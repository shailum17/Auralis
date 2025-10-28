import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for admin login
const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Generate a simple admin token (in production, use proper JWT)
 */
function generateAdminToken(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    type: 'admin',
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  // In production, use proper JWT signing
  return `admin_token_${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = adminLoginSchema.safeParse(body);
    
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

    const { username, password } = validationResult.data;

    // Debug logging
    console.log('🔐 Admin login attempt:', {
      username: username,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Call backend API for admin authentication
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/v1/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const authResult = await response.json();

    if (!response.ok || !authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'INVALID_CREDENTIALS',
          message: authResult.message || 'Invalid admin credentials',
        },
        { status: response.status || 401 }
      );
    }

    // Convert backend user to frontend user format
    const adminUser = {
      id: authResult.user.id,
      email: authResult.user.email,
      username: authResult.user.username,
      fullName: authResult.user.fullName,
      role: authResult.user.role,
      emailVerified: authResult.user.emailVerified || true,
      phoneVerified: false,
      bio: 'Administrator Account',
      interests: [],
      academicInfo: null,
      privacySettings: {
        allowDirectMessages: false,
        showOnlineStatus: false,
        allowProfileViewing: false,
        dataCollection: false,
      },
      wellnessSettings: {
        trackMood: false,
        trackStress: false,
        shareWellnessData: false,
        crisisAlertsEnabled: false,
        allowWellnessInsights: false,
      },
      createdAt: authResult.user.createdAt,
      updatedAt: authResult.user.updatedAt,
      lastActive: new Date().toISOString(),
    };

    // Use backend tokens
    const accessToken = authResult.access_token;
    const refreshToken = `admin_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log admin login for security
    console.log(`🔐 Admin login successful at ${new Date().toISOString()}`);
    console.log(`   IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`);
    console.log(`   User-Agent: ${request.headers.get('user-agent') || 'unknown'}`);

    return NextResponse.json({
      success: true,
      user: adminUser,
      accessToken,
      refreshToken,
      message: 'Admin login successful',
      requiresVerification: false,
    });

  } catch (error) {
    console.error('Admin login error:', error);
    
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