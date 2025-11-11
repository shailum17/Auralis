import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// GET /api/community/forums - Fetch all forums
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('Forums API: No authorization header');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Forums API: Fetching forums from backend...');
    
    // Fetch forums from backend
    const response = await fetch(`${API_BASE_URL}/api/v1/community/forums`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Forums API: Backend error', response.status, errorText);
      throw new Error(`Failed to fetch forums: ${response.status}`);
    }

    const data = await response.json();
    console.log('Forums API: Successfully fetched', data.data?.forums?.length || 0, 'forums');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Forums API: Error fetching forums:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch forums', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
