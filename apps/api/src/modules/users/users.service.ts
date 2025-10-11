import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateWellnessSettingsDto } from './dto/update-wellness-settings.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UpdateAcademicInfoDto } from './dto/update-academic-info.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        interests: true,
        createdAt: true,
        emailVerified: true,
        privacySettings: true,
        wellnessSettings: true,
        preferences: true,
        academicInfo: true,
        lastActive: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        bio: updateProfileDto.bio,
        avatarUrl: updateProfileDto.avatarUrl,
        interests: updateProfileDto.interests || undefined,
        privacySettings: updateProfileDto.privacySettings || undefined,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        interests: true,
        updatedAt: true,
        privacySettings: true,
      },
    });

    return user;
  }

  async getUserActivity(userId: string, limit = 20, offset = 0) {
    const [posts, comments] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          content: true,
          isAnonymous: true,
          createdAt: true,
          tags: true,
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.comment.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          content: true,
          isAnonymous: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              content: true,
            },
          },
          _count: {
            select: {
              reactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    // Combine and sort by date
    const activity = [
      ...posts.map(post => ({ ...post, type: 'post' })),
      ...comments.map(comment => ({ ...comment, type: 'comment' })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return activity.slice(0, limit);
  }

  async getUserStats(userId: string) {
    const [posts, comments] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId },
        select: { id: true },
      }),
      this.prisma.comment.findMany({
        where: { authorId: userId },
        select: { id: true },
      }),
    ]);

    const postIds = posts.map(p => p.id);
    const commentIds = comments.map(c => c.id);

    const reactionsReceived = await this.prisma.reaction.count({
      where: {
        OR: [
          { targetType: 'POST', targetId: { in: postIds } },
          { targetType: 'COMMENT', targetId: { in: commentIds } },
        ],
      },
    });

    return {
      postsCount: postIds.length,
      commentsCount: commentIds.length,
      reactionsReceived,
    };
  }

  async updateWellnessSettings(userId: string, updateWellnessSettingsDto: UpdateWellnessSettingsDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        wellnessSettings: {
          trackMood: updateWellnessSettingsDto.trackMood,
          trackStress: updateWellnessSettingsDto.trackStress,
          shareWellnessData: updateWellnessSettingsDto.shareWellnessData,
          crisisAlertsEnabled: updateWellnessSettingsDto.crisisAlertsEnabled,
          allowWellnessInsights: updateWellnessSettingsDto.allowWellnessInsights,
        },
        updatedAt: new Date(),
      },
      select: {
        id: true,
        wellnessSettings: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getWellnessSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        wellnessSettings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.wellnessSettings;
  }

  async updateUserPreferences(userId: string, updateUserPreferencesDto: UpdateUserPreferencesDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        preferences: {
          feedAlgorithm: updateUserPreferencesDto.feedAlgorithm,
          privacyLevel: updateUserPreferencesDto.privacyLevel,
          theme: updateUserPreferencesDto.theme,
          language: updateUserPreferencesDto.language,
          timezone: updateUserPreferencesDto.timezone,
          notifications: updateUserPreferencesDto.notifications ? {
            emailNotifications: updateUserPreferencesDto.notifications.emailNotifications,
            pushNotifications: updateUserPreferencesDto.notifications.pushNotifications,
            messageNotifications: updateUserPreferencesDto.notifications.messageNotifications,
            postReactions: updateUserPreferencesDto.notifications.postReactions,
            commentReplies: updateUserPreferencesDto.notifications.commentReplies,
            studyGroupInvites: updateUserPreferencesDto.notifications.studyGroupInvites,
            sessionReminders: updateUserPreferencesDto.notifications.sessionReminders,
            wellnessAlerts: updateUserPreferencesDto.notifications.wellnessAlerts,
            moderationActions: updateUserPreferencesDto.notifications.moderationActions,
            systemAnnouncements: updateUserPreferencesDto.notifications.systemAnnouncements,
          } : undefined,
        },
        updatedAt: new Date(),
      },
      select: {
        id: true,
        preferences: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getUserPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.preferences;
  }

  async updateAcademicInfo(userId: string, updateAcademicInfoDto: UpdateAcademicInfoDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        academicInfo: {
          institution: updateAcademicInfoDto.institution,
          major: updateAcademicInfoDto.major,
          year: updateAcademicInfoDto.year,
          courses: updateAcademicInfoDto.courses,
          gpa: updateAcademicInfoDto.gpa,
          graduationYear: updateAcademicInfoDto.graduationYear,
        },
        updatedAt: new Date(),
      },
      select: {
        id: true,
        academicInfo: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getAcademicInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        academicInfo: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.academicInfo;
  }

  async updatePrivacySettings(userId: string, updatePrivacySettingsDto: UpdatePrivacySettingsDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        privacySettings: {
          allowDirectMessages: updatePrivacySettingsDto.allowDirectMessages,
          showOnlineStatus: updatePrivacySettingsDto.showOnlineStatus,
          allowProfileViewing: updatePrivacySettingsDto.allowProfileViewing,
          dataCollection: updatePrivacySettingsDto.dataCollection,
        },
        updatedAt: new Date(),
      },
      select: {
        id: true,
        privacySettings: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getPrivacySettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        privacySettings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.privacySettings;
  }
}