'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WellnessOverview from '@/components/dashboard/WellnessOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';
import CommunityFeed from '@/components/dashboard/CommunityFeed';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import WellnessInsights from '@/components/dashboard/WellnessInsights';
import MoodTrackerModal from '@/components/wellness/MoodTrackerModal';
import StressTrackerModal from '@/components/wellness/StressTrackerModal';

export default function Dashboard() {
  // Use actual auth context
  const { user } = useAuth();
  const router = useRouter();
  const [isExplorePopupOpen, setIsExplorePopupOpen] = useState(false);
  const [communityStats, setCommunityStats] = useState({ forums: 0, posts: 0 });
  const [loading, setLoading] = useState(true);

  // Load real-time community stats
  useEffect(() => {
    const loadCommunityStats = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        // Load forums count
        const forumsResponse = await fetch('/api/community/forums', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        
        // Load posts count
        const postsResponse = await fetch('/api/community/posts', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (forumsResponse.ok && postsResponse.ok) {
          const forumsData = await forumsResponse.json();
          const postsData = await postsResponse.json();
          
          setCommunityStats({
            forums: forumsData.data?.forums?.length || 0,
            posts: postsData.data?.posts?.length || 0,
          });
        }
      } catch (error) {
        console.error('Error loading community stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCommunityStats();
    }
  }, [user]);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showStressModal, setShowStressModal] = useState(false);

  // Navigation handlers
  const handleLogMood = () => {
    setIsExplorePopupOpen(false);
    setShowMoodModal(true);
  };

  const handleTrackStress = () => {
    setIsExplorePopupOpen(false);
    setShowStressModal(true);
  };

  const handleFindStudyGroup = () => {
    setIsExplorePopupOpen(false);
    router.push('/community/study-groups');
  };

  const handleGetSupport = () => {
    setIsExplorePopupOpen(false);
    router.push('/resources/support');
  };

  const handleAnonymousPost = () => {
    setIsExplorePopupOpen(false);
    router.push('/community/new-post?anonymous=true');
  };

  const handleExploreForums = () => {
    setIsExplorePopupOpen(false);
    router.push('/community/forum');
  };

  const handleCreatePost = () => {
    setIsExplorePopupOpen(false);
    router.push('/community/new-post');
  };

  // Get display name from user data
  const getDisplayName = () => {
    if (!user) return 'User';
    return user.fullName || 'User';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Dashboard Header - Matching Community Page Style */}
        <div className="sticky top-0 z-50 bg-white overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-8 left-12 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-4 right-16 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
              <div className="absolute bottom-6 left-1/3 w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full opacity-20 animate-pulse delay-500"></div>
            </div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2 space-y-1 sm:space-y-0">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                      {getGreeting()},
                    </h1>
                    <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {getDisplayName()}!
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm lg:text-base max-w-2xl leading-relaxed">
                    Here&apos;s what&apos;s happening in your community today
                  </p>
                </div>
              </div>
              
              <div className="relative flex-shrink-0">
                <div className="relative">
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

                {/* Explore Popup */}
                {isExplorePopupOpen && (
                  <>
                    <div 
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      onClick={() => setIsExplorePopupOpen(false)}
                    ></div>
                    
                    <div className="fixed top-20 right-4 w-[380px] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl shadow-2xl border border-white/60 backdrop-blur-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto">
                      {/* Header with gradient background */}
                      <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                        <div className="relative p-5 text-white">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-bold text-xl">Quick Actions</h3>
                            <button 
                              onClick={() => setIsExplorePopupOpen(false)}
                              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm text-white/90">Explore wellness and community features</p>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        {/* Compact Action Cards */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Log Mood - Pink */}
                          <button 
                            onClick={handleLogMood}
                            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-pink-200/50 hover:border-pink-300 rounded-xl p-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center space-x-2.5">
                              <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </div>
                              <div className="text-left min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900">Log Mood</h4>
                              </div>
                            </div>
                          </button>

                          {/* Track Stress - Yellow */}
                          <button 
                            onClick={handleTrackStress}
                            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-yellow-200/50 hover:border-yellow-300 rounded-xl p-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-0.5"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center space-x-2.5">
                              <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <div className="text-left min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900">Track Stress</h4>
                              </div>
                            </div>
                          </button>

                          {/* Get Support - Green */}
                          <button 
                            onClick={handleGetSupport}
                            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-green-200/50 hover:border-green-300 rounded-xl p-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center space-x-2.5">
                              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              </div>
                              <div className="text-left min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900">Get Support</h4>
                              </div>
                            </div>
                          </button>

                          {/* Anonymous Post - Purple */}
                          <button 
                            onClick={handleAnonymousPost}
                            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-purple-200/50 hover:border-purple-300 rounded-xl p-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center space-x-2.5">
                              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </div>
                              <div className="text-left min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900">Anonymous</h4>
                              </div>
                            </div>
                          </button>
                        </div>

                        {/* Compact Community Stats Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 shadow-lg">
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                          <div className="relative">
                            <div className="flex items-center space-x-2 mb-3 text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <h4 className="font-semibold text-sm">Community Stats</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                                <div className="text-2xl font-bold text-white mb-0.5">
                                  {loading ? '...' : communityStats.forums}
                                </div>
                                <p className="text-xs font-medium text-white/90">Forums</p>
                              </div>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                                <div className="text-2xl font-bold text-white mb-0.5">
                                  {loading ? '...' : communityStats.posts}
                                </div>
                                <p className="text-xs font-medium text-white/90">Posts</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Cards Row */}
                        <div className="space-y-3">
                          {/* Explore Forums Card */}
                          <button 
                            onClick={handleExploreForums}
                            className="group relative w-full overflow-hidden bg-white/80 backdrop-blur-sm border border-blue-200/50 hover:border-blue-400 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 text-left"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center space-x-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Explore Forums</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">Browse discussions and trending topics</p>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>

                          {/* Create Post Card */}
                          <button 
                            onClick={handleCreatePost}
                            className="group relative w-full overflow-hidden bg-white/80 backdrop-blur-sm border border-green-200/50 hover:border-green-400 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-0.5 text-left"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center space-x-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">Create Post</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">Share your thoughts with the community</p>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Wellness Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <WellnessOverview />
              </motion.div>

              {/* Community Feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <CommunityFeed />
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <RecentActivity />
              </motion.div>

            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Wellness Insights */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <WellnessInsights />
              </motion.div>

              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <UpcomingEvents />
              </motion.div>

            </div>
          </div>
        </div>

      </div>

      {/* Mood Tracker Modal */}
      <MoodTrackerModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSave={() => {
          // Reload dashboard data after saving
          window.location.reload();
        }}
      />

      {/* Stress Tracker Modal */}
      <StressTrackerModal
        isOpen={showStressModal}
        onClose={() => setShowStressModal(false)}
        onSave={() => {
          // Reload dashboard data after saving
          window.location.reload();
        }}
      />
    </DashboardLayout>
  );
}