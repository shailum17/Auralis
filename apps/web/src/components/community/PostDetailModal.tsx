'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

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

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    reputation: number;
    isOnline: boolean;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
  isHelpful: boolean;
  isSolution: boolean;
}

interface PostDetailModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
}

export default function PostDetailModal({ post, isOpen, onClose, onLike }: PostDetailModalProps) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('oldest');

  // Generate mock replies
  const generateMockReplies = (): Reply[] => {
    const replyContents = [
      "Great question! I had the same issue last semester. Here's what worked for me...",
      "I can help with this! I've been through something similar. Let me share my experience.",
      "This is a common problem. Have you tried checking the documentation?",
      "I recommend reaching out to the professor during office hours for clarification.",
      "Here's a helpful resource that might answer your question: [link]",
      "I'm dealing with the same thing right now. Let's figure this out together!",
      "Thanks for posting this! I learned something new from reading the responses.",
      "This solution worked perfectly for me. Thank you so much for sharing!",
      "I have a different approach that might be worth considering...",
      "Just wanted to add that this also applies to similar situations in..."
    ];

    return Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, i) => ({
      id: `reply-${i + 1}`,
      content: replyContents[Math.floor(Math.random() * replyContents.length)],
      author: {
        id: `user-${Math.floor(Math.random() * 100)}`,
        name: `Student ${Math.floor(Math.random() * 1000)}`,
        reputation: Math.floor(Math.random() * 500),
        isOnline: Math.random() > 0.7
      },
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 20),
      isLiked: Math.random() > 0.8,
      isHelpful: Math.random() > 0.7,
      isSolution: i === 0 && post.isSolved && Math.random() > 0.5
    }));
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate API call to load replies
      setTimeout(() => {
        const mockReplies = generateMockReplies();
        setReplies(mockReplies);
        setLoading(false);
      }, 800);
    }
  }, [isOpen, post.id]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReply.trim()) return;

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const reply: Reply = {
        id: `reply-${Date.now()}`,
        content: newReply,
        author: {
          id: user?.id || 'current-user',
          name: user?.fullName || user?.username || user?.email.split('@')[0] || 'You',
          reputation: Math.floor(Math.random() * 100),
          isOnline: true
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        isHelpful: false,
        isSolution: false
      };

      setReplies(prev => [...prev, reply]);
      setNewReply('');
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReply = (replyId: string) => {
    setReplies(prev => 
      prev.map(reply => 
        reply.id === replyId 
          ? { 
              ...reply, 
              isLiked: !reply.isLiked,
              likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
            }
          : reply
      )
    );
  };

  const sortedReplies = [...replies].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.likes - a.likes;
      case 'helpful':
        return (b.isHelpful ? 1 : 0) - (a.isHelpful ? 1 : 0);
      case 'oldest':
      default:
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      academic: 'bg-green-100 text-green-800',
      wellness: 'bg-emerald-100 text-emerald-800',
      career: 'bg-purple-100 text-purple-800',
      events: 'bg-orange-100 text-orange-800',
      housing: 'bg-red-100 text-red-800',
      marketplace: 'bg-yellow-100 text-yellow-800',
      tech: 'bg-indigo-100 text-indigo-800',
      social: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      general: '💬',
      academic: '📚',
      wellness: '💚',
      career: '💼',
      events: '🎉',
      housing: '🏠',
      marketplace: '🛒',
      tech: '💻',
      social: '👥'
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 truncate">{post.title}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(post.category)}`}>
                      {getCategoryIcon(post.category)} {post.category}
                    </span>
                    {post.isPinned && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        📌 Pinned
                      </span>
                    )}
                    {post.isSolved && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        ✅ Solved
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Original Post */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {post.author.name.charAt(0)}
                        </span>
                      </div>
                      {post.author.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">Rep: {post.author.reputation}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      
                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={onLike}
                          className={`flex items-center space-x-2 transition-colors ${
                            post.isLiked 
                              ? 'text-red-600 hover:text-red-700' 
                              : 'text-gray-500 hover:text-red-600'
                          }`}
                        >
                          <svg className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>{post.likes} likes</span>
                        </button>

                        <div className="flex items-center space-x-2 text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{replies.length} replies</span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{post.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Replies Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Replies ({replies.length})
                    </h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="oldest">Oldest first</option>
                      <option value="newest">Newest first</option>
                      <option value="popular">Most liked</option>
                      <option value="helpful">Most helpful</option>
                    </select>
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSubmitReply} className="mb-6">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {user?.fullName?.charAt(0) || user?.username?.charAt(0) || user?.email.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder="Write a reply..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          maxLength={2000}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{newReply.length}/2000 characters</span>
                          <button
                            type="submit"
                            disabled={!newReply.trim() || submitting}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            {submitting ? (
                              <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Posting...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <span>Reply</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Replies List */}
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex space-x-3 animate-pulse">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="space-y-1">
                              <div className="h-3 bg-gray-200 rounded"></div>
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : replies.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-600">No replies yet. Be the first to respond!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedReplies.map((reply, index) => (
                        <motion.div
                          key={reply.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex space-x-3 p-4 rounded-lg ${
                            reply.isSolution ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {reply.author.name.charAt(0)}
                              </span>
                            </div>
                            {reply.author.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="font-medium text-gray-900">{reply.author.name}</h5>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">Rep: {reply.author.reputation}</span>
                              {reply.isSolution && (
                                <>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                    ✅ Solution
                                  </span>
                                </>
                              )}
                              {reply.isHelpful && (
                                <>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                    👍 Helpful
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-3">{reply.content}</p>
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleLikeReply(reply.id)}
                                className={`flex items-center space-x-1 text-sm transition-colors ${
                                  reply.isLiked 
                                    ? 'text-red-600 hover:text-red-700' 
                                    : 'text-gray-500 hover:text-red-600'
                                }`}
                              >
                                <svg className={`w-4 h-4 ${reply.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>{reply.likes}</span>
                              </button>
                              <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                Reply
                              </button>
                              <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                Report
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}