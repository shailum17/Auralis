'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  timestamp: string;
  likes: number;
  replies: number;
  tags: string[];
  isFromUserInterest: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface PersonalizedFeedProps {
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
}

// Mock data for demonstration
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Need help with calculus derivatives - urgent!',
    content: 'I have an exam tomorrow and I\'m struggling with chain rule applications. Can someone explain the step-by-step process?',
    author: 'Sarah Chen',
    authorAvatar: 'SC',
    category: 'academic-help',
    categoryIcon: '📚',
    categoryColor: 'bg-blue-100 text-blue-700',
    timestamp: '2 hours ago',
    likes: 12,
    replies: 8,
    tags: ['Calculus', 'Math', 'Urgent'],
    isFromUserInterest: true,
    priority: 'high'
  },
  {
    id: '2',
    title: 'Software Engineering Internship at Google - AMA',
    content: 'Just finished my summer internship at Google. Happy to answer questions about the application process, interview prep, and the experience!',
    author: 'Alex Rodriguez',
    authorAvatar: 'AR',
    category: 'career-guidance',
    categoryIcon: '💼',
    categoryColor: 'bg-purple-100 text-purple-700',
    timestamp: '4 hours ago',
    likes: 45,
    replies: 23,
    tags: ['Internship', 'Google', 'Software Engineering'],
    isFromUserInterest: true,
    priority: 'high'
  },
  {
    id: '3',
    title: 'Meditation techniques for exam stress',
    content: 'Finals are coming up and I\'ve been feeling overwhelmed. What meditation or mindfulness techniques have helped you manage academic stress?',
    author: 'Emma Thompson',
    authorAvatar: 'ET',
    category: 'mental-wellness',
    categoryIcon: '🧘‍♀️',
    categoryColor: 'bg-green-100 text-green-700',
    timestamp: '6 hours ago',
    likes: 28,
    replies: 15,
    tags: ['Meditation', 'Stress', 'Finals'],
    isFromUserInterest: true,
    priority: 'medium'
  },
  {
    id: '4',
    title: 'React vs Vue.js in 2024 - Which should I learn?',
    content: 'I\'m a beginner in web development and trying to decide between React and Vue.js. What are the pros and cons of each?',
    author: 'Mike Johnson',
    authorAvatar: 'MJ',
    category: 'tech-innovation',
    categoryIcon: '💻',
    categoryColor: 'bg-indigo-100 text-indigo-700',
    timestamp: '8 hours ago',
    likes: 34,
    replies: 19,
    tags: ['React', 'Vue.js', 'Web Development'],
    isFromUserInterest: true,
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Campus gym equipment broken - alternatives?',
    content: 'The main squat rack at the campus gym has been out of order for weeks. What are some good alternatives for leg workouts?',
    author: 'David Kim',
    authorAvatar: 'DK',
    category: 'sports-fitness',
    categoryIcon: '⚽',
    categoryColor: 'bg-orange-100 text-orange-700',
    timestamp: '12 hours ago',
    likes: 16,
    replies: 11,
    tags: ['Fitness', 'Campus', 'Workout'],
    isFromUserInterest: false,
    priority: 'low'
  },
  {
    id: '6',
    title: 'Digital art commission rates - what\'s fair?',
    content: 'I\'m starting to take digital art commissions and not sure how to price my work. What do you charge for different types of artwork?',
    author: 'Luna Martinez',
    authorAvatar: 'LM',
    category: 'creative-arts',
    categoryIcon: '🎨',
    categoryColor: 'bg-pink-100 text-pink-700',
    timestamp: '1 day ago',
    likes: 22,
    replies: 13,
    tags: ['Digital Art', 'Commission', 'Pricing'],
    isFromUserInterest: false,
    priority: 'low'
  }
];

const categoryNames: Record<string, string> = {
  'academic-help': 'Academic Help',
  'career-guidance': 'Career Guidance',
  'mental-wellness': 'Mental Wellness',
  'tech-innovation': 'Tech & Innovation',
  'creative-arts': 'Creative Arts',
  'sports-fitness': 'Sports & Fitness',
  'campus-life': 'Campus Life',
  'study-groups': 'Study Groups'
};

export default function PersonalizedFeed({ selectedCategory, searchQuery, sortBy }: PersonalizedFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user interests
    const interests = localStorage.getItem('userInterests');
    if (interests) {
      setUserInterests(JSON.parse(interests));
    }
  }, []);

  useEffect(() => {
    // Filter and sort posts based on user preferences
    let filteredPosts = [...mockPosts];

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Mark posts from user interests
    filteredPosts = filteredPosts.map(post => ({
      ...post,
      isFromUserInterest: userInterests.includes(post.category)
    }));

    // Sort posts
    switch (sortBy) {
      case 'recent':
        // Keep original order (most recent first)
        break;
      case 'popular':
        filteredPosts.sort((a, b) => (b.likes + b.replies) - (a.likes + a.replies));
        break;
      case 'personalized':
        // Prioritize posts from user interests, then by engagement
        filteredPosts.sort((a, b) => {
          if (a.isFromUserInterest && !b.isFromUserInterest) return -1;
          if (!a.isFromUserInterest && b.isFromUserInterest) return 1;
          return (b.likes + b.replies) - (a.likes + a.replies);
        });
        break;
      default:
        break;
    }

    setPosts(filteredPosts);
    setLoading(false);
  }, [selectedCategory, searchQuery, sortBy, userInterests]);

  const handlePostClick = (postId: string) => {
    // Handle post click - would open post detail modal
    console.log('Open post:', postId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-600 mb-4">
          {searchQuery 
            ? `No posts match your search for "${searchQuery}"`
            : selectedCategory !== 'all'
            ? `No posts in ${categoryNames[selectedCategory] || selectedCategory}`
            : 'No posts available'
          }
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Create the first post
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalized Content Notice */}
      {userInterests.length > 0 && sortBy === 'personalized' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">✨</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Personalized for You</h4>
              <p className="text-blue-700 text-sm">
                Posts from your interests are shown first. 
                <button className="ml-1 underline hover:no-underline">
                  Manage interests
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handlePostClick(post.id)}
            className={`bg-white rounded-xl p-6 border cursor-pointer transition-all duration-200 hover:shadow-lg ${
              post.isFromUserInterest 
                ? 'border-blue-200 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Interest Badge */}
            {post.isFromUserInterest && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                    From your interests
                  </span>
                  {post.priority === 'high' && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                      Trending
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Post Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">{post.authorAvatar}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900">{post.author}</h4>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{post.timestamp}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${post.categoryColor}`}>
                    <span className="mr-1">{post.categoryIcon}</span>
                    {categoryNames[post.category]}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-600 line-clamp-3">
                {post.content}
              </p>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Post Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post.replies}</span>
                </div>
              </div>
              
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Read more →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
          Load More Posts
        </button>
      </div>
    </div>
  );
}