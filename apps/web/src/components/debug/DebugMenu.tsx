'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import AdminAccountCreator from './AdminAccountCreator';
import { DynamicProfileService } from '@/lib/dynamic-profile-service';
import { getProfileCompletionStatus, getNextProfileStep } from '@/lib/profile-utils';

export default function DebugMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('user');
  const { user, isAuthenticated, isLoading, error, tokens } = useAuth();

  // Debug: Log that the component is rendering
  console.log('DebugMenu component rendered', { 
    NODE_ENV: process.env.NODE_ENV,
    user: !!user,
    isAuthenticated 
  });

  const tabs = [
    { id: 'user', name: 'User Data', icon: '👤' },
    { id: 'profile', name: 'Profile Status', icon: '📋' },
    { id: 'auth', name: 'Auth State', icon: '🔐' },
    { id: 'admin', name: 'Admin Tools', icon: '🛡️' },
    { id: 'wellness', name: 'Wellness Data', icon: '💚' },
    { id: 'system', name: 'System Info', icon: '⚙️' }
  ];

  const renderUserData = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-sm">👤</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-sm font-medium text-gray-600">ID:</span><br/><span className="text-sm text-gray-900 font-mono">{user?.id || 'Not set'}</span></div>
            <div><span className="text-sm font-medium text-gray-600">Role:</span><br/><span className="text-sm text-gray-900">{user?.role || 'Not set'}</span></div>
          </div>
          <div><span className="text-sm font-medium text-gray-600">Email:</span><br/><span className="text-sm text-gray-900">{user?.email || 'Not set'}</span></div>
          <div><span className="text-sm font-medium text-gray-600">Username:</span><br/><span className="text-sm text-gray-900">{user?.username || 'Not set'}</span></div>
          <div><span className="text-sm font-medium text-gray-600">Full Name:</span><br/><span className="text-sm text-gray-900">{user?.fullName || 'Not set'}</span></div>
          <div><span className="text-sm font-medium text-gray-600">Email Verified:</span><br/><span className="text-sm text-gray-900">{user?.emailVerified ? '✅ Verified' : '❌ Not verified'}</span></div>
        </div>

        {/* Contact Information */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-sm">📞</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div><span className="text-sm font-medium text-gray-600">Phone:</span><br/><span className="text-sm text-gray-900">{user?.phone || 'Not provided'}</span></div>
          <div><span className="text-sm font-medium text-gray-600">Location:</span><br/><span className="text-sm text-gray-900">{user?.location || 'Not provided'}</span></div>
          <div><span className="text-sm font-medium text-gray-600">Pronouns:</span><br/><span className="text-sm text-gray-900">{user?.pronouns || 'Not specified'}</span></div>
        </div>
      </div>

      {/* Academic & Other Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-sm">🎓</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Academic Information</h4>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div><span className="text-sm font-medium text-gray-600">Institution:</span><br/><span className="text-sm text-gray-900">{user?.academicInfo?.institution || 'Not provided'}</span></div>
          <div><span className="text-sm font-medium text-gray-600">Major:</span><br/><span className="text-sm text-gray-900">{user?.academicInfo?.major || 'Not provided'}</span></div>
          <div><span className="text-sm font-medium text-gray-600">Academic Year:</span><br/><span className="text-sm text-gray-900">{user?.academicInfo?.year || 'Not provided'}</span></div>
        </div>

        {/* Additional Information */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-orange-600 text-sm">📝</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div><span className="text-sm font-medium text-gray-600">Bio:</span><br/><span className="text-sm text-gray-900">{user?.bio ? (user.bio.length > 100 ? `${user.bio.substring(0, 100)}...` : user.bio) : 'No bio provided'}</span></div>
          <div><span className="text-sm font-medium text-gray-600">Interests:</span><br/><span className="text-sm text-gray-900">{user?.interests?.length ? `${user.interests.length} interests: ${user.interests.slice(0, 3).join(', ')}${user.interests.length > 3 ? '...' : ''}` : 'No interests added'}</span></div>
          <div><span className="text-sm font-medium text-gray-600">Account Created:</span><br/><span className="text-sm text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span></div>
        </div>
      </div>
    </div>
  );

  const renderProfileStatus = () => {
    if (!user) return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-400 text-2xl">👤</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No User Data Available</h3>
        <p className="text-gray-600">Please log in to view profile status information.</p>
      </div>
    );
    
    const status = getProfileCompletionStatus(user);
    const nextStep = getNextProfileStep(user);
    const hasData = DynamicProfileService.hasUserData(user);
    
    return (
      <div className="space-y-6">
        {/* Completion Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Profile Completion</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status.isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {status.isComplete ? '✅ Complete' : '⏳ In Progress'}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-600">Progress</span>
              <span className="font-bold text-gray-900">{status.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${status.completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {nextStep && (
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Next Step</h5>
              <p className="text-sm text-gray-600">{nextStep}</p>
            </div>
          )}
        </div>

        {/* Section Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(status.sections).map(([section, completed]) => (
            <div key={section} className={`p-4 rounded-lg border-2 ${
              completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 capitalize">{section}</span>
                <span className="text-lg">{completed ? '✅' : '❌'}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {completed ? 'Completed' : 'Needs attention'}
              </p>
            </div>
          ))}
        </div>

        {/* Activity Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Activity Data</h5>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{hasData ? '✅' : '❌'}</span>
            <span className="text-sm text-gray-600">
              {hasData ? 'User has activity data' : 'No activity data yet'}
            </span>
          </div>
        </div>

        {/* Missing Fields */}
        {status.missingFields.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h5 className="font-medium text-red-900 mb-3">Missing Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {status.missingFields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <span className="text-sm text-red-700">{field}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAuthState = () => (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1">Authentication</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Authenticated:</span> <span className="text-gray-900">{isAuthenticated ? '✅' : '❌'}</span></div>
        <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Loading:</span> <span className="text-gray-900">{isLoading ? '⏳' : '✅'}</span></div>
        <div className="flex justify-between text-sm col-span-2"><span className="font-medium text-gray-600">Has Tokens:</span> <span className="text-gray-900">{tokens ? '✅' : '❌'}</span></div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <div className="text-xs font-medium text-red-800">Error:</div>
          <div className="text-xs text-red-600 truncate">{error}</div>
        </div>
      )}

      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1">Session Info</div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">User Object:</span> <span className="text-gray-900">{user ? '✅' : '❌'}</span></div>
        <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Created:</span> <span className="text-gray-900 text-xs">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></div>
        <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Last Active:</span> <span className="text-gray-900 text-xs">{user?.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</span></div>
      </div>

      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1">Storage</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">User Data:</span> <span className="text-gray-900">{localStorage.getItem('user') ? '✅' : '❌'}</span></div>
        <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Access Token:</span> <span className="text-gray-900">{localStorage.getItem('accessToken') ? '✅' : '❌'}</span></div>
        <div className="flex justify-between text-sm col-span-2"><span className="font-medium text-gray-600">Refresh Token:</span> <span className="text-gray-900">{localStorage.getItem('refreshToken') ? '✅' : '❌'}</span></div>
      </div>
    </div>
  );

  const renderWellnessData = () => {
    if (!user) return <div className="text-sm text-gray-500 text-center py-4">No user data available</div>;
    
    const wellnessData = DynamicProfileService.getUserWellnessData(user);
    const userStats = DynamicProfileService.getUserStats(user);
    const wellnessScore = DynamicProfileService.getUserWellnessScore(user);
    
    return (
      <div className="space-y-4">
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1">Wellness Metrics</div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Overall Score:</span> <span className="text-gray-900 font-semibold">{wellnessScore.toFixed(1)}/10</span></div>
          <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Trend:</span> <span className="text-gray-900">{wellnessData.trend}</span></div>
          <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Recent Entries:</span> <span className="text-gray-900">{wellnessData.recentEntries.length}</span></div>
        </div>

        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1">Activity Stats</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Posts:</span> <span className="text-gray-900">{userStats.posts}</span></div>
          <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Votes:</span> <span className="text-gray-900">{userStats.helpfulVotes}</span></div>
          <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Groups:</span> <span className="text-gray-900">{userStats.studyGroups}</span></div>
          <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Streak:</span> <span className="text-gray-900">{userStats.wellnessStreak}d</span></div>
        </div>

        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1">Settings</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Track Mood:</span> <span className="text-gray-900">{user.wellnessSettings?.trackMood ? '✅' : '❌'}</span></div>
          <div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Track Stress:</span> <span className="text-gray-900">{user.wellnessSettings?.trackStress ? '✅' : '❌'}</span></div>
          <div className="flex justify-between text-sm col-span-2"><span className="font-medium text-gray-600">Crisis Alerts:</span> <span className="text-gray-900">{user.wellnessSettings?.crisisAlertsEnabled ? '✅' : '❌'}</span></div>
        </div>
      </div>
    );
  };

  const renderSystemInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Environment Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-sm">🌍</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Environment</h4>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Node Environment</span>
            <div className="mt-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                process.env.NODE_ENV === 'production' ? 'bg-green-100 text-green-800' :
                process.env.NODE_ENV === 'development' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {process.env.NODE_ENV || 'development'}
              </span>
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Browser Information</span>
            <div className="mt-1 text-xs text-gray-900 font-mono">
              {navigator.userAgent.split(' ').slice(0, 3).join(' ')}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Current Time</span>
            <div className="mt-1 text-sm text-gray-900">
              {new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Screen Resolution</span>
            <div className="mt-1 text-sm text-gray-900">
              {window.screen.width} × {window.screen.height} pixels
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-sm">⚡</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Performance</h4>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Memory Usage</span>
            <div className="mt-1">
              {(performance as any).memory ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-900">
                    Used: {Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB
                  </div>
                  <div className="text-sm text-gray-900">
                    Total: {Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)}MB
                  </div>
                  <div className="text-sm text-gray-900">
                    Limit: {Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)}MB
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Not available</span>
              )}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Connection Type</span>
            <div className="mt-1 text-sm text-gray-900">
              {(navigator as any).connection?.effectiveType || 'Unknown'}
              {(navigator as any).connection?.downlink && (
                <span className="text-gray-600 ml-2">
                  ({(navigator as any).connection.downlink} Mbps)
                </span>
              )}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Online Status</span>
            <div className="mt-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                navigator.onLine ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Actions */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-orange-600 text-sm">🛠️</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Debug Actions</h4>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => {
              console.log('=== DEBUG: Current User ===');
              console.log(user);
              console.log('=== DEBUG: Auth State ===');
              console.log({ isAuthenticated, isLoading, error, tokens });
              console.log('=== DEBUG: LocalStorage ===');
              console.log({
                user: localStorage.getItem('user'),
                accessToken: !!localStorage.getItem('accessToken'),
                refreshToken: !!localStorage.getItem('refreshToken')
              });
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span>📋</span>
            <span>Log Debug Info to Console</span>
          </button>
          
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to clear all localStorage data? This will log you out.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <span>🗑️</span>
            <span>Clear LocalStorage & Reload</span>
          </button>
          
          <button 
            onClick={() => {
              const debugData = {
                user,
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
              };
              navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
              alert('Debug data copied to clipboard!');
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <span>📋</span>
            <span>Copy Debug Data</span>
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <span>🔄</span>
            <span>Reload Page</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Quick Stats</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Viewport:</span>
              <div className="font-mono text-xs">{window.innerWidth}×{window.innerHeight}</div>
            </div>
            <div>
              <span className="text-gray-600">Color Depth:</span>
              <div className="font-mono text-xs">{window.screen.colorDepth} bits</div>
            </div>
            <div>
              <span className="text-gray-600">Timezone:</span>
              <div className="font-mono text-xs">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
            </div>
            <div>
              <span className="text-gray-600">Language:</span>
              <div className="font-mono text-xs">{navigator.language}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user': return renderUserData();
      case 'profile': return renderProfileStatus();
      case 'auth': return renderAuthState();
      case 'admin': return <AdminAccountCreator />;
      case 'wellness': return renderWellnessData();
      case 'system': return renderSystemInfo();
      default: return renderUserData();
    }
  };

  return (
    <>
      {/* Debug Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title="Debug Information"
      >
        <span className="text-base">🐛</span>
        <span>Debug Info ({process.env.NODE_ENV || 'dev'})</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Debug Pop-up Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Debug Pop-up Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 mx-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🐛</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Debug Information</h3>
                    <p className="text-sm text-gray-600">Development Tools & System Status</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderTabContent()}
                </motion.div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Environment: <strong>{process.env.NODE_ENV || 'development'}</strong></span>
                  <span>•</span>
                  <span>Updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    🔄 Refresh
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}