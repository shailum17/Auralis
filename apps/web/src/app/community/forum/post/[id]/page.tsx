'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

interface Reply {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface PostDetail {
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
  isLiked: boolean;
}

export default function PostDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    const loadPostDetail = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock post data
      const mockPost: PostDetail = {
        id: postId,
        title: 'How to prepare for final exams effectively?',
        content: `I'm struggling with organizing my study schedule for finals. With 5 different subjects and only 3 weeks left, I feel overwhelmed. 

Here's what I'm dealing with:
- Calculus II (my weakest subject)
- Organic Chemistry 
- Physics (lots of problem sets)
- Literature (3 books to analyze)
- Psychology (mostly memorization)

I've tried making study schedules before but I always fall behind. Does anyone have strategies that actually work? Especially for balancing subjects that require different types of studying (problem-solving vs memorization)?

Any tips on staying motivated when the workload feels impossible would be really appreciated too.`,
        author: { name: 'Sarah Chen', avatar: 'SC', role: 'Student' },
        category: 'academic-help',
        tags: ['Study Tips', 'Exams', 'Time Management', 'Finals'],
        replies: 12,
        likes: 45,
        views: 234,
        createdAt: '2024-01-15T10:30:00Z',
        lastActivity: '2024-01-15T14:20:00Z',
        isPinned: true,
        isHot: true,
        isLiked: false
      };

      const mockReplies: Reply[] = [
        {
          id: '1',
          content: 'I use the Pomodoro Technique! 25 minutes focused study, 5 minute break. For your situation, I&apos;d suggest alternating between problem-solving subjects (Calc, Chem, Physics) and reading subjects (Lit, Psych) to keep your brain engaged differently.',
          author: { name: 'Alex Kumar', avatar: 'AK', role: 'Senior' },
          createdAt: '2024-01-15T11:15:00Z',
          likes: 8,
          isLiked: false
        },
        {
          id: '2',
          content: 'Create a priority matrix! Rank subjects by: 1) How much they affect your GPA, 2) How confident you feel. Focus 40% of time on weak subjects, 30% on medium, 30% on strong subjects for review.',
          author: { name: 'Maria Rodriguez', avatar: 'MR', role: 'Graduate' },
          createdAt: '2024-01-15T12:30:00Z',
          likes: 12,
          isLiked: true
        },
        {
          id: '3',
          content: 'For motivation: set small daily goals instead of thinking about the whole 3 weeks. &quot;Today I will complete 2 calculus problem sets&quot; feels much more manageable than &quot;I need to master calculus in 3 weeks&quot;.',
          author: { name: 'David Park', avatar: 'DP', role: 'Student' },
          createdAt: '2024-01-15T13:45:00Z',
          likes: 15,
          isLiked: false
        }
      ];

      setPost(mockPost);
      setReplies(mockReplies);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
    };

    if (postId) {
      loadPostDetail();
    }
  }, [postId]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newReply: Reply = {
        id: Date.now().toString(),
        content: replyContent,
        author: {
          name: user?.fullName || user?.username || 'You',
          avatar: user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'Y',
          role: user?.role || 'Student'
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };

      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
      
      // Update post reply count
      if (post) {
        setPost(prev => prev ? { ...prev, replies: prev.replies + 1 } : null);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
            <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/community/forum')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Forum
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <button 
              onClick={() => router.push('/community')}
              className="hover:text-gray-700 transition-colors"
            >
              Community
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button 
              onClick={() => router.push('/community/forum')}
              className="hover:text-gray-700 transition-colors"
            >
              Forum
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Post</span>
          </nav>

          {/* Main Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
          >
            {/* Post Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{post.author.avatar}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{post.author.role}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </div>
              
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
            </div>

            {/* Post Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {/* Post Content */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{post.content}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likes}</span>
                </button>
                <span className="flex items-center space-x-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post.replies} replies</span>
                </span>
                <span className="flex items-center space-x-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.views} views</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Reply Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Reply</h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts or provide helpful advice..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmittingReply}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  {replyContent.length}/1000 characters
                </div>
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmittingReply}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmittingReply ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            </form>
          </motion.div>

          {/* Replies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Replies ({replies.length})
            </h3>
            
            {replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">{reply.author.avatar}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{reply.author.name}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{reply.author.role}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{reply.content}</p>
                    
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{reply.likes}</span>
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}