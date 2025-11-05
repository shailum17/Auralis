'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [personalizedForums, setPersonalizedForums] = useState<any[]>([]);

  // Check onboarding completion and load user preferences
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    checkUserPreferences();
  }, [user, router]);

  const checkUserPreferences = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        router.push('/auth/signin');
        return;
      }

      // Get user preferences from backend
      const response = await fetch('/api/community/preferences', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          if (!data.data.hasCompletedOnboarding) {
            router.push('/community/landing');
            return;
          }
          await loadPersonalizedFeed(accessToken);
        } else {
          const hasCompletedOnboarding = localStorage.getItem('communityOnboardingCompleted');
          if (!hasCompletedOnboarding) {
            router.push('/community/landing');
            return;
          }
        }
      } else {
        const hasCompletedOnboarding = localStorage.getItem('communityOnboardingCompleted');
        if (!hasCompletedOnboarding) {
          router.push('/community/landing');
          return;
        }
      }

      setIsCheckingOnboarding(false);
    } catch (error) {
      console.error('Error checking user preferences:', error);
      
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your community dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main community dashboard for returning users
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Modern Header Section */}
        <div className="relative bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-100 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-8 left-12 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-4 right-16 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
              <div className="absolute bottom-6 left-1/3 w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full opacity-20 animate-pulse delay-500"></div>
            </div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start space-x-4 mb-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <span className="text-2xl">👋</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        Welcome back,
                      </h1>
                      <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {user?.fullName?.split(' ')[0] || user?.username}!
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm lg:text-base max-w-2xl">
                      🌟 Ready to dive into discussions, share insights, and connect with your community?
                    </p>
                  </div>
                </div>
                
                {/* Quick Stats Bar */}
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">1,234 online</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-600">47 new posts today</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-600">8 active forums</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => router.push('/community/forum')}
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <svg className="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="relative">Explore Forums</span>
                </button>
                
                <button className="group relative bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Post</span>
                </button>
                
                <button className="group relative bg-white/60 backdrop-blur-sm border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700 hover:bg-white/80 p-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zM12 12h.01" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Forums */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 text-sm font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>+2 this week</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">8</h3>
                  <p className="text-gray-800 font-semibold text-lg">Active Forums</p>
                  <p className="text-sm text-gray-600">Forums you participate in</p>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-4/5 transition-all duration-1000"></div>
                </div>
              </div>
            </div>

            {/* Total Members */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <span className="text-xs">📈</span>
                    <span>Growing</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">20,847</h3>
                  <p className="text-gray-800 font-semibold text-lg">Community Members</p>
                  <p className="text-sm text-gray-600">Total registered users</p>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full w-full transition-all duration-1000"></div>
                </div>
              </div>
            </div>

            {/* Online Now */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <div className="relative">
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-300 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-purple-600 text-sm font-semibold bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span>Live</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">1,234</h3>
                  <p className="text-gray-800 font-semibold text-lg">Online Now</p>
                  <p className="text-sm text-gray-600">Active community members</p>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-3/5 transition-all duration-1000 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Your Activity */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-1 text-orange-600 text-sm font-semibold bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                    <span className="text-xs">⚡</span>
                    <span>This week</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">12</h3>
                  <p className="text-gray-800 font-semibold text-lg">Your Posts</p>
                  <p className="text-sm text-gray-600">Posts and comments</p>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full w-2/3 transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Activity & Forums */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Activity Feed */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { user: 'Sarah Chen', action: 'posted in', forum: 'Academic Help', time: '2 hours ago', avatar: '👩‍🎓' },
                    { user: 'Mike Johnson', action: 'commented on', forum: 'Tech Innovation', time: '4 hours ago', avatar: '👨‍💻' },
                    { user: 'Emma Davis', action: 'started a discussion in', forum: 'Mental Wellness', time: '6 hours ago', avatar: '👩‍⚕️' },
                    { user: 'Alex Rodriguez', action: 'shared resources in', forum: 'Career Guidance', time: '8 hours ago', avatar: '👨‍💼' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="text-2xl">{activity.avatar}</div>
                      <div className="flex-1">
                        <p className="text-gray-900">
                          <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-semibold text-blue-600">{activity.forum}</span>
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Forums */}
              {personalizedForums.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Your Forums</h3>
                        <p className="text-gray-600 text-sm">Based on your interests</p>
                      </div>
                      <button
                        onClick={() => router.push('/community/interests')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {personalizedForums.map((forum) => (
                        <div
                          key={forum.id}
                          className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{forum.icon}</div>
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">{forum.name}</h4>
                              <p className="text-sm text-gray-600">{forum.memberCount?.toLocaleString()} members</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* All Forums */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900">Explore All Forums</h3>
                  <p className="text-gray-600 text-sm">Discover new communities and topics</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Academic Help', icon: '📚', members: '2.8K', description: 'Get help with studies' },
                      { name: 'Career Guidance', icon: '💼', members: '1.9K', description: 'Professional development' },
                      { name: 'Mental Wellness', icon: '🧘‍♀️', members: '1.6K', description: 'Mental health support' },
                      { name: 'Tech Innovation', icon: '💻', members: '2.1K', description: 'Latest in technology' },
                      { name: 'Creative Arts', icon: '🎨', members: '987', description: 'Artistic expression' },
                      { name: 'Sports & Fitness', icon: '⚽', members: '1.4K', description: 'Health and fitness' },
                    ].filter(forum => !personalizedForums.some(pf => pf.name === forum.name)).map((forum) => (
                      <div
                        key={forum.name}
                        className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{forum.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">{forum.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{forum.description}</p>
                            <p className="text-xs text-gray-500">{forum.members} members</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden sticky top-8">
                <div className="relative p-6 border-b border-gray-100/50">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <button 
                    onClick={() => router.push('/community/forum')}
                    className="group w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl p-4 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm">💬</span>
                      </div>
                      <span>Browse Forums</span>
                    </div>
                  </button>
                  
                  <button className="group w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl p-4 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm">✍️</span>
                      </div>
                      <span>Create Post</span>
                    </div>
                  </button>
                  
                  <button className="group w-full relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl p-4 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm">🔍</span>
                      </div>
                      <span>Search Posts</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/community/interests')}
                    className="group w-full relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl p-4 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm">⚙️</span>
                      </div>
                      <span>Settings</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="relative p-6 border-b border-gray-100/50">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🔥</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Trending Now</h3>
                    </div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { topic: 'Study Tips for Finals', posts: 24, trend: 'up', emoji: '📚' },
                    { topic: 'Remote Work Best Practices', posts: 18, trend: 'up', emoji: '💻' },
                    { topic: 'Mental Health Resources', posts: 15, trend: 'stable', emoji: '🧘‍♀️' },
                    { topic: 'Career Fair Preparation', posts: 12, trend: 'up', emoji: '💼' },
                  ].map((item, index) => (
                    <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <span className="text-lg">{item.emoji}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{item.topic}</p>
                          <p className="text-xs text-gray-500">{item.posts} posts</p>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                        item.trend === 'up' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span>{item.trend === 'up' ? '📈' : '➡️'}</span>
                        <span>{item.trend === 'up' ? 'Hot' : 'Stable'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Insights */}
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 border border-indigo-100/50 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">💡</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Community Insights</h3>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                    <span className="text-sm font-medium text-gray-700">Most Active Hour</span>
                    <span className="text-sm font-bold text-indigo-600">2-3 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                    <span className="text-sm font-medium text-gray-700">Popular Category</span>
                    <span className="text-sm font-bold text-purple-600">Tech Innovation</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                    <span className="text-sm font-medium text-gray-700">Weekly Growth</span>
                    <span className="text-sm font-bold text-green-600">+12.5%</span>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  View Full Analytics
                </button>
              </div>

              {/* Community Guidelines */}
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-3xl p-6 border border-amber-100/50 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">📋</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Community Guidelines</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Help us maintain a positive, inclusive, and supportive environment for all community members.
                </p>
                <div className="flex items-center space-x-2">
                  <button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm">
                    Read Guidelines
                  </button>
                  <button className="bg-white/60 backdrop-blur-sm border border-amber-200 text-amber-700 hover:bg-amber-50 p-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}