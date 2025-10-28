'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

interface PostDetailViewProps {
  post: Post;
}

export default function PostDetailView({ post }: PostDetailViewProps) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('oldest');
  const [currentPost, setCurrentPost] = useState(post);

  // Generate mock replies
  const generateMockReplies = (): Reply[] => {
    const replyContents = [
      `Great question! The chain rule is actually quite straightforward once you break it down. 

For your example f(x) = (3x² + 2x)⁵, think of it as f(x) = [g(x)]⁵ where g(x) = 3x² + 2x.

The chain rule says: d/dx[f(g(x))] = f'(g(x)) × g'(x)

So:
1. First, differentiate the outer function: d/dx[(something)⁵] = 5(something)⁴
2. Then multiply by the derivative of the inner function: g'(x) = 6x + 2

Final answer: f'(x) = 5(3x² + 2x)⁴ × (6x + 2)

Hope this helps! Let me know if you need more clarification.`,

      `I had the same struggle with chain rule! What helped me was thinking of it like peeling an onion - you work from the outside in.

Here's my step-by-step approach:
1. Identify the "layers" of your function
2. Start with the outermost layer and work inward
3. Multiply all the derivatives together

For composite functions, I always write out what each "layer" is first. It makes the process much clearer!`,

      `The chain rule becomes much easier with practice. I recommend starting with simpler examples first:

Try these practice problems:
- f(x) = (x + 1)³
- f(x) = sin(2x)
- f(x) = e^(x²)

Once you master these, more complex ones like yours will feel natural. The key is recognizing the pattern!`,

      `I'm a math tutor and I see students struggle with this all the time. The most common mistake is forgetting to multiply by the derivative of the inner function.

Remember: Chain rule = (derivative of outer) × (derivative of inner)

Your example is perfect for practicing this concept. Would you like me to walk through a few more similar problems?`,

      `This is exactly the type of problem that will be on your exam! Make sure you can do these quickly and accurately.

Pro tip: Always double-check your work by expanding the original function (if possible) and differentiating directly. The answers should match!`
    ];

    return replyContents.map((content, i) => ({
      id: `reply-${i + 1}`,
      content,
      author: {
        id: `user-${Math.floor(Math.random() * 100)}`,
        name: [
          'Alex Chen',
          'Maria Rodriguez',
          'David Kim',
          'Prof. Johnson',
          'Emily Zhang'
        ][i] || `Student ${Math.floor(Math.random() * 1000)}`,
        reputation: Math.floor(Math.random() * 500) + 100,
        isOnline: Math.random() > 0.6
      },
      createdAt: new Date(Date.now() - (i + 1) * 30 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 15) + 1,
      isLiked: Math.random() > 0.8,
      isHelpful: i < 2, // First two replies are marked as helpful
      isSolution: i === 0 // First reply is the solution
    }));
  };

  useEffect(() => {
    const loadReplies = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockReplies = generateMockReplies();
      setReplies(mockReplies);
      setLoading(false);
    };

    loadReplies();
  }, []);

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

  const handleLikePost = () => {
    setCurrentPost(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
    }));
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
      setCurrentPost(prev => ({ ...prev, replies: prev.replies + 1 }));
      setNewReply('');
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const sortedReplies = [...replies].sort((a, b) => {
    // Always show solution first if it exists
    if (a.isSolution && !b.isSolution) return -1;
    if (!a.isSolution && b.isSolution) return 1;

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

  return (
    <div className="space-y-6">
      {/* Main Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Post Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {currentPost.author.name.charAt(0)}
                  </span>
                </div>
                {currentPost.author.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{currentPost.author.name}</h4>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{formatTimeAgo(currentPost.createdAt)}</span>
                  {currentPost.isPinned && (
                    <>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        📌 Pinned
                      </span>
                    </>
                  )}
                  {currentPost.isSolved && (
                    <>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        ✅ Solved
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(currentPost.category)}`}>
                    {getCategoryIcon(currentPost.category)} {currentPost.category}
                  </span>
                  <span className="text-xs text-gray-500">Rep: {currentPost.author.reputation}</span>
                </div>
              </div>
            </div>

            <button className="text-gray-400 hover:text-gray-600 p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{currentPost.content}</p>
          </div>

          {/* Tags */}
          {currentPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {currentPost.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLikePost}
                className={`flex items-center space-x-2 transition-colors ${currentPost.isLiked
                  ? 'text-red-600 hover:text-red-700'
                  : 'text-gray-500 hover:text-red-600'
                  }`}
              >
                <svg className={`w-6 h-6 ${currentPost.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-medium">{currentPost.likes} likes</span>
              </button>

              <div className="flex items-center space-x-2 text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium">{currentPost.replies} replies</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">{currentPost.views} views</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
              <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Replies Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Replies ({replies.length})
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="oldest">Oldest first</option>
              <option value="newest">Newest first</option>
              <option value="popular">Most liked</option>
              <option value="helpful">Most helpful</option>
            </select>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSubmitReply} className="mb-6">
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || user?.email.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a helpful reply..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={2000}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">{newReply.length}/2000 characters</span>
                  <button
                    type="submit"
                    disabled={!newReply.trim() || submitting}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
                        <span>Post Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Replies List */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex space-x-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No replies yet</h3>
              <p className="text-gray-600">Be the first to help answer this question!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedReplies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex space-x-4 p-6 rounded-lg ${reply.isSolution
                    ? 'bg-green-50 border-2 border-green-200'
                    : reply.isHelpful
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
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
                    <div className="flex items-center space-x-2 mb-3">
                      <h4 className="font-medium text-gray-900">{reply.author.name}</h4>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">Rep: {reply.author.reputation}</span>
                      {reply.isSolution && (
                        <>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            ✅ Accepted Solution
                          </span>
                        </>
                      )}
                      {reply.isHelpful && !reply.isSolution && (
                        <>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            👍 Helpful
                          </span>
                        </>
                      )}
                    </div>
                    <div className="prose max-w-none mb-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLikeReply(reply.id)}
                        className={`flex items-center space-x-2 transition-colors ${reply.isLiked
                          ? 'text-red-600 hover:text-red-700'
                          : 'text-gray-500 hover:text-red-600'
                          }`}
                      >
                        <svg className={`w-5 h-5 ${reply.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{reply.likes}</span>
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 transition-colors">
                        Reply
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 transition-colors">
                        Share
                      </button>
                      {!reply.isSolution && (
                        <button className="text-green-600 hover:text-green-700 transition-colors">
                          Mark as Solution
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}