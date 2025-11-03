'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [personalizedForums, setPersonalizedForums] = useState<any[]>([]);

  // Check onboarding completion and load user preferences
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    checkUserPreferences();
  }, [user, router]); // checkUserPreferences is called inside useEffect

  const checkUserPreferences = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        router.push('/auth/signin');
        return;
      }

      // Allow direct access to community page without redirects
      // Users will be guided through proper flow via UI

      // Get user preferences from backend
      const response = await fetch('/api/community/preferences', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setUserPreferences(data.data);
          
          if (!data.data.hasCompletedOnboarding) {
            // First time user - show landing page first
            router.push('/community/landing');
            return;
          }

          // Load personalized feed
          await loadPersonalizedFeed(accessToken);
        } else {
          // If API fails, check localStorage as fallback
          const hasCompletedOnboarding = localStorage.getItem('communityOnboardingCompleted');
          if (!hasCompletedOnboarding) {
            router.push('/community/landing');
            return;
          }
        }
      } else {
        // If API fails, check localStorage as fallback
        const hasCompletedOnboarding = localStorage.getItem('communityOnboardingCompleted');
        if (!hasCompletedOnboarding) {
          router.push('/community/landing');
          return;
        }
      }

      setIsCheckingOnboarding(false);
    } catch (error) {
      console.error('Error checking user preferences:', error);
      
      // Fallback to localStorage check
      const hasCompletedOnboarding = localStorage.getItem('communityOnboardingCompleted');
      if (!hasCompletedOnboarding) {
        router.push('/community/landing');
        return;
      }
      
      setIsCheckingOnboarding(false);
    }
  };

  const loadPersonalizedFeed = async (accessToken: string) => {
    try {
      const response = await fetch('/api/community/personalized-feed', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPersonalizedForums(data.data.personalizedForums || []);
        }
      }
    } catch (error) {
      console.error('Error loading personalized feed:', error);
    }
  };

  // Show loading while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main community dashboard for returning users
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
                <p className="text-gray-600 mt-1">Connect, share, and learn with fellow students</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.push('/community/forum')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Go to Forum</span>
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                  Create Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Back Message */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome back, {user?.fullName || user?.username}!</h2>
                <p className="text-blue-100">Ready to explore your community forums?</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Forums</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">20,000+</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online Now</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🟢</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Forums */}
          {personalizedForums.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your Personalized Forums</h3>
                  <p className="text-gray-600 text-sm">Based on your selected interests</p>
                </div>
                <button
                  onClick={() => router.push('/community/interests')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Manage Interests
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalizedForums.map((forum, index) => (
                  <div
                    key={forum.id}
                    className={`p-4 rounded-xl border-2 ${forum.color} cursor-pointer transition-all duration-200 hover:shadow-md transform hover:scale-105`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{forum.icon}</div>
                      <h4 className="font-semibold text-gray-900 mb-1">{forum.name}</h4>
                      <p className="text-sm text-gray-600">{forum.memberCount?.toLocaleString()} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Forums */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {personalizedForums.length > 0 ? 'Explore More Forums' : 'All Forums'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Academic Help', icon: '📚', color: 'bg-blue-100 text-blue-700', members: '2.8K' },
                { name: 'Career Guidance', icon: '💼', color: 'bg-purple-100 text-purple-700', members: '1.9K' },
                { name: 'Mental Wellness', icon: '🧘‍♀️', color: 'bg-green-100 text-green-700', members: '1.6K' },
                { name: 'Tech Innovation', icon: '💻', color: 'bg-indigo-100 text-indigo-700', members: '2.1K' },
                { name: 'Creative Arts', icon: '🎨', color: 'bg-pink-100 text-pink-700', members: '987' },
                { name: 'Sports & Fitness', icon: '⚽', color: 'bg-orange-100 text-orange-700', members: '1.4K' },
                { name: 'Campus Life', icon: '🏫', color: 'bg-teal-100 text-teal-700', members: '3.2K' },
                { name: 'Study Groups', icon: '👥', color: 'bg-cyan-100 text-cyan-700', members: '1.7K' }
              ].filter(forum => !personalizedForums.some(pf => pf.name === forum.name)).map((forum, index) => (
                <div
                  key={forum.name}
                  className={`p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200 hover:shadow-md`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{forum.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-1">{forum.name}</h4>
                    <p className="text-sm text-gray-600">{forum.members} members</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>🚀</span>
              <span>Quick Actions</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/community/forum')}
                className="bg-white hover:bg-gray-50 p-4 rounded-lg border border-gray-200 transition-colors text-center"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="text-sm font-medium text-gray-900">Browse Forum</div>
              </button>
              <button className="bg-white hover:bg-gray-50 p-4 rounded-lg border border-gray-200 transition-colors text-center">
                <div className="text-2xl mb-2">✍️</div>
                <div className="text-sm font-medium text-gray-900">Create Post</div>
              </button>
              <button className="bg-white hover:bg-gray-50 p-4 rounded-lg border border-gray-200 transition-colors text-center">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm font-medium text-gray-900">Search Posts</div>
              </button>
              <button 
                onClick={() => router.push('/community/interests')}
                className="bg-white hover:bg-gray-50 p-4 rounded-lg border border-gray-200 transition-colors text-center"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm font-medium text-gray-900">Manage Interests</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}