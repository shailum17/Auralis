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
  const [isExplorePopupOpen, setIsExplorePopupOpen] = useState(false);

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
        {/* Modern Header Section with Stats */}
        <div className="sticky top-0 z-50 relative bg-white overflow-hidden shadow-lg">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-8 left-12 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-4 right-16 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
              <div className="absolute bottom-6 left-1/3 w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full opacity-20 animate-pulse delay-500"></div>
            </div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Welcome Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2 space-y-1 sm:space-y-0">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Welcome back,
                    </h1>
                    <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {user?.fullName?.split(' ')[0] || user?.username}!
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm lg:text-base max-w-2xl leading-relaxed">
                    Ready to dive into discussions, share insights, and connect with your community?
                  </p>
                </div>
              </div>
              
              <div className="relative flex-shrink-0">
                {/* Explore Button with Colorful Gradient Shadow */}
                <div className="relative">
                  {/* Colorful gradient shadow behind button */}
                  <div 
                    className="absolute inset-0 z-0 rounded-2xl blur-[20px] opacity-60 pointer-events-none transform scale-110"
                    style={{
                      background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                    }}
                  />
                  
                  <button 
                    onClick={() => setIsExplorePopupOpen(!isExplorePopupOpen)}
                    className="group relative bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-3 text-base z-10"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                    <span className="bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent font-bold">Explore</span>
                  </button>
                </div>

                {/* Popup Menu */}
                {isExplorePopupOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      onClick={() => setIsExplorePopupOpen(false)}
                    ></div>
                    
                    {/* Popup Content - Card Format */}
                    <div className="fixed top-20 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-lg">Quick Actions</h3>
                        <p className="text-sm text-gray-600 mt-1">Choose what you'd like to do in the community</p>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {/* Community Stats Card */}
                        <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                          <div className="p-4">
                            <h4 className="font-bold text-gray-900 text-base mb-3 flex items-center space-x-2">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span>Community Overview</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {/* Active Forums */}
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                                  <span className="text-lg font-bold text-blue-600">8</span>
                                </div>
                                <p className="text-xs font-medium text-gray-700">Active Forums</p>
                                <div className="flex items-center space-x-1 mt-1">
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">+2 this week</span>
                                </div>
                              </div>

                              {/* Community Members */}
                              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                                  <span className="text-lg font-bold text-emerald-600">20,847</span>
                                </div>
                                <p className="text-xs font-medium text-gray-700">Members</p>
                                <div className="flex items-center space-x-1 mt-1">
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Growing</span>
                                </div>
                              </div>

                              {/* Online Now */}
                              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                                  <span className="text-lg font-bold text-purple-600">1,234</span>
                                </div>
                                <p className="text-xs font-medium text-gray-700">Online Now</p>
                                <div className="flex items-center space-x-1 mt-1">
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full animate-pulse">Live</span>
                                </div>
                              </div>

                              {/* Your Posts */}
                              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                                  <span className="text-lg font-bold text-orange-600">12</span>
                                </div>
                                <p className="text-xs font-medium text-gray-700">Your Posts</p>
                                <div className="flex items-center space-x-1 mt-1">
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">This week</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Explore Forums Card */}
                        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group cursor-pointer"
                             onClick={() => {
                               router.push('/community/forum');
                               setIsExplorePopupOpen(false);
                             }}>
                          <div className="p-5">
                            <div className="flex items-start space-x-4">
                              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">Explore Forums</h4>
                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">Browse through community discussions, discover trending topics, and join conversations that interest you.</p>
                              </div>
                              <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Create Post Card */}
                        <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg group cursor-pointer"
                             onClick={() => {
                               // Add your create post logic here
                               setIsExplorePopupOpen(false);
                             }}>
                          <div className="p-5">
                            <div className="flex items-start space-x-4">
                              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg group-hover:text-green-600 transition-colors">Create Post</h4>
                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">Start a new discussion, share your thoughts, ask questions, or contribute valuable content to the community.</p>
                              </div>
                              <svg className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="bg-gray-50 p-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 text-center">Click on any option to get started with your community experience</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>


          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


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