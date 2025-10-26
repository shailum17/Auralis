import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple registration test started');
    
    const body = await request.json();
    console.log('📝 Received data:', {
      email: body.email,
      username: body.username,
      fullName: body.fullName,
      hasPassword: !!body.password
    });

    // Basic validation
    if (!body.email || !body.password || !body.username || !body.fullName) {
      console.log('❌ Validation failed: Missing required fields');
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Simulate user creation without database
    const mockUser = {
      id: `user_${Date.now()}`,
      email: body.email.toLowerCase(),
      username: body.username,
      fullName: body.fullName,
      emailVerified: false,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    // Generate mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in global for testing
    (globalThis as any).testOtpStore = (globalThis as any).testOtpStore || {};
    (globalThis as any).testOtpStore[body.email.toLowerCase()] = {
      otp: otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      user: mockUser
    };

    console.log('✅ Simple registration test successful');
    console.log('🔐 Test OTP:', otp);

    return NextResponse.json({
      success: true,
      data: {
        user: mockUser,
        otp: otp, // Only for testing
        message: 'Simple registration test successful'
      }
    });

  } catch (error) {
    console.error('❌ Simple registration test error:', error);
    
    return NextResponse.json({
      success: false,
      error: `Simple registration test failed: ${(error as Error).message}`
    }, { status: 500 });
  }
}