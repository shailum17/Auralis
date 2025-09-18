import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export enum SortOption {
  NEWEST = 'newest',
  MOST_COMMENTED = 'most_commented',
  MOST_REACTIONS = 'most_reactions',
}

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getMainFeed(
    limit = 20,
    offset = 0,
    sort: SortOption = SortOption.NEWEST,
    tags?: string[]
  ) {
    const where = {
      isHidden: false,
    };

    let orderBy: any = { createdAt: 'desc' };

    switch (sort) {
      case SortOption.MOST_COMMENTED:
        orderBy = {
          comments: {
            _count: 'desc',
          },
        };
        break;
      case SortOption.MOST_REACTIONS:
        orderBy = {
          reactions: {
            _count: 'desc',
          },
        };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    let posts = await this.prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
        reactions: {
          select: {
            reactionType: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    });

    // Filter by tags if provided (client-side filtering for SQLite)
    if (tags && tags.length > 0) {
      posts = posts.filter(post => {
        try {
          const postTags = post.tags ? JSON.parse(post.tags as string) : [];
          return tags.some(tag => postTags.includes(tag));
        } catch {
          return false;
        }
      });
    }

    return posts.map(post => this.formatPostResponse(post));
  }

  async getTopicFeed(
    topic: string,
    limit = 20,
    offset = 0,
    sort: SortOption = SortOption.NEWEST
  ) {
    return this.getMainFeed(limit, offset, sort, [topic]);
  }

  async getTrendingTags(limit = 10) {
    // Get posts from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await this.prisma.post.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        isHidden: false,
        tags: {
          not: null,
        },
      },
      select: {
        tags: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });

    // Count tag occurrences and calculate engagement
    const tagStats = new Map<string, { count: number; engagement: number }>();

    posts.forEach(post => {
      const tags = post.tags ? JSON.parse(post.tags as string) : [];
      const engagement = post._count.comments + post._count.reactions;

      tags?.forEach(tag => {
        const current = tagStats.get(tag) || { count: 0, engagement: 0 };
        tagStats.set(tag, {
          count: current.count + 1,
          engagement: current.engagement + engagement,
        });
      });
    });

    // Sort by engagement score (count * average engagement)
    const sortedTags = Array.from(tagStats.entries())
      .map(([tag, stats]) => ({
        tag,
        count: stats.count,
        avgEngagement: stats.engagement / stats.count,
        score: stats.count * (stats.engagement / stats.count),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sortedTags;
  }

  async getFeedStats() {
    const [totalPosts, totalComments, totalReactions, activeUsers] = await Promise.all([
      this.prisma.post.count({
        where: { isHidden: false },
      }),
      this.prisma.comment.count({
        where: { isHidden: false },
      }),
      this.prisma.reaction.count(),
      this.prisma.user.count({
        where: {
          lastActive: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      totalPosts,
      totalComments,
      totalReactions,
      activeUsers,
    };
  }

  private formatPostResponse(post: any) {
    const { author, reactions, ...postData } = post;

    // Calculate reaction summary
    const reactionSummary = reactions.reduce((acc: any, reaction: any) => {
      acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
      return acc;
    }, {});

    return {
      ...postData,
      author: post.isAnonymous
        ? {
            id: 'anonymous',
            username: 'Anonymous',
            avatarUrl: null,
          }
        : author,
      reactionSummary,
    };
  }
}