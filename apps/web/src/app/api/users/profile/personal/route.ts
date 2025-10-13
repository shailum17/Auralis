import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Personal info update request:', body);
    
    const mockUpdatedUser = {
      id: 'user-123',
      email: 'user@example.com',
      username: 'user123',
      role: 'user',
      emailVerified: true,
      fullName: body.fullName || '',
      bio: body.bio || '',
      dateOfBirth: body.dateOfBirth || null,
      gender: body.gender || null,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        user: mockUpdatedUser
      }
    });

  } catch (error) {
    console.error('Error updating personal info:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update personal information'
    }, { status: 500 });
  }
}