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

  // Fallback forums data (used if database query fails)
  private readonly fallbackForums: ForumCategory[] = [
    {
      id: 'academic-help',
      name: 'Academic Help',
      description: 'Get help with assignments, study tips, and academic guidance from fellow students',
      icon: 'book',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      memberCount: 0,
      postCount: 0,
      isPopular: true
    },
    {
      id: 'career-guidance',
      name: 'Career Guidance',
      description: 'Discuss career paths, internships, job opportunities, and professional development',
      icon: 'briefcase',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      memberCount: 0,
      postCount: 0,
      isPopular: true
    },
    {
      id: 'mental-wellness',
      name: 'Mental Wellness',
      description: 'Share experiences, support each other, and discuss mental health resources',
      icon: 'heart',
      color: 'bg-green-100 text-green-700 border-green-200',
      memberCount: 0,
      postCount: 0
    },
    {
      id: 'tech-innovation',
      name: 'Tech & Innovation',
      description: 'Explore latest technologies, coding projects, and innovative ideas',
      icon: 'computer',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      memberCount: 0,
      postCount: 0,
      isPopular: true
    },
    {
      id: 'creative-arts',
      name: 'Creative Arts',
      description: 'Share your creative work, get feedback, and collaborate on artistic projects',
      icon: 'palette',
      color: 'bg-pink-100 text-pink-700 border-pink-200',
      memberCount: 0,
      postCount: 0
    },
    {
      id: 'sports-fitness',
      name: 'Sports & Fitness',
      description: 'Discuss fitness routines, sports events, and healthy lifestyle tips',
      icon: 'fitness',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      memberCount: 0,
      postCount: 0
    },
    {
      id: 'campus-life',
      name: 'Campus Life',
      description: 'Share campus experiences, events, and connect with fellow students',
      icon: 'building',
      color: 'bg-teal-100 text-teal-700 border-teal-200',
      memberCount: 0,
      postCount: 0
    },
    {
      id: 'study-groups',
      name: 'Study Groups',
      description: 'Form study groups, share notes, and collaborate on academic projects',
      icon: 'users',
      color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      memberCount: 0,
      postCount: 0
    }
  ];

  // Helper method to get forums from database
  private async getForumsFromDB() {
    try {
      const forums = await this.prisma.forum.findMany({
        where: { isActive: true },
        orderBy: { memberCount: 'desc' }
      });
      
      if (forums.length === 0) {
        console.warn('⚠️ No forums in database, using fallback forums');
        return this.fallbackForums;
      }
      
      return forums.map(forum => ({
        id: forum.forumId,
        name: forum.name,
        description: forum.description,
        icon: forum.icon,
        color: forum.color,
        memberCount: forum.memberCount,
        postCount: forum.postCount,
        isPopular: forum.isPopular
      }));
    } catch (error) {
      console.error('❌ Error fetching forums from database:', error);
      console.log('📋 Using fallback forums');
      // Return fallback forums if database query fails
      return this.fallbackForums;
    }
  }

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

  async getPersonalizedFeed(userId: string) {
    console.log('🎯 Getting personalized feed for user:', userId);
    
    try {
      const userPreferences = await this.getUserPreferences(userId);
      
      if (!userPreferences.success) {
        throw new Error('Failed to get user preferences');
      }

      const userInterests = userPreferences.data.interests;
      const allForums = await this.getForumsFromDB();
      
      // Filter forums based on user interests
      const personalizedForums = allForums.filter(forum => 
        userInterests.includes(forum.id)
      );

      // Get other forums (not in user interests)
      const otherForums = allForums.filter(forum => 
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

  async getForums(userId?: string) {
    console.log('📋 Getting available forums', userId ? `for user ${userId}` : '');
    
    try {
      // Get user interests if userId is provided
      let userInterests: string[] = [];
      if (userId) {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { interests: true }
          });
          userInterests = user?.interests || [];
          console.log('👤 User interests:', userInterests);
        } catch (error) {
          console.warn('⚠️ Could not fetch user interests:', error.message);
        }
      }

      // Get forums from database
      const forums = await this.prisma.forum.findMany({
        where: { isActive: true },
        orderBy: { memberCount: 'desc' }
      });

      if (forums.length === 0) {
        console.warn('⚠️ No forums found in database. Using fallback forums.');
        const forumsWithJoinStatus = this.fallbackForums.map(forum => ({
          ...forum,
          isJoined: userInterests.includes(forum.id)
        }));
        return {
          success: true,
          data: {
            forums: forumsWithJoinStatus,
            totalForums: forumsWithJoinStatus.length
          }
        };
      }

      // Update post counts and member counts in real-time
      const forumsWithStats = await Promise.all(
        forums.map(async (forum) => {
          try {
            // Count real posts
            const postCount = await this.prisma.post.count({
              where: {
                forumId: forum.forumId,
                isPublished: true,
              }
            });

            // Count real members (users with this forum in interests)
            const memberCount = await this.prisma.user.count({
              where: {
                interests: {
                  has: forum.forumId
                }
              }
            });

            // Update forum stats if different
            if (postCount !== forum.postCount || memberCount !== forum.memberCount) {
              await this.prisma.forum.update({
                where: { id: forum.id },
                data: { 
                  postCount,
                  memberCount
                }
              });
            }

            return {
              id: forum.forumId,
              name: forum.name,
              description: forum.description,
              icon: forum.icon,
              color: forum.color,
              memberCount: memberCount,
              postCount: postCount,
              isPopular: forum.isPopular,
              isJoined: userInterests.includes(forum.forumId)
            };
          } catch (countError) {
            console.warn(`⚠️ Could not get stats for forum ${forum.forumId}:`, countError.message);
            return {
              id: forum.forumId,
              name: forum.name,
              description: forum.description,
              icon: forum.icon,
              color: forum.color,
              memberCount: forum.memberCount,
              postCount: forum.postCount,
              isPopular: forum.isPopular,
              isJoined: userInterests.includes(forum.forumId)
            };
          }
        })
      );

      console.log('✅ Forums retrieved successfully:', forumsWithStats.length);
      console.log('✅ Joined forums:', forumsWithStats.filter(f => f.isJoined).length);

      return {
        success: true,
        data: {
          forums: forumsWithStats,
          totalForums: forumsWithStats.length
        }
      };
    } catch (error) {
      console.error('❌ Error getting forums:', error);
      console.log('📋 Returning fallback forums due to error');
      // Return fallback forums if any error occurs
      return {
        success: true,
        data: {
          forums: this.fallbackForums.map(forum => ({
            ...forum,
            isJoined: false
          })),
          totalForums: this.fallbackForums.length
        }
      };
    }
  }

  async completeOnboarding(userId: string, interests: string[]) {
    console.log('🎉 Completing onboarding for user:', { userId, interests });
    
    try {
      // Get valid forum IDs from database
      const forums = await this.getForumsFromDB();
      const validForumIds = forums.map(f => f.id);
      
      // Validate interests
      const validInterests = interests.filter(interest => 
        validForumIds.includes(interest)
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

  async getPosts(userId: string) {
    console.log('📝 Getting all community posts for user:', userId);
    
    try {
      // Get posts from database
      const posts = await this.prisma.post.findMany({
        where: {
          isPublished: true,
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
            }
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limit to 50 most recent posts
      });

      // Get forums from database for lookup
      const forums = await this.getForumsFromDB();
      const forumMap = new Map(forums.map(f => [f.id, f]));
      
      // Transform posts to include forum information
      const transformedPosts = posts.map(post => {
        // Find the forum this post belongs to
        const forum = forumMap.get(post.forumId);
        
        return {
          id: post.id,
          userId: post.authorId,
          userName: post.author.fullName || post.author.username || 'Anonymous',
          userEmail: post.author.email,
          forumId: post.forumId || 'general',
          forumName: forum?.name || 'General Discussion',
          title: post.title,
          content: post.content,
          createdAt: post.createdAt.toISOString(),
          likes: post._count.reactions, // Count all reactions as likes for now
          comments: post._count.comments,
        };
      });

      console.log('✅ Posts retrieved successfully:', transformedPosts.length);

      return {
        success: true,
        data: {
          posts: transformedPosts,
          totalPosts: transformedPosts.length
        }
      };
    } catch (error) {
      console.error('❌ Error getting posts:', error);
      throw error;
    }
  }

  async createPost(userId: string, createPostDto: { title: string; content: string; forumId: string }) {
    console.log('✍️ Creating new post:', { userId, ...createPostDto });
    
    try {
      // Validate forum exists in database
      const forumFromDB = await this.prisma.forum.findUnique({
        where: { forumId: createPostDto.forumId }
      });
      
      if (!forumFromDB) {
        throw new Error('Invalid forum ID');
      }
      
      const forum = {
        id: forumFromDB.forumId,
        name: forumFromDB.name
      };

      // Get user information
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
        }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create the post
      const post = await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          forumId: createPostDto.forumId,
          authorId: userId,
          isPublished: true,
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
            }
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            }
          }
        }
      });

      const transformedPost = {
        id: post.id,
        userId: post.authorId,
        userName: post.author.fullName || post.author.username || 'Anonymous',
        userEmail: post.author.email,
        forumId: post.forumId || 'general',
        forumName: forum.name,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        likes: post._count.reactions, // Count all reactions as likes for now
        comments: post._count.comments,
      };

      console.log('✅ Post created successfully:', transformedPost.id);

      return {
        success: true,
        message: 'Post created successfully',
        data: {
          post: transformedPost
        }
      };
    } catch (error) {
      console.error('❌ Error creating post:', error);
      throw error;
    }
  }

  async getPost(postId: string) {
    console.log('🔍 Getting post:', postId);
    
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
            }
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            }
          }
        }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Get forum from database
      const forumFromDB = await this.prisma.forum.findUnique({
        where: { forumId: post.forumId }
      });

      const transformedPost = {
        id: post.id,
        userId: post.authorId,
        userName: post.author.fullName || post.author.username || 'Anonymous',
        userEmail: post.author.email,
        forumId: post.forumId || 'general',
        forumName: forumFromDB?.name || 'General Discussion',
        title: post.title,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        likes: post._count.reactions, // Count all reactions as likes for now
        comments: post._count.comments,
      };

      console.log('✅ Post retrieved successfully');

      return {
        success: true,
        data: {
          post: transformedPost
        }
      };
    } catch (error) {
      console.error('❌ Error getting post:', error);
      throw error;
    }
  }
}