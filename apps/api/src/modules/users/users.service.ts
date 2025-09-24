import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
}