'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import PublicWellnessPage from './public/page';

interface WellnessLayoutProps {
  children: React.ReactNode;
}

export default function WellnessLayout({ children }: WellnessLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated and on the main wellness page, show public version
  if (!isAuthenticated && pathname === '/wellness') {
    return <PublicWellnessPage />;
  }

  // For authenticated users or sub-pages, show the regular content
  return <>{children}</>;
}