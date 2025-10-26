'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AuthNavigationProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
}

export default function AuthNavigation({ 
  showBackButton = true, 
  backHref = '/', 
  backText = 'Back to Home' 
}: AuthNavigationProps) {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Auralis</span>
          </Link>

          {/* Back Button */}
          {showBackButton && (
            <Link
              href={backHref}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm font-medium">{backText}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}