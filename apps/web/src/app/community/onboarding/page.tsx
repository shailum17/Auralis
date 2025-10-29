'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  memberCount: number;
  postCount: number;
  tags: string[];
  isPopular?: boolean;
}

const forumCategories: ForumCategory[] = [
  {
    id: 'academic-help',
    name: 'Academic Help',
    description: 'Get help with assignments, study tips, and academic guidance from fellow students',
    icon: '📚',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    memberCount: 2847,
    postCount: 1523,
    tags: ['Study Tips', 'Assignments', 'Exams', 'Research'],
    isPopular: true
  },
  {
    id: 'career-guidance',
    name: 'Career Guidance',
    description: 'Discuss career paths, internships, job opportunities, and professional development',
    icon: '💼',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    memberCount: 1956,
    postCount: 892,
    tags: ['Internships', 'Job Search', 'Resume', 'Networking'],
    isPopular: true
  },
  {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    description: 'Share experiences, support each other, and discuss mental health resources',
    icon: '🧘‍♀️',
    color: 'bg-green-100 text-green-700 border-green-200',
    memberCount: 1634,
    postCount: 756,
    tags: ['Self Care', 'Stress Management', 'Support', 'Resources']
  },
  {
    id: 'tech-innovation',
    name: 'Tech & Innovation',
    description: 'Explore latest technologies, coding projects, and innovative ideas',
    icon: '💻',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    memberCount: 2156,
    postCount: 1234,
    tags: ['Programming', 'AI/ML', 'Web Dev', 'Mobile Apps'],
    isPopular: true
  },
  {
    id: 'creative-arts',
    name: 'Creative Arts',
    description: 'Share your creative work, get feedback, and collaborate on artistic projects',
    icon: '🎨',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    memberCount: 987,
    postCount: 543,
    tags: ['Design', 'Photography', 'Writing', 'Music']
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    description: 'Discuss fitness routines, sports events, and healthy lifestyle tips',
    icon: '⚽',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    memberCount: 1423,
    postCount: 678,
    tags: ['Fitness', 'Sports', 'Nutrition', 'Wellness']
  },
  {
    id: 'campus-life',
    name: 'Campus Life',
    description: 'Share campus experiences, events, and connect with fellow students',
    icon: '🏫',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    memberCount: 3245,
    postCount: 2156,
    tags: ['Events', 'Clubs', 'Social', 'Campus News']
  },
  {
    id: 'study-groups',
    name: 'Study Groups',
    description: 'Form study groups, share notes, and collaborate on academic projects',
    icon: '👥',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    memberCount: 1789,
    postCount: 934,
    tags: ['Group Study', 'Notes', 'Collaboration', 'Projects']
  }
];

export default function CommunityOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Check if user has already completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('communityOnboardingCompleted');
    if (hasCompletedOnboarding) {
      router.push('/community');
    }
  }, [user, router]);

  const handleInterestToggle = (categoryId: string) => {
    setSelectedInterests(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleComplete = async () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest to continue');
      return;
    }

    setIsCompleting(true);
    
    try {
      // Save user interests (in a real app, this would be an API call)
      localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
      localStorage.setItem('communityOnboardingCompleted', 'true');
      
      // Set flag to show welcome banner
      sessionStorage.setItem('justCompletedOnboarding', 'true');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to community
      router.push('/community');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsCompleting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('communityOnboardingCompleted', 'true');
    router.push('/community');
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome to Auralis Community! 🎉</h1>
                <p className="text-gray-600 mt-2">Let's help you discover the perfect forums for your interests</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Step {currentStep} of 2
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Welcome Section */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <span className="text-4xl">🌟</span>
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Join the 20,000+ students using our platform
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Connect with fellow students, share knowledge, get help with academics, 
                  and build meaningful relationships in our vibrant community forums.
                </p>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">20,000+</div>
                    <div className="text-gray-600">Active Students</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">50,000+</div>
                    <div className="text-gray-600">Discussions</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">8</div>
                    <div className="text-gray-600">Forum Categories</div>
                  </div>
                </motion.div>
              </div>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Choose Your Interests
                </button>
                <p className="text-gray-500 mt-4">It's free and takes less than a minute!</p>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Interest Selection */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What interests you most?
                </h2>
                <p className="text-gray-600 text-lg">
                  Select the forums you'd like to join. You can always change this later.
                </p>
              </div>

              {/* Selected Count */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                  <span className="text-blue-700 font-medium">
                    {selectedInterests.length} forum{selectedInterests.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              </div>

              {/* Forum Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {forumCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedInterests.includes(category.id)
                        ? `${category.color} shadow-lg scale-105`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInterestToggle(category.id)}
                  >
                    {/* Popular Badge */}
                    {category.isPopular && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                        Popular
                      </div>
                    )}

                    {/* Selection Indicator */}
                    <div className="absolute top-4 right-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedInterests.includes(category.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedInterests.includes(category.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="text-4xl mb-4">{category.icon}</div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{category.description}</p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{category.memberCount.toLocaleString()} members</span>
                      <span>{category.postCount.toLocaleString()} posts</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {category.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {category.tags.length > 3 && (
                        <span className="text-gray-400 text-xs">+{category.tags.length - 3}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={selectedInterests.length === 0 || isCompleting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isCompleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Setting up your dashboard...</span>
                    </>
                  ) : (
                    <span>Join Selected Forums</span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Background Decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </div>
    </DashboardLayout>
  );
}