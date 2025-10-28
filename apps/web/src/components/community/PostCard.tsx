'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ReportButton from './ReportButton';

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

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onView: () => void;
}

export default function PostCard({ post, onLike, onView }: PostCardProps) {
  const router = useRouter();
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
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {post.author.name.charAt(0)}
                </span>
              </div>
              {post.author.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => router.push(`/community/user/${post.author.id}`)}
                  className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors"
                >
                  {post.author.name}
                </button>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                {post.isPinned && (
                  <>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                      📌 Pinned
                    </span>
                  </>
                )}
                {post.isSolved && (
                  <>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      ✅ Solved
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(post.category)}`}>
                  {getCategoryIcon(post.category)} {post.category}
                </span>
                <span className="text-xs text-gray-500">Rep: {post.author.reputation}</span>
              </div>
            </div>
          </div>
          
          <ReportButton postId={post.id} postTitle={post.title} />
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 
            className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => router.push(`/community/post/${post.id}`)}
          >
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onLike}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                post.isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <svg className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes}</span>
            </motion.button>

            <button 
              onClick={onView}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.replies} replies</span>
            </button>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.views} views</span>
            </div>
          </div>

          {post.lastReply && (
            <div className="text-xs text-gray-500">
              Last reply by <span className="font-medium">{post.lastReply.author}</span>
              <br />
              {formatTimeAgo(post.lastReply.timestamp)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}