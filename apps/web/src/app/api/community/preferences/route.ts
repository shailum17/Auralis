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

// PUT /api/community/preferences - Update user interests
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📝 Updating community preferences:', body);

    // Update user preferences in backend
    const response = await fetch(`${API_BASE_URL}/api/v1/community/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update preferences');
    }

    const data = await response.json();
    console.log('✅ Preferences updated successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update preferences', error: (error as Error).message },
      { status: 500 }
    );
  }
}
