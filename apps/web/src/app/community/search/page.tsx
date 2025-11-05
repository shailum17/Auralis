'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
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
  isLiked: boolean;
  isPinned: boolean;
  isSolved: boolean;
}

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const category = searchParams?.get('category') || 'all';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');

  // Generate mock search results
  const generateSearchResults = (searchQuery: string): SearchResult[] => {
    const mockPosts: SearchResult[] = [
      {
        id: '1',
        title: 'Need help with calculus derivatives - chain rule explanation',
        content: 'I&apos;m struggling with understanding derivatives in my calculus class. Can someone explain the chain rule in simple terms? I have an exam coming up and this is crucial.',
        author: { name: 'Sarah Johnson', avatar: 'SJ', role: 'Student' },
        category: 'academic',
        tags: ['calculus', 'derivatives', 'math', 'help'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        replies: 8,
        views: 156,
        isLiked: false,
        isPinned: false,
        isSolved: true
      },
      {
        id: '2',
        title: 'JavaScript vs Python for beginners - which to learn first?',
        content: 'I&apos;m new to programming and trying to decide between JavaScript and Python as my first language. What are the pros and cons of each?',
        author: { name: 'Alex Chen', avatar: 'AC', role: 'Student' },
        category: 'tech',
        tags: ['javascript', 'python', 'programming', 'beginners'],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        likes: 23,
        replies: 15,
        views: 289,
        isLiked: true,
        isPinned: false,
        isSolved: false
      },
      {
        id: '3',
        title: 'Study group for Computer Science 101 - join us!',
        content: 'Starting a study group for CS 101. We meet twice a week to go over assignments and prepare for exams. All skill levels welcome!',
        author: { name: 'Maria Rodriguez', avatar: 'MR', role: 'Student' },
        category: 'academic',
        tags: ['study-group', 'computer-science', 'collaboration'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 18,
        replies: 12,
        views: 203,
        isLiked: false,
        isPinned: true,
        isSolved: false
      }
    ];

    // Filter based on search query
    if (query) {
      return mockPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
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

  const handleViewPost = (post: SearchResult) => {
    setResults(prevResults => 
      prevResults.map(p => 
        p.id === post.id 
          ? { ...p, views: p.views + 1 }
          : p
      )
    );
    // Navigate to post detail page
    router.push(`/community/forum/post/${post.id}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)' }}>
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
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 animate-pulse border border-white/20" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)' }}>
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
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 text-center border border-white/20" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)' }}>
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
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/90 transition-all duration-300 cursor-pointer"
                  style={{ 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)';
                  }}
                  onClick={() => handleViewPost(post)}
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
                          {post.isSolved && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              ✅ Solved
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikePost(post.id);
                            }}
                            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                              post.isLiked ? 'text-red-500' : ''
                            }`}
                          >
                            <svg className="w-4 h-4" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{post.likes}</span>
                          </button>
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
    </DashboardLayout>
  );
}