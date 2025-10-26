import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Call backend logout endpoint if we have a token
    if (authHeader) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
        });

        // Don't fail if backend logout fails - we still want to clear client-side tokens
        if (!response.ok) {
          console.warn('Backend logout failed, but continuing with client-side logout');
        }
      } catch (error) {
        console.warn('Backend logout request failed:', error);
        // Continue with client-side logout even if backend fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout API error:', error);
    
    // Even if there's an error, we should still return success for logout
    // since the client should clear tokens regardless
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}