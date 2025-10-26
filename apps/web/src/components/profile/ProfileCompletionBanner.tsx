'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getProfileCompletionStatus, getNextProfileStep } from '@/lib/profile-utils';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import Link from 'next/link';
import { useState } from 'react';

interface ProfileCompletionBannerProps {
  className?: string;
  showDismiss?: boolean;
}

export function ProfileCompletionBanner({ 
  className = '', 
  showDismiss = true 
}: ProfileCompletionBannerProps) {
  // Use actual auth context
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || dismissed) return null;

  const status = getProfileCompletionStatus(user);
  const nextStep = getNextProfileStep(user);

  // Debug: Let's see what the status is
  console.log('Profile completion status:', status);
  console.log('User data:', user);

  // Show different content based on completion status
  if (status.isComplete) {
    return (
      <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Profile Complete! 🎉
            </h3>
            <p className="text-xs text-gray-600">
              Your profile is {status.completionPercentage}% complete. You can always add more information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Complete Your Profile
              </h3>
              <p className="text-xs text-gray-600">
                {status.completionPercentage}% complete • {nextStep}
              </p>
            </div>
          </div>

          <div className="mb-3">
            <Progress 
              value={status.completionPercentage} 
              size="sm"
              variant="gradient"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/profile/edit">
              <Button size="sm" variant="primary">
                Complete Profile
              </Button>
            </Link>
            
            {showDismiss && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setDismissed(true)}
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>

        {showDismiss && (
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function ProfileCompletionIndicator({ className = '' }: { className?: string }) {
  // Use actual auth context
  const { user } = useAuth();

  if (!user) return null;

  const status = getProfileCompletionStatus(user);

  if (status.isComplete) {
    return (
      <div className={`flex items-center text-green-600 ${className}`}>
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium">Profile Complete</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-4 h-4 mr-2">
        <Progress 
          value={status.completionPercentage} 
          size="xs"
          variant="primary"
        />
      </div>
      <span className="text-xs text-gray-600">
        {status.completionPercentage}% complete
      </span>
    </div>
  );
}