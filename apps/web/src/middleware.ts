import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin/dashboard')) {
    // Check if user has admin session
    const userCookie = request.cookies.get('user');
    const accessTokenCookie = request.cookies.get('accessToken');
    
    // For now, we'll rely on client-side protection since we're using localStorage
    // In production, you should use httpOnly cookies for better security
    
    // Allow access - client-side will handle the redirect if needed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/community/admin/:path*'
  ]
};