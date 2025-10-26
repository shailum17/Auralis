'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function UserDebugInfo() {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        {user ? (
          <div>
            <div>User: {user.username || user.email}</div>
            <div>Email Verified: {user.emailVerified ? '✅' : '❌'}</div>
            <div>Role: {user.role}</div>
          </div>
        ) : (
          <div>No user data</div>
        )}
        {error && <div className="text-red-300">Error: {error}</div>}
      </div>
    </div>
  );
}