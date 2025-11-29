'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getIconSvg } from '@/lib/icon-utils';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  forumId: string;
  forumName: string;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
}

interface Forum {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  isJoined?: boolean;
}

interface InterestedCommunity {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  category: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isExplorePopupOpen, setIsExplorePopupOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'forums' | 'interested'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [forums, setForums] = useState<Forum[]>([]);
  const [interestedCommunities, setInterestedCommunities] = useState<InterestedCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    forumId: '',
  });

  // Check onboarding completion
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

      const response = await fetch('/api/v1/community/preferences', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && !data.data.hasCompletedOnboarding) {
          router.push('/community/landing');
          return;
        }
      }

      setIsCheckingOnboarding(false);
      loadCommunityData(accessToken);
    } catch (error) {
      console.error('Error checking user preferences:', error);
      setIsCheckingOnboarding(false);
    }
  };

  const loadCommunityData = async (accessToken: string) => {
    try {
      setLoading(true);
      
      // Load forums
      console.log('Loading forums...');
      const forumsResponse = await fetch('/api/v1/community/forums', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('Forums response status:', forumsResponse.status);
      
      if (forumsResponse.ok) {
        const forumsData = await forumsResponse.json();
        console.log('✅ Forums API Response:', forumsData);
        console.log('📊 Forums data structure:', {
          success: forumsData.success,
          hasData: !!forumsData.data,
          hasForums: !!forumsData.data?.forums,
          forumsCount: forumsData.data?.forums?.length || 0
        });
        
        if (forumsData.success && forumsData.data && forumsData.data.forums) {
          console.log('✅ Setting forums:', forumsData.data.forums.length, 'forums');
          console.log('📋 Forums list:', forumsData.data.forums.map((f: any) => ({ id: f.id, name: f.name })));
          setForums(forumsData.data.forums);
        } else {
          console.warn('⚠️ Forums data structure unexpected:', forumsData);
          console.warn('⚠️ Setting empty forums array');
          setForums([]);
        }
      } else {
        const errorText = await forumsResponse.text();
        console.error('❌ Forums response not ok:', forumsResponse.status, errorText);
        console.error('❌ Setting empty forums array');
        setForums([]);
      }

      // Load posts
      console.log('Loading posts...');
      const postsResponse = await fetch('/api/v1/community/posts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('Posts response status:', postsResponse.status);
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        console.log('Posts data:', postsData);
        
        if (postsData.success && postsData.data && postsData.data.posts) {
          console.log('Setting posts:', postsData.data.posts.length);
          setPosts(postsData.data.posts);
        } else {
          console.warn('Posts data structure unexpected:', postsData);
          setPosts([]);
        }
      } else {
        console.error('Posts response not ok:', await postsResponse.text());
        setPosts([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading community data:', error);
      setForums([]);
      setPosts([]);
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.forumId) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPosts([data.data.post, ...posts]);
          setNewPost({ title: '', content: '', forumId: '' });
          setIsCreatePostOpen(false);
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
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
                    
                    <div className="fixed top-20 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto">
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
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                                  <span className="text-lg font-bold text-blue-600">{forums.length}</span>
                                </div>
                                <p className="text-xs font-medium text-gray-700">Active Forums</p>
                              </div>

                              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                  <span className="text-lg font-bold text-purple-600">{posts.length}</span>
                                </div>
                                <p className="text-xs font-medium text-gray-700">Total Posts</p>
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
                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">Browse through community discussions and discover trending topics.</p>
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
                               setIsCreatePostOpen(true);
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
                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">Start a new discussion and share your thoughts with the community.</p>
                              </div>
                              <svg className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs Navigation */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All Community
              </button>
              <button
                onClick={() => setActiveTab('forums')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'forums'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Forums
              </button>
              <button
                onClick={() => setActiveTab('interested')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'interested'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                My Interests
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Posts Feed */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'all' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Community Feed</h3>
                    <p className="text-sm text-gray-600 mt-1">Latest discussions from all forums</p>
                  </div>
                
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-600 mb-4">No posts yet. Be the first to start a discussion!</p>
                    <button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create First Post
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {posts.map((post) => (
                      <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-medium text-sm">{getUserInitials(post.userName)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-gray-900">{post.userName}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{getTimeAgo(post.createdAt)}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{post.forumName}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg mb-2">{post.title}</h4>
                            <p className="text-gray-600 text-sm line-clamp-3">{post.content}</p>
                            <div className="flex items-center space-x-6 mt-4">
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-sm font-medium">{post.likes}</span>
                              </button>
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-sm font-medium">{post.comments}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              )}

              {/* Forums Tab */}
              {activeTab === 'forums' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">All Forums</h3>
                        <p className="text-sm text-gray-600 mt-1">Browse and join community forums</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {forums.length} forum{forums.length !== 1 ? 's' : ''} available
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading forums...</p>
                      </div>
                    ) : forums.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-gray-600 font-medium mb-2">No forums available</p>
                        <p className="text-sm text-gray-500">Check the browser console for API errors</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {forums.map((forum) => (
                          <div
                            key={forum.id}
                            onClick={() => router.push(`/community/forum/${forum.id}`)}
                            className="group p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="relative w-12 h-12 flex items-center justify-center">
                                <div 
                                  className="absolute -inset-4 rounded-full blur-[20px] opacity-0 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"
                                  style={{
                                    background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                                  }}
                                />
                                <div className="relative z-10 text-gray-700">
                                  {getIconSvg(forum.icon, "w-10 h-10")}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 mb-1">{forum.name}</h4>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{forum.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">{forum.memberCount} members</span>
                                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                                    View Forum
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* My Interests Tab */}
              {activeTab === 'interested' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">My Interested Communities</h3>
                    <p className="text-sm text-gray-600 mt-1">Forums and communities you follow</p>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your interests...</p>
                      </div>
                    ) : forums.filter(f => f.isJoined).length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No interests yet</h4>
                        <p className="text-gray-600 mb-4">Start exploring forums and join communities that interest you</p>
                        <button
                          onClick={() => setActiveTab('forums')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Explore Forums
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {forums.filter(f => f.isJoined).map((forum) => (
                          <div
                            key={forum.id}
                            onClick={() => router.push(`/community/forum/${forum.id}`)}
                            className="group p-5 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-white"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="relative w-12 h-12 flex items-center justify-center">
                                <div 
                                  className="absolute -inset-4 rounded-full blur-[20px] opacity-0 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"
                                  style={{
                                    background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                                  }}
                                />
                                <div className="relative z-10 text-gray-700">
                                  {getIconSvg(forum.icon, "w-10 h-10")}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-bold text-gray-900">{forum.name}</h4>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Joined</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{forum.description}</p>
                                <span className="text-xs text-gray-500">{forum.memberCount} members</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Forums List */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Forums</h3>
                </div>
                <div className="p-4 space-y-2">
                  {forums.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No forums available</p>
                  ) : (
                    forums.map((forum) => (
                      <div
                        key={forum.id}
                        className="group p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative w-8 h-8 flex items-center justify-center">
                            <div 
                              className="absolute -inset-3 rounded-full blur-[20px] opacity-0 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"
                              style={{
                                background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                              }}
                            />
                            <div className="relative z-10 text-gray-700">
                              {getIconSvg(forum.icon, "w-6 h-6")}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{forum.name}</p>
                            <p className="text-xs text-gray-500">{forum.memberCount} members</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {isCreatePostOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsCreatePostOpen(false)}
            ></div>
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Create New Post</h3>
                    <button
                      onClick={() => setIsCreatePostOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Forum</label>
                    <select
                      value={newPost.forumId}
                      onChange={(e) => setNewPost({ ...newPost, forumId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a forum</option>
                      {forums.map((forum) => (
                        <option key={forum.id} value={forum.id}>
                          {forum.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="What's your post about?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Share your thoughts..."
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      onClick={handleCreatePost}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Publish Post
                    </button>
                    <button
                      onClick={() => setIsCreatePostOpen(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
