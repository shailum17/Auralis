import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      console.warn('Refresh token missing in request');
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to refresh token...');

    // Call backend refresh token endpoint
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Token refresh failed:', data.message || data.error);
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || data.error || 'Token refresh failed' 
        },
        { status: response.status }
      );
    }

    console.log('Token refreshed successfully');
    return NextResponse.json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}