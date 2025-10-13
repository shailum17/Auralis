'use client';

import { useAuth } from '@/contexts/AuthContext';
import { checkRouteAccess, RouteProtectionConfig } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  config: RouteProtectionConfig;
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

export function ProtectedRoute({ 
  children, 
  config, 
  fallbackPath = '/login',
  showUnauthorized = false 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    const hasAccess = checkRouteAccess(
      user?.role,
      user?.permissions,
      config
    );

    if (!hasAccess) {
      if (showUnauthorized) {
        // Stay on page but show unauthorized message
        return;
      }
      // Redirect to appropriate page based on user role
      if (user?.role) {
        router.push('/dashboard');
      } else {
        router.push(fallbackPath);
      }
    }
  }, [user, isAuthenticated, loading, router, config, fallbackPath, showUnauthorized]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasAccess = checkRouteAccess(
    user?.role,
    user?.permissions,
    config
  );

  if (!hasAccess) {
    if (showUnauthorized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}

// Convenience wrapper for admin routes
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'config'> & { config?: RouteProtectionConfig }) {
  const defaultConfig: RouteProtectionConfig = {
    requiredRole: 'moderator' as any
  };

  return (
    <ProtectedRoute config={props.config || defaultConfig} {...props}>
      {children}
    </ProtectedRoute>
  );
}