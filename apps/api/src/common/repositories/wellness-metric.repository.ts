import { Injectable } from '@nestjs/common';
import { WellnessMetric, WellnessType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository, RepositoryOptions } from './base.repository';

export interface CreateWellnessMetricDto {
  userId: string;
  type: WellnessType;
  value: number;
  metadata?: any;
}

export interface UpdateWellnessMetricDto {
  value?: number;
  metadata?: any;
}

export interface WellnessMetricFilters {
  userId?: string;
  type?: WellnessType;
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable()
export class WellnessMetricRepository extends BaseRepository<WellnessMetric, CreateWellnessMetricDto, UpdateWellnessMetricDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateWellnessMetricDto): Promise<WellnessMetric> {
    try {
      return await this.prisma.wellnessMetric.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'create wellness metric');
    }
  }

  async findById(id: string): Promise<WellnessMetric | null> {
    try {
      return await this.prisma.wellnessMetric.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'find wellness metric by id');
    }
  }

  async update(id: string, data: UpdateWellnessMetricDto): Promise<WellnessMetric> {
    try {
      return await this.prisma.wellnessMetric.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'update wellness metric');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.wellnessMetric.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, 'delete wellness metric');
    }
  }

  async findMany(options: RepositoryOptions & { filters?: WellnessMetricFilters } = {}): Promise<WellnessMetric[]> {
    try {
      const { limit = 50, offset = 0, orderBy = { createdAt: 'desc' }, where, filters } = options;
      
      const whereClause: any = { ...where };
      
      if (filters) {
        if (filters.userId) whereClause.userId = filters.userId;
        if (filters.type) whereClause.type = filters.type;
        if (filters.dateFrom || filters.dateTo) {
          whereClause.createdAt = {};
          if (filters.dateFrom) whereClause.createdAt.gte = filters.dateFrom;
          if (filters.dateTo) whereClause.createdAt.lte = filters.dateTo;
        }
      }

      return await this.prisma.wellnessMetric.findMany({
        where: whereClause,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'find many wellness metrics');
    }
  }

  async findByUserAndType(userId: string, type: WellnessType, options: RepositoryOptions = {}): Promise<WellnessMetric[]> {
    return this.findMany({
      ...options,
      filters: { userId, type },
    });
  }

  async getLatestByUser(userId: string, type?: WellnessType): Promise<WellnessMetric | null> {
    try {
      const whereClause: any = { userId };
      if (type) whereClause.type = type;

      return await this.prisma.wellnessMetric.findFirst({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'get latest wellness metric by user');
    }
  }
}