import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin/dashboard')) {
    // Check if user has admin session via cookies
    const userCookie = request.cookies.get('user');
    const accessTokenCookie = request.cookies.get('accessToken');
    
    // If no cookies found, redirect to login
    if (!userCookie || !accessTokenCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verify user has admin role
    try {
      const user = JSON.parse(userCookie.value);
      if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      console.error('Failed to parse user cookie:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
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