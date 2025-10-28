'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PostDetailView from '@/components/community/PostDetailView';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!params?.id) return;
      
      setLoading(true);
      
      // Simulate API call to load post
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock post data - in real app, this would fetch from API
      const mockPost = {
        id: params?.id as string,
        title: 'Need help with calculus homework - derivatives',
        content: `I'm struggling with understanding derivatives in my calculus class. Can someone explain the chain rule in simple terms?

I understand the basic concept of derivatives as rates of change, but when it comes to composite functions, I get confused about which function to differentiate first and how to apply the chain rule properly.

For example, if I have f(x) = (3x² + 2x)⁵, I know I need to use the chain rule, but I'm not sure about the step-by-step process.

Any help would be greatly appreciated! I have an exam coming up next week and this is one of the topics I'm struggling with the most.`,
        author: {
          id: 'user-123',
          name: 'Sarah Johnson',
          reputation: 245,
          isOnline: true
        },
        category: 'academic',
        tags: ['calculus', 'derivatives', 'chain-rule', 'help'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        replies: 8,
        views: 156,
        isLiked: false,
        isPinned: false,
        isSolved: false
      };
      
      setPost(mockPost);
      setLoading(false);
    };

    loadPost();
  }, [params?.id]);

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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.4a7.962 7.962 0 01-5.657-2.109L6 21l.343-3.657A7.962 7.962 0 014 12a8 8 0 018-8 8 8 0 018 8 7.962 7.962 0 01-2.343 5.657L21 21l-3.657-.343z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Post not found</h3>
            <p className="text-gray-600 mb-4">The post you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push('/community')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Community
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
            <span className="text-gray-900 font-medium truncate">{post.title}</span>
          </nav>

          <PostDetailView post={post} />
        </div>
      </div>
    </DashboardLayout>
  );
}