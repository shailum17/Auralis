'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CreatePostModal from '@/components/community/CreatePostModal';
import { useAuth } from '@/contexts/AuthContext';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  replies: number;
  likes: number;
  views: number;
  createdAt: string;
  lastActivity: string;
  isPinned?: boolean;
  isHot?: boolean;
}

export default function ForumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load forum data
  useEffect(() => {
    loadForumData();
  }, [selectedCategory, sortBy]);

  const loadForumData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockPosts: ForumPost[] = [
        {
          id: '1',
          title: 'How to prepare for final exams effectively?',
          content: 'Looking for study strategies and tips for managing multiple subjects during finals week...',
          author: { name: 'Sarah Chen', avatar: 'SC', role: 'Student' },
          category: 'academic-help',
          tags: ['Study Tips', 'Exams', 'Time Management'],
          replies: 23,
          likes: 45,
          views: 234,
          createdAt: '2024-01-15T10:30:00Z',
          lastActivity: '2024-01-15T14:20:00Z',
          isPinned: true,
          isHot: true
        },
        {
          id: '2',
          title: 'Internship opportunities in tech companies',
          content: 'Sharing some great internship programs I found for computer science students...',
          author: { name: 'Alex Kumar', avatar: 'AK', role: 'Senior' },
          category: 'career-guidance',
          tags: ['Internships', 'Tech', 'Career'],
          replies: 18,
          likes: 32,
          views: 156,
          createdAt: '2024-01-14T16:45:00Z',
          lastActivity: '2024-01-15T12:10:00Z',
          isHot: true
        },
        {
          id: '3',
          title: 'Managing stress during midterms',
          content: 'What are your go-to strategies for dealing with academic stress and anxiety?',
          author: { name: 'Emma Wilson', avatar: 'EW', role: 'Student' },
          category: 'mental-wellness',
          tags: ['Stress', 'Mental Health', 'Self Care'],
          replies: 31,
          likes: 67,
          views: 289,
          createdAt: '2024-01-14T09:15:00Z',
          lastActivity: '2024-01-15T11:30:00Z'
        },
        {
          id: '4',
          title: 'React vs Vue: Which framework to learn first?',
          content: 'I\'m new to frontend development and trying to decide between React and Vue...',
          author: { name: 'David Park', avatar: 'DP', role: 'Student' },
          category: 'tech-innovation',
          tags: ['React', 'Vue', 'Frontend', 'Web Development'],
          replies: 42,
          likes: 28,
          views: 178,
          createdAt: '2024-01-13T20:30:00Z',
          lastActivity: '2024-01-15T10:45:00Z'
        },
        {
          id: '5',
          title: 'Photography club meetup this weekend',
          content: 'Join us for a campus photography walk this Saturday at 2 PM...',
          author: { name: 'Lisa Zhang', avatar: 'LZ', role: 'Club Leader' },
          category: 'campus-life',
          tags: ['Photography', 'Club', 'Event', 'Weekend'],
          replies: 12,
          likes: 19,
          views: 87,
          createdAt: '2024-01-13T14:20:00Z',
          lastActivity: '2024-01-14T16:15:00Z'
        }
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Posts', icon: '📋', count: 156 },
    { id: 'academic-help', name: 'Academic Help', icon: '📚', count: 45 },
    { id: 'career-guidance', name: 'Career Guidance', icon: '💼', count: 23 },
    { id: 'mental-wellness', name: 'Mental Wellness', icon: '🧘‍♀️', count: 18 },
    { id: 'tech-innovation', name: 'Tech & Innovation', icon: '💻', count: 34 },
    { id: 'creative-arts', name: 'Creative Arts', icon: '🎨', count: 12 },
    { id: 'sports-fitness', name: 'Sports & Fitness', icon: '⚽', count: 15 },
    { id: 'campus-life', name: 'Campus Life', icon: '🏫', count: 28 },
    { id: 'study-groups', name: 'Study Groups', icon: '👥', count: 19 }
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/community/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Collapsible Sidebar */}
        <AnimatePresence>
          <motion.div
            initial={false}
            animate={{
              width: sidebarCollapsed ? '60px' : '280px',
              opacity: 1
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-white border-r border-gray-200 shadow-sm flex-shrink-0 relative"
          >
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow z-10"
            >
              <svg
                className={`w-3 h-3 text-gray-600 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="p-4 h-full overflow-y-auto">
              {/* User Profile Section */}
              {!sidebarCollapsed && user && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.fullName?.charAt(0) || user.username?.charAt(0) || user.email.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {user.fullName || user.username || user.email.split('@')[0]}
                      </h3>
                      <p className="text-xs text-gray-500">Community Member</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-white/60 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-blue-600">12</div>
                      <div className="text-xs text-blue-600">Posts</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-purple-600">45</div>
                      <div className="text-xs text-purple-600">Likes</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Collapsed User Avatar */}
              {sidebarCollapsed && user && (
                <div className="mb-4 flex justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {user.fullName?.charAt(0) || user.username?.charAt(0) || user.email.charAt(0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
                  >
                    Categories
                  </motion.h3>
                )}

                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sidebarCollapsed ? 0 : 0.1 + index * 0.05 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center p-2 rounded-lg transition-all group ${selectedCategory === category.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    title={sidebarCollapsed ? category.name : undefined}
                  >
                    <span className="text-lg flex-shrink-0">{category.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="ml-3 font-medium text-sm truncate">{category.name}</span>
                        <span className={`ml-auto text-xs px-2 py-1 rounded-full ${selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                          }`}>
                          {category.count}
                        </span>
                      </>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Quick Actions */}
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                    >
                      <span className="text-lg">✍️</span>
                      <span className="ml-3 text-sm font-medium">Create Post</span>
                    </button>
                    <button className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700">
                      <span className="text-lg">🔖</span>
                      <span className="ml-3 text-sm font-medium">Saved Posts</span>
                    </button>
                    <button className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700">
                      <span className="text-lg">📊</span>
                      <span className="ml-3 text-sm font-medium">My Activity</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <button
                onClick={() => router.push('/community')}
                className="hover:text-gray-700 transition-colors"
              >
                Community
              </button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">Forum</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
                <p className="text-gray-600 text-sm">Connect, share, and learn together</p>
              </div>

              <div className="flex items-center space-x-3">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </form>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="discussed">Most Discussed</option>
                </select>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>New Post</span>
                </button>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/community/forum/post/${post.id}`)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Author Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">{post.author.avatar}</span>
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {post.isPinned && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                📌 Pinned
                              </span>
                            )}
                            {post.isHot && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                🔥 Hot
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <span className="font-medium">{post.author.name}</span>
                              <span>•</span>
                              <span>{post.author.role}</span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{post.replies}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>{post.likes}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>{post.views}</span>
                            </span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={loadForumData}
          selectedCategory={selectedCategory}
        />
      </div>
    </DashboardLayout>
  );
}