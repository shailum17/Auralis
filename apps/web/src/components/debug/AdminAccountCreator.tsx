'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminAccountCreator() {
  const { user, updateUser } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || 'USER');

  const handleRoleChange = (newRole: 'USER' | 'MODERATOR' | 'ADMIN') => {
    if (!user) return;

    const updatedUser = {
      ...user,
      role: newRole
    };

    // Update in auth context
    updateUser(updatedUser);
    
    // Update in localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setCurrentRole(newRole);
    
    alert(`Role updated to ${newRole}! You can now access admin features.`);
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">Please log in to manage admin roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Admin Account Creator</h4>
        <p className="text-sm text-blue-800 mb-3">
          Change your account role to access admin features. This is for development/testing only.
        </p>
        
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-blue-900">Current Role: </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              currentRole === 'ADMIN' ? 'bg-red-100 text-red-800' :
              currentRole === 'MODERATOR' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentRole}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleRoleChange('USER')}
              disabled={currentRole === 'USER'}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
            >
              Make User
            </button>
            <button
              onClick={() => handleRoleChange('MODERATOR')}
              disabled={currentRole === 'MODERATOR'}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
            >
              Make Moderator
            </button>
            <button
              onClick={() => handleRoleChange('ADMIN')}
              disabled={currentRole === 'ADMIN'}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
            >
              Make Admin
            </button>
          </div>
        </div>
      </div>
      
      {(currentRole === 'ADMIN' || currentRole === 'MODERATOR') && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ You now have {currentRole.toLowerCase()} privileges! 
            Go to the <a href="/community" className="font-medium underline">Community Forum</a> to access the admin panel.
          </p>
        </div>
      )}
    </div>
  );
}