import { NextRequest, NextResponse } from 'next/server';

// Redirect signin requests to enhanced-login for backward compatibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform identifier to email/username format for enhanced-login
    const transformedBody = {
      ...body,
      email: body.identifier && body.identifier.includes('@') ? body.identifier : undefined,
      username: body.identifier && !body.identifier.includes('@') ? body.identifier : undefined,
    };
    
    // Remove the identifier field as enhanced-login doesn't expect it
    delete transformedBody.identifier;
    
    // Forward the request to enhanced-login
    const enhancedLoginUrl = new URL('/api/auth/enhanced-login', request.url);
    
    const response = await fetch(enhancedLoginUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || 'unknown',
        'user-agent': request.headers.get('user-agent') || 'unknown',
      },
      body: JSON.stringify(transformedBody),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Signin redirect error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}