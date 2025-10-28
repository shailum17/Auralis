import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for admin setup
const adminSetupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'MODERATOR']).default('ADMIN'),
});

export async function POST(request: NextRequest) {
  console.log('🔧 Admin setup API called');
  
  try {
    const body = await request.json();
    console.log('📝 Request body received:', { ...body, password: '[REDACTED]' });
    
    // Validate request body
    const validationResult = adminSetupSchema.safeParse(body);
    
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

    const { username, email, password, fullName, role } = validationResult.data;
    console.log('✅ Validation passed, calling backend API...');

    // Call backend API to create admin user
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/v1/auth/admin/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        fullName,
        role
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Failed to create admin user',
        },
        { status: response.status || 400 }
      );
    }

    // Log admin creation
    console.log(`✅ Admin user created via backend: ${username} (${email})`);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: result.admin
    });

  } catch (error) {
    console.error('❌ Admin setup error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Call backend API to check if admin users exist
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/v1/auth/admin/setup`);
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to check admin users');
    }
    
    return NextResponse.json({
      success: true,
      hasAdmins: result.hasAdmins,
      message: result.message
    });

  } catch (error) {
    console.error('Admin check error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check admin users',
      },
      { status: 500 }
    );
  }
}