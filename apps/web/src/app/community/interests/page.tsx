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
}

const forumCategories: ForumCategory[] = [
  {
    id: 'academic-help',
    name: 'Academic Help',
    description: 'Get help with assignments, study tips, and academic guidance from fellow students',
    icon: '📚',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    memberCount: 2847,
    postCount: 1523
  },
  {
    id: 'career-guidance',
    name: 'Career Guidance',
    description: 'Discuss career paths, internships, job opportunities, and professional development',
    icon: '💼',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    memberCount: 1956,
    postCount: 892
  },
  {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    description: 'Share experiences, support each other, and discuss mental health resources',
    icon: '🧘‍♀️',
    color: 'bg-green-100 text-green-700 border-green-200',
    memberCount: 1634,
    postCount: 756
  },
  {
    id: 'tech-innovation',
    name: 'Tech & Innovation',
    description: 'Explore latest technologies, coding projects, and innovative ideas',
    icon: '💻',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    memberCount: 2156,
    postCount: 1234
  },
  {
    id: 'creative-arts',
    name: 'Creative Arts',
    description: 'Share your creative work, get feedback, and collaborate on artistic projects',
    icon: '🎨',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    memberCount: 987,
    postCount: 543
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    description: 'Discuss fitness routines, sports events, and healthy lifestyle tips',
    icon: '⚽',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    memberCount: 1423,
    postCount: 678
  },
  {
    id: 'campus-life',
    name: 'Campus Life',
    description: 'Share campus experiences, events, and connect with fellow students',
    icon: '🏫',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    memberCount: 3245,
    postCount: 2156
  },
  {
    id: 'study-groups',
    name: 'Study Groups',
    description: 'Form study groups, share notes, and collaborate on academic projects',
    icon: '👥',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    memberCount: 1789,
    postCount: 934
  }
];

export default function InterestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Load current interests
    const interests = localStorage.getItem('userInterests');
    if (interests) {
      setSelectedInterests(JSON.parse(interests));
    }
  }, [user, router]);

  const handleInterestToggle = (categoryId: string) => {
    setSelectedInterests(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        router.push('/auth/signin');
        return;
      }

      // Save to backend database
      const response = await fetch('/api/community/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: selectedInterests,
          hasCompletedOnboarding: true
        })
      });

      const result = await response.json();

      if (result.success) {
        // Also save to localStorage as backup
        localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
        
        setSaveMessage('Your interests have been updated successfully in the database!');
        console.log('✅ Interests saved to database');
      } else {
        throw new Error(result.error || 'Failed to save interests');
      }
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving interests:', error);
      
      // Fallback to localStorage if API fails
      localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
      setSaveMessage('Interests saved locally. Database sync will retry later.');
      
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Your Interests</h1>
                <p className="text-gray-600 mt-2">Choose the forums you want to see in your personalized feed</p>
              </div>
              <button
                onClick={() => router.push('/community')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Back to Community
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Selected Count */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
              <span className="text-blue-700 font-medium">
                {selectedInterests.length} forum{selectedInterests.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center mb-6 p-4 rounded-lg ${
                saveMessage.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {saveMessage}
            </motion.div>
          )}

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
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{category.memberCount.toLocaleString()} members</span>
                  <span>{category.postCount.toLocaleString()} posts</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Save Button */}
          <div className="text-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Interests</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}