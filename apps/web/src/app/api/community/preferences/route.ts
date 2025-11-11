import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// GET /api/community/preferences - Check user onboarding
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user preferences from backend
    const response = await fetch(`${API_BASE_URL}/api/v1/community/preferences`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch preferences');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}
