import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Call backend validate token endpoint
    const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Token validation failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      user: data.user,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token validation API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Token validation failed' },
      { status: 401 }
    );
  }
}