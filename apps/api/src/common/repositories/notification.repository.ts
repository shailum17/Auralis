import { Injectable } from '@nestjs/common';
import { Notification, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository, RepositoryOptions } from './base.repository';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
}

export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  isRead?: boolean;
}

@Injectable()
export class NotificationRepository extends BaseRepository<Notification, CreateNotificationDto, UpdateNotificationDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateNotificationDto): Promise<Notification> {
    try {
      return await this.prisma.notification.create({
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
      this.handleError(error, 'create notification');
    }
  }

  async findById(id: string): Promise<Notification | null> {
    try {
      return await this.prisma.notification.findUnique({
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
      this.handleError(error, 'find notification by id');
    }
  }

  async update(id: string, data: UpdateNotificationDto): Promise<Notification> {
    try {
      return await this.prisma.notification.update({
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
      this.handleError(error, 'update notification');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.notification.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, 'delete notification');
    }
  }

  async findMany(options: RepositoryOptions & { filters?: NotificationFilters } = {}): Promise<Notification[]> {
    try {
      const { limit = 50, offset = 0, orderBy = { createdAt: 'desc' }, where, filters } = options;
      
      const whereClause: any = { ...where };
      
      if (filters) {
        if (filters.userId) whereClause.userId = filters.userId;
        if (filters.type) whereClause.type = filters.type;
        if (filters.isRead !== undefined) whereClause.isRead = filters.isRead;
      }

      return await this.prisma.notification.findMany({
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
      this.handleError(error, 'find many notifications');
    }
  }

  async findByUser(userId: string, options: RepositoryOptions = {}): Promise<Notification[]> {
    return this.findMany({
      ...options,
      filters: { userId },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    } catch (error) {
      this.handleError(error, 'mark all notifications as read');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch (error) {
      this.handleError(error, 'get unread notification count');
    }
  }

  async createBulk(notifications: CreateNotificationDto[]): Promise<void> {
    try {
      await this.prisma.notification.createMany({
        data: notifications,
      });
    } catch (error) {
      this.handleError(error, 'create bulk notifications');
    }
  }

  async deleteOldNotifications(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      await this.prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRead: true,
        },
      });
    } catch (error) {
      this.handleError(error, 'delete old notifications');
    }
  }
}