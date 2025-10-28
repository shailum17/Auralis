'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UserProfileView from '@/components/community/UserProfileView';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!params?.id) return;
      
      setLoading(true);
      
      // Simulate API call to load user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user profile data
      const mockProfile = {
        id: params?.id as string,
        name: 'Sarah Johnson',
        username: 'sarah_j_2024',
        email: 'sarah.johnson@university.edu',
        avatar: null,
        bio: 'Computer Science major passionate about machine learning and web development. Always happy to help fellow students with programming questions!',
        joinedAt: '2023-09-15T00:00:00Z',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isOnline: true,
        reputation: 1247,
        badges: [
          { name: 'Helpful Contributor', icon: '🌟', color: 'bg-yellow-100 text-yellow-800' },
          { name: 'Problem Solver', icon: '🧩', color: 'bg-green-100 text-green-800' },
          { name: 'Active Member', icon: '⚡', color: 'bg-blue-100 text-blue-800' }
        ],
        stats: {
          posts: 45,
          replies: 189,
          likes: 567,
          helpfulAnswers: 23,
          solutionsAccepted: 12
        },
        academicInfo: {
          major: 'Computer Science',
          year: 'Junior',
          institution: 'University of Technology'
        },
        interests: ['Machine Learning', 'Web Development', 'Data Science', 'Python', 'JavaScript'],
        recentActivity: [
          {
            type: 'post',
            title: 'Need help with React hooks',
            timestamp: '2 hours ago',
            category: 'tech'
          },
          {
            type: 'reply',
            title: 'Calculus derivatives explanation',
            timestamp: '5 hours ago',
            category: 'academic'
          },
          {
            type: 'like',
            title: 'Study group formation tips',
            timestamp: '1 day ago',
            category: 'general'
          }
        ]
      };
      
      setUserProfile(mockProfile);
      setLoading(false);
    };

    loadUserProfile();
  }, [params?.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
            <p className="text-gray-600 mb-4">The user profile you're looking for doesn't exist.</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            <span className="text-gray-900 font-medium">{userProfile.name}</span>
          </nav>

          <UserProfileView userProfile={userProfile} />
        </div>
      </div>
    </DashboardLayout>
  );
}