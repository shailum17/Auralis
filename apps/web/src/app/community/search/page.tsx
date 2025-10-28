'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PostCard from '@/components/community/PostCard';
import PostDetailModal from '@/components/community/PostDetailModal';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
    isOnline: boolean;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: number;
  views: number;
  isLiked: boolean;
  isPinned: boolean;
  isSolved: boolean;
  lastReply?: {
    author: string;
    timestamp: string;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams?.get('q') || '';
  const category = searchParams?.get('category') || 'all';
  
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sortBy, setSortBy] = useState('relevance');

  // Generate mock search results
  const generateSearchResults = (searchQuery: string): Post[] => {
    const mockPosts = [
      {
        id: '1',
        title: 'Need help with calculus derivatives - chain rule explanation',
        content: 'I\'m struggling with understanding derivatives in my calculus class. Can someone explain the chain rule in simple terms? I have an exam coming up and this is crucial.',
        author: { id: 'user-1', name: 'Sarah Johnson', reputation: 245, isOnline: true },
        category: 'academic',
        tags: ['calculus', 'derivatives', 'math', 'help'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        replies: 8,
        views: 156,
        isLiked: false,
        isPinned: false,
        isSolved: true,
        lastReply: { author: 'Prof. Martinez', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
      },
      {
        id: '2',
        title: 'JavaScript vs Python for beginners - which to learn first?',
        content: 'I\'m new to programming and trying to decide between JavaScript and Python as my first language. What are the pros and cons of each?',
        author: { id: 'user-2', name: 'Alex Chen', reputation: 189, isOnline: false },
        category: 'tech',
        tags: ['javascript', 'python', 'programming', 'beginners'],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        likes: 23,
        replies: 15,
        views: 289,
        isLiked: true,
        isPinned: false,
        isSolved: false,
        lastReply: { author: 'DevMaster', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
      },
      {
        id: '3',
        title: 'Study group for Computer Science 101 - join us!',
        content: 'Starting a study group for CS 101. We meet twice a week to go over assignments and prepare for exams. All skill levels welcome!',
        author: { id: 'user-3', name: 'Maria Rodriguez', reputation: 334, isOnline: true },
        category: 'academic',
        tags: ['study-group', 'computer-science', 'collaboration'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        likes: 18,
        replies: 12,
        views: 203,
        isLiked: false,
        isPinned: true,
        isSolved: false,
        lastReply: { author: 'StudyBuddy', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
      }
    ];

    // Filter based on search query
    if (searchQuery) {
      return mockPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return mockPosts;
  };

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const searchResults = generateSearchResults(query);
      
      // Filter by category if specified
      let filteredResults = searchResults;
      if (category !== 'all') {
        filteredResults = searchResults.filter(post => post.category === category);
      }
      
      // Sort results
      filteredResults.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'popular':
            return b.likes - a.likes;
          case 'discussed':
            return b.replies - a.replies;
          case 'relevance':
          default:
            // Simple relevance scoring based on query matches
            const aScore = (a.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
                          (a.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0);
            const bScore = (b.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
                          (b.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0);
            return bScore - aScore;
        }
      });
      
      setResults(filteredResults);
      setLoading(false);
    };

    performSearch();
  }, [query, category, sortBy]);

  const handleLikePost = (postId: string) => {
    setResults(prevResults => 
      prevResults.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const handleViewPost = (post: Post) => {
    setResults(prevResults => 
      prevResults.map(p => 
        p.id === post.id 
          ? { ...p, views: p.views + 1 }
          : p
      )
    );
    setSelectedPost(post);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <button
              onClick={() => router.push('/community')}
              className="hover:text-blue-600 transition-colors"
            >
              Community
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Search Results</span>
          </nav>

          {/* Search Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Search Results
                  {query && (
                    <span className="text-blue-600"> for "{query}"</span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {loading ? 'Searching...' : `Found ${results.length} result${results.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="discussed">Most Discussed</option>
                </select>
              </div>
            </div>

            {/* Search Filters */}
            <div className="flex flex-wrap gap-2">
              {['all', 'academic', 'tech', 'general', 'wellness', 'career'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams || undefined);
                    params.set('category', cat);
                    router.push(`/community/search?${params.toString()}`);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    category === cat
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                {query 
                  ? `No posts match "${query}". Try different keywords or browse categories.`
                  : 'Try entering a search term to find relevant posts.'
                }
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => router.push('/community')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Browse All Posts
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set('category', 'all');
                    router.push(`/community/search?${params.toString()}`);
                  }}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PostCard
                    post={post}
                    onLike={() => handleLikePost(post.id)}
                    onView={() => handleViewPost(post)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Post Detail Modal */}
          {selectedPost && (
            <PostDetailModal
              post={selectedPost}
              isOpen={!!selectedPost}
              onClose={() => setSelectedPost(null)}
              onLike={() => handleLikePost(selectedPost.id)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}