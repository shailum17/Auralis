import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // Check backend API connectivity
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    let backendStatus = 'disconnected';
    let backendError = null;
    
    try {
      const response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        backendStatus = 'connected';
      } else {
        backendStatus = 'error';
        backendError = `HTTP ${response.status}`;
      }
    } catch (error) {
      backendStatus = 'disconnected';
      backendError = (error as Error).message;
    }

    // Check pending users in memory
    const pendingUsers = globalThis.pendingUsers || {};
    const pendingCount = Object.keys(pendingUsers).length;

    // Check OTP store
    const otpStore = globalThis.otpStore || {};
    const otpCount = Object.keys(otpStore).length;

    return NextResponse.json({
      success: true,
      data: {
        backend: {
          url: backendUrl,
          status: backendStatus,
          error: backendError
        },
        memory: {
          pendingUsers: pendingCount,
          activeOtps: otpCount
        },
        recommendations: [
          backendStatus !== 'connected' ? 'Start the backend API server' : null,
          pendingCount > 0 ? `${pendingCount} users pending email verification` : null,
          otpCount > 0 ? `${otpCount} active OTP codes` : null
        ].filter(Boolean),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check database status',
      details: (error as Error).message
    }, { status: 500 });
  }
}