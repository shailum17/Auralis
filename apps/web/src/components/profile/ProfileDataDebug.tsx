'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function ProfileDataDebug() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug: Current User Data</h4>
      <div className="text-xs text-yellow-700 space-y-1">
        <div><strong>Phone:</strong> {user.phone || 'Not set'}</div>
        <div><strong>Pronouns:</strong> {user.pronouns || 'Not set'}</div>
        <div><strong>Location:</strong> {user.location || 'Not set'}</div>
        <div><strong>Full Name:</strong> {user.fullName || 'Not set'}</div>
        <div><strong>Bio:</strong> {user.bio || 'Not set'}</div>
        <div><strong>Major:</strong> {user.academicInfo?.major || 'Not set'}</div>
      </div>
      <div className="mt-2 text-xs text-yellow-600">
        This debug info will be removed in production
      </div>
    </div>
  );
}