'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import PostCard from '@/components/community/PostCard';
import PostDetailModal from '@/components/community/PostDetailModal';
import { CommunityService, CommunityPost } from '@/lib/community-service';

interface PostWithAuthor extends Omit<CommunityPost, 'lastReply'> {
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
    isOnline: boolean;
  };
  lastReply?: {
    author: string;
    timestamp: string;
  };
}

interface PostListProps {
  category: string;
  sortBy: string;
  searchQuery: string;
  refreshTrigger?: number;
}

export default function PostList({ category, sortBy, searchQuery, refreshTrigger }: PostListProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Convert community posts to posts with author info
  const enrichPostsWithAuthorInfo = (communityPosts: CommunityPost[]): PostWithAuthor[] => {
    return communityPosts.map(post => {
      const authorInfo = CommunityService.getAuthorInfo(post.authorId, post.isAnonymous);
      return {
        ...post,
        author: authorInfo,
        lastReply: post.lastReply ? {
          author: CommunityService.getAuthorInfo(post.lastReply.authorId, false).name,
          timestamp: post.lastReply.timestamp
        } : undefined
      };
    });
  };

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Get posts from community service
        const communityPosts = CommunityService.getPosts(
          category,
          sortBy,
          searchQuery,
          user?.id,
          20,
          0
        );
        
        // Enrich with author information
        const enrichedPosts = enrichPostsWithAuthorInfo(communityPosts);
        
        setPosts(enrichedPosts);
        setHasMore(enrichedPosts.length >= 20); // Has more if we got a full page
      } catch (error) {
        console.error('Error loading posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
        setPage(1);
      }
    };

    loadPosts();
  }, [category, sortBy, searchQuery, user?.id, refreshTrigger]);

  const handleLikePost = (postId: string) => {
    if (!user) return;
    
    const isLiked = CommunityService.togglePostLike(postId, user.id);
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked,
              likes: isLiked ? post.likes + 1 : post.likes - 1
            }
          : post
      )
    );
  };

  const handleViewPost = (post: PostWithAuthor) => {
    // View count is handled by CommunityService.getPost()
    setSelectedPost(post);
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    try {
      // Get more posts from community service
      const moreCommunityPosts = CommunityService.getPosts(
        category,
        sortBy,
        searchQuery,
        user?.id,
        10,
        posts.length
      );
      
      // Enrich with author information
      const enrichedMorePosts = enrichPostsWithAuthorInfo(moreCommunityPosts);
      
      setPosts(prev => [...prev, ...enrichedMorePosts]);
      setPage(prev => prev + 1);
      
      // Check if there are more posts
      if (enrichedMorePosts.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
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
                <div className="flex space-x-4">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-600 mb-4">
          {searchQuery 
            ? `No posts match "${searchQuery}". Try different keywords.`
            : category !== 'all' 
              ? `No posts in this category yet. Be the first to start a discussion!`
              : 'No posts available. Start the conversation!'
          }
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Create First Post
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <PostCard
              post={post}
              onLike={() => handleLikePost(post.id)}
              onView={() => handleViewPost(post)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center py-6">
          <button
            onClick={loadMorePosts}
            disabled={loading}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading more posts...</span>
              </div>
            ) : (
              'Load More Posts'
            )}
          </button>
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
  );
}