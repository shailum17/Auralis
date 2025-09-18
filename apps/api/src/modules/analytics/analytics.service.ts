import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      totalComments,
      totalReactions,
      reportsCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          lastActive: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      this.prisma.post.count({
        where: { isHidden: false },
      }),
      this.prisma.comment.count({
        where: { isHidden: false },
      }),
      this.prisma.reaction.count(),
      this.prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalPosts,
      totalComments,
      totalReactions,
      reportsCount,
    };
  }

  async getUserGrowthStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user registrations by day
    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by day
    const dailyGrowth = users.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return dailyGrowth;
  }

  async getContentStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [postsStats, commentsStats] = await Promise.all([
      this.prisma.post.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
          isHidden: false,
        },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.comment.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
          isHidden: false,
        },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      posts: postsStats,
      comments: commentsStats,
    };
  }

  async getWellnessStats() {
    const [
      totalMoodEntries,
      avgMoodScore,
      stressScoreDistribution,
    ] = await Promise.all([
      this.prisma.moodEntry.count(),
      this.prisma.moodEntry.aggregate({
        _avg: { moodScore: true },
      }),
      this.prisma.stressScore.groupBy({
        by: ['score'],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Categorize stress scores
    const stressCategories = {
      low: 0,
      medium: 0,
      high: 0,
    };

    stressScoreDistribution.forEach(item => {
      if (item.score < 0.4) {
        stressCategories.low += item._count.id;
      } else if (item.score < 0.7) {
        stressCategories.medium += item._count.id;
      } else {
        stressCategories.high += item._count.id;
      }
    });

    return {
      totalMoodEntries,
      averageMoodScore: avgMoodScore._avg.moodScore || 0,
      stressCategories,
    };
  }

  async getEngagementStats() {
    const [
      topPosts,
      topTags,
      reactionStats,
    ] = await Promise.all([
      this.prisma.post.findMany({
        where: { isHidden: false },
        select: {
          id: true,
          content: true,
          createdAt: true,
          isAnonymous: true,
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
        orderBy: [
          { reactions: { _count: 'desc' } },
          { comments: { _count: 'desc' } },
        ],
        take: 10,
      }),
      this.getTopTags(),
      this.prisma.reaction.groupBy({
        by: ['reactionType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    return {
      topPosts,
      topTags,
      reactionStats,
    };
  }

  private async getTopTags(limit = 10): Promise<{ tag: string; count: number }[]> {
    const result: { tag: string; count: bigint }[] = await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT tag, COUNT(*) as count
        FROM "posts", jsonb_array_elements_text("posts"."tags") as tag
        WHERE "posts"."is_hidden" = false
        GROUP BY tag
        ORDER BY count DESC
        LIMIT ${limit}
      `,
    );

    // Convert bigint to number for JSON serialization
    return result.map(item => ({
      ...item,
      count: Number(item.count),
    }));
  }
}