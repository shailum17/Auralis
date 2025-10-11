import { Injectable } from '@nestjs/common';
import { ContentFlag, FlagType, FlagStatus, TargetType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository, RepositoryOptions } from './base.repository';

export interface CreateContentFlagDto {
  contentId: string;
  contentType: TargetType;
  flagType: FlagType;
  confidence: number;
  reviewedBy?: string;
}

export interface UpdateContentFlagDto {
  status?: FlagStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface ContentFlagFilters {
  contentId?: string;
  contentType?: TargetType;
  flagType?: FlagType;
  status?: FlagStatus;
  reviewedBy?: string;
  confidenceMin?: number;
  confidenceMax?: number;
}

@Injectable()
export class ContentFlagRepository extends BaseRepository<ContentFlag, CreateContentFlagDto, UpdateContentFlagDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateContentFlagDto): Promise<ContentFlag> {
    try {
      return await this.prisma.contentFlag.create({
        data,
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'create content flag');
    }
  }

  async findById(id: string): Promise<ContentFlag | null> {
    try {
      return await this.prisma.contentFlag.findUnique({
        where: { id },
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'find content flag by id');
    }
  }

  async update(id: string, data: UpdateContentFlagDto): Promise<ContentFlag> {
    try {
      return await this.prisma.contentFlag.update({
        where: { id },
        data,
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'update content flag');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.contentFlag.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, 'delete content flag');
    }
  }

  async findMany(options: RepositoryOptions & { filters?: ContentFlagFilters } = {}): Promise<ContentFlag[]> {
    try {
      const { limit = 50, offset = 0, orderBy = { createdAt: 'desc' }, where, filters } = options;
      
      const whereClause: any = { ...where };
      
      if (filters) {
        if (filters.contentId) whereClause.contentId = filters.contentId;
        if (filters.contentType) whereClause.contentType = filters.contentType;
        if (filters.flagType) whereClause.flagType = filters.flagType;
        if (filters.status) whereClause.status = filters.status;
        if (filters.reviewedBy) whereClause.reviewedBy = filters.reviewedBy;
        
        if (filters.confidenceMin !== undefined || filters.confidenceMax !== undefined) {
          whereClause.confidence = {};
          if (filters.confidenceMin !== undefined) whereClause.confidence.gte = filters.confidenceMin;
          if (filters.confidenceMax !== undefined) whereClause.confidence.lte = filters.confidenceMax;
        }
      }

      return await this.prisma.contentFlag.findMany({
        where: whereClause,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'find many content flags');
    }
  }

  async findByContent(contentId: string, contentType: TargetType): Promise<ContentFlag[]> {
    return this.findMany({
      filters: { contentId, contentType },
    });
  }

  async findPendingFlags(options: RepositoryOptions = {}): Promise<ContentFlag[]> {
    return this.findMany({
      ...options,
      filters: { status: FlagStatus.PENDING },
      orderBy: { createdAt: 'asc' }, // Oldest first for review queue
    });
  }

  async findHighConfidenceFlags(minConfidence: number = 0.8, options: RepositoryOptions = {}): Promise<ContentFlag[]> {
    return this.findMany({
      ...options,
      filters: { 
        status: FlagStatus.PENDING,
        confidenceMin: minConfidence,
      },
      orderBy: { confidence: 'desc' }, // Highest confidence first
    });
  }

  async findCrisisFlags(options: RepositoryOptions = {}): Promise<ContentFlag[]> {
    return this.findMany({
      ...options,
      filters: { 
        flagType: FlagType.CRISIS_LANGUAGE,
        status: FlagStatus.PENDING,
      },
      orderBy: { createdAt: 'asc' }, // Oldest first for urgent review
    });
  }

  async reviewFlag(id: string, reviewerId: string, status: FlagStatus): Promise<ContentFlag> {
    return this.update(id, {
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    });
  }

  async escalateFlag(id: string): Promise<ContentFlag> {
    return this.update(id, {
      status: FlagStatus.ESCALATED,
    });
  }

  async getFlagStats(filters?: Partial<ContentFlagFilters>): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    escalated: number;
    byType: Record<FlagType, number>;
  }> {
    try {
      const whereClause: any = {};
      
      if (filters) {
        if (filters.contentType) whereClause.contentType = filters.contentType;
        if (filters.flagType) whereClause.flagType = filters.flagType;
        if (filters.reviewedBy) whereClause.reviewedBy = filters.reviewedBy;
      }

      const [total, pending, approved, rejected, escalated, byTypeResults] = await Promise.all([
        this.prisma.contentFlag.count({ where: whereClause }),
        this.prisma.contentFlag.count({ where: { ...whereClause, status: FlagStatus.PENDING } }),
        this.prisma.contentFlag.count({ where: { ...whereClause, status: FlagStatus.APPROVED } }),
        this.prisma.contentFlag.count({ where: { ...whereClause, status: FlagStatus.REJECTED } }),
        this.prisma.contentFlag.count({ where: { ...whereClause, status: FlagStatus.ESCALATED } }),
        this.prisma.contentFlag.groupBy({
          by: ['flagType'],
          where: whereClause,
          _count: true,
        }),
      ]);

      const byType = Object.values(FlagType).reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<FlagType, number>);

      byTypeResults.forEach(result => {
        byType[result.flagType] = result._count;
      });

      return {
        total,
        pending,
        approved,
        rejected,
        escalated,
        byType,
      };
    } catch (error) {
      this.handleError(error, 'get flag stats');
    }
  }
}