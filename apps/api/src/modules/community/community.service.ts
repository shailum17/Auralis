import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  memberCount: number;
  postCount: number;
  isPopular?: boolean;
}

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  private readonly forumCategories: ForumCategory[] = [
    {
      id: 'academic-help',
      name: 'Academic Help',
      description: 'Get help with assignments, study tips, and academic guidance from fellow students',
      icon: '📚',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      memberCount: 2847,
      postCount: 1523,
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
      isPopular: true
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
      postCount: 1234,
      isPopular: true
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

  async getUserPreferences(userId: string) {
    console.log('🔍 Getting user preferences for:', userId);
    
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          interests: true,
          preferences: true,
          createdAt: true
        }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user has completed community onboarding
      const hasCompletedOnboarding = user.interests && user.interests.length > 0;

      console.log('✅ User preferences retrieved:', {
        userId,
        interests: user.interests,
        hasCompletedOnboarding
      });

      return {
        success: true,
        data: {
          userId: user.id,
          interests: user.interests || [],
          hasCompletedOnboarding,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      console.error('❌ Error getting user preferences:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, preferences: { interests: string[]; hasCompletedOnboarding?: boolean }) {
    console.log('📝 Updating user preferences:', { userId, preferences });
    
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          interests: preferences.interests,
          updatedAt: new Date()
        },
        select: {
          id: true,
          interests: true,
          updatedAt: true
        }
      });

      console.log('✅ User preferences updated successfully:', updatedUser);

      return {
        success: true,
        message: 'Preferences updated successfully',
        data: {
          userId: updatedUser.id,
          interests: updatedUser.interests,
          updatedAt: updatedUser.updatedAt
        }
      };
    } catch (error) {
      console.error('❌ Error updating user preferences:', error);
      throw error;
    }
  }

  async getForums() {
    console.log('📋 Getting available forums');
    
    return {
      success: true,
      data: {
        forums: this.forumCategories,
        totalForums: this.forumCategories.length
      }
    };
  }

  async getPersonalizedFeed(userId: string) {
    console.log('🎯 Getting personalized feed for user:', userId);
    
    try {
      const userPreferences = await this.getUserPreferences(userId);
      
      if (!userPreferences.success) {
        throw new Error('Failed to get user preferences');
      }

      const userInterests = userPreferences.data.interests;
      
      // Filter forums based on user interests
      const personalizedForums = this.forumCategories.filter(forum => 
        userInterests.includes(forum.id)
      );

      // Get other forums (not in user interests)
      const otherForums = this.forumCategories.filter(forum => 
        !userInterests.includes(forum.id)
      );

      console.log('✅ Personalized feed generated:', {
        personalizedForums: personalizedForums.length,
        otherForums: otherForums.length
      });

      return {
        success: true,
        data: {
          personalizedForums,
          otherForums,
          hasPersonalization: personalizedForums.length > 0
        }
      };
    } catch (error) {
      console.error('❌ Error getting personalized feed:', error);
      throw error;
    }
  }

  async completeOnboarding(userId: string, interests: string[]) {
    console.log('🎉 Completing onboarding for user:', { userId, interests });
    
    try {
      // Validate interests
      const validInterests = interests.filter(interest => 
        this.forumCategories.some(forum => forum.id === interest)
      );

      if (validInterests.length === 0) {
        throw new Error('At least one valid interest must be selected');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          interests: validInterests,
          updatedAt: new Date()
        },
        select: {
          id: true,
          interests: true,
          updatedAt: true
        }
      });

      console.log('✅ Onboarding completed successfully:', updatedUser);

      return {
        success: true,
        message: 'Community onboarding completed successfully',
        data: {
          userId: updatedUser.id,
          interests: updatedUser.interests,
          completedAt: updatedUser.updatedAt
        }
      };
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      throw error;
    }
  }
}