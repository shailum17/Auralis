import { PrismaService } from '../prisma/prisma.service';

export class DatabaseUtils {
  constructor(private prisma: PrismaService) {}

  /**
   * Execute a transaction with automatic rollback on error
   */
  async executeTransaction<T>(operations: (prisma: PrismaService) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      return await operations(tx as PrismaService);
    });
  }

  /**
   * Batch create operations with error handling
   */
  async batchCreate<T>(
    model: string,
    data: any[],
    batchSize: number = 100
  ): Promise<void> {
    const batches = this.chunkArray(data, batchSize);
    
    for (const batch of batches) {
      await (this.prisma as any)[model].createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
  }

  /**
   * Soft delete implementation
   */
  async softDelete(model: string, id: string): Promise<void> {
    await (this.prisma as any)[model].update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isDeleted: true,
      },
    });
  }

  /**
   * Restore soft deleted record
   */
  async restore(model: string, id: string): Promise<void> {
    await (this.prisma as any)[model].update({
      where: { id },
      data: {
        deletedAt: null,
        isDeleted: false,
      },
    });
  }

  /**
   * Check if record exists
   */
  async exists(model: string, where: any): Promise<boolean> {
    const count = await (this.prisma as any)[model].count({ where });
    return count > 0;
  }

  /**
   * Get record count with filters
   */
  async count(model: string, where?: any): Promise<number> {
    return await (this.prisma as any)[model].count({ where });
  }

  /**
   * Paginate results
   */
  async paginate<T>(
    model: string,
    options: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { where, orderBy, include, select, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      (this.prisma as any)[model].findMany({
        where,
        orderBy,
        include,
        select,
        skip,
        take: limit,
      }),
      (this.prisma as any)[model].count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Search across multiple fields
   */
  async search<T>(
    model: string,
    searchTerm: string,
    searchFields: string[],
    options: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      limit?: number;
    } = {}
  ): Promise<T[]> {
    const { where = {}, orderBy, include, select, limit = 20 } = options;

    const searchConditions = searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    }));

    const searchWhere = {
      ...where,
      OR: searchConditions,
    };

    return await (this.prisma as any)[model].findMany({
      where: searchWhere,
      orderBy,
      include,
      select,
      take: limit,
    });
  }

  /**
   * Bulk update operations
   */
  async bulkUpdate(
    model: string,
    updates: Array<{ where: any; data: any }>
  ): Promise<void> {
    await this.executeTransaction(async (tx) => {
      for (const update of updates) {
        await (tx as any)[model].updateMany(update);
      }
    });
  }

  /**
   * Get aggregated data
   */
  async aggregate(
    model: string,
    options: {
      where?: any;
      _count?: any;
      _sum?: any;
      _avg?: any;
      _min?: any;
      _max?: any;
    }
  ): Promise<any> {
    return await (this.prisma as any)[model].aggregate(options);
  }

  /**
   * Group by operations
   */
  async groupBy(
    model: string,
    options: {
      by: string[];
      where?: any;
      _count?: any;
      _sum?: any;
      _avg?: any;
      _min?: any;
      _max?: any;
      orderBy?: any;
      having?: any;
    }
  ): Promise<any[]> {
    return await (this.prisma as any)[model].groupBy(options);
  }

  /**
   * Upsert operation (create or update)
   */
  async upsert<T>(
    model: string,
    options: {
      where: any;
      update: any;
      create: any;
      include?: any;
      select?: any;
    }
  ): Promise<T> {
    return await (this.prisma as any)[model].upsert(options);
  }

  /**
   * Clean up old records based on date
   */
  async cleanupOldRecords(
    model: string,
    dateField: string,
    olderThanDays: number,
    additionalWhere?: any
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const where = {
      [dateField]: {
        lt: cutoffDate,
      },
      ...additionalWhere,
    };

    const result = await (this.prisma as any)[model].deleteMany({ where });
    return result.count;
  }

  /**
   * Utility function to chunk arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; timestamp: Date }> {
    try {
      // Simple connection test by counting users
      await this.prisma.user.count();
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { status: 'unhealthy', timestamp: new Date() };
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    users: number;
    posts: number;
    comments: number;
    wellnessMetrics: number;
    studyGroups: number;
    notifications: number;
    contentFlags: number;
  }> {
    const [
      users,
      posts,
      comments,
      wellnessMetrics,
      studyGroups,
      notifications,
      contentFlags,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
      this.prisma.comment.count(),
      this.prisma.wellnessMetric.count(),
      this.prisma.studyGroup.count(),
      this.prisma.notification.count(),
      this.prisma.contentFlag.count(),
    ]);

    return {
      users,
      posts,
      comments,
      wellnessMetrics,
      studyGroups,
      notifications,
      contentFlags,
    };
  }
}