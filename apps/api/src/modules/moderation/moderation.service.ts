import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { ReportStatus, ActionType, UserRole } from '@prisma/client';

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  async createReport(userId: string, createReportDto: CreateReportDto) {
    const report = await this.prisma.report.create({
      data: {
        reporterId: userId,
        targetId: createReportDto.targetId,
        targetType: createReportDto.targetType,
        reason: createReportDto.reason,
        description: createReportDto.description,
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return report;
  }

  async getReports(
    status?: ReportStatus,
    limit = 50,
    offset = 0
  ) {
    const where = status ? { status } : {};

    const reports = await this.prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
          },
        },
        handler: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return reports;
  }

  async getReport(reportId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
          },
        },
        handler: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Get the reported content based on target type
    let targetContent = null;
    if (report.targetType === 'POST') {
      targetContent = await this.prisma.post.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          content: true,
          isAnonymous: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } else if (report.targetType === 'COMMENT') {
      targetContent = await this.prisma.comment.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          content: true,
          isAnonymous: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } else if (report.targetType === 'USER') {
      targetContent = await this.prisma.user.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      });
    }

    return {
      ...report,
      targetContent,
    };
  }

  async updateReportStatus(
    reportId: string,
    moderatorId: string,
    status: ReportStatus
  ) {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        handledById: moderatorId,
        resolvedAt: status === ReportStatus.RESOLVED ? new Date() : null,
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
          },
        },
        handler: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return report;
  }

  async takeModerationAction(
    moderatorId: string,
    moderationActionDto: ModerationActionDto
  ) {
    const { targetId, targetType, actionType, reason, expiresAt } = moderationActionDto;

    // Create moderation action record
    const action = await this.prisma.moderationAction.create({
      data: {
        moderatorId,
        targetId,
        targetType,
        actionType,
        reason,
        expiresAt,
      },
      include: {
        moderator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Execute the action
    switch (actionType) {
      case ActionType.HIDE_CONTENT:
        await this.hideContent(targetId, targetType, moderatorId, reason);
        break;
      case ActionType.DELETE_CONTENT:
        await this.deleteContent(targetId, targetType);
        break;
      case ActionType.SUSPEND_USER:
      case ActionType.BAN_USER:
        // In a real implementation, you'd update user status
        // For now, we just record the action
        break;
    }

    return action;
  }

  private async hideContent(targetId: string, targetType: string, moderatorId: string, reason: string) {
    if (targetType === 'POST') {
      await this.prisma.post.update({
        where: { id: targetId },
        data: {
          isHidden: true,
          hiddenByModId: moderatorId,
          hideReason: reason,
        },
      });
    } else if (targetType === 'COMMENT') {
      await this.prisma.comment.update({
        where: { id: targetId },
        data: {
          isHidden: true,
        },
      });
    }
  }

  private async deleteContent(targetId: string, targetType: string) {
    if (targetType === 'POST') {
      await this.prisma.post.delete({
        where: { id: targetId },
      });
    } else if (targetType === 'COMMENT') {
      await this.prisma.comment.delete({
        where: { id: targetId },
      });
    }
  }

  async getModerationStats() {
    const [
      totalReports,
      pendingReports,
      resolvedReports,
      totalActions,
      hiddenPosts,
      hiddenComments,
    ] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      this.prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
      this.prisma.moderationAction.count(),
      this.prisma.post.count({ where: { isHidden: true } }),
      this.prisma.comment.count({ where: { isHidden: true } }),
    ]);

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      totalActions,
      hiddenPosts,
      hiddenComments,
    };
  }

  async getUserModerationHistory(userId: string) {
    const [reports, actions] = await Promise.all([
      this.prisma.report.findMany({
        where: {
          OR: [
            { reporterId: userId },
            { targetType: 'USER', targetId: userId },
          ],
        },
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
            },
          },
          handler: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.moderationAction.findMany({
        where: {
          OR: [
            { targetType: 'USER', targetId: userId },
            {
              targetType: 'POST',
              targetId: {
                in: await this.prisma.post
                  .findMany({
                    where: { authorId: userId },
                    select: { id: true },
                  })
                  .then(posts => posts.map(p => p.id)),
              },
            },
            {
              targetType: 'COMMENT',
              targetId: {
                in: await this.prisma.comment
                  .findMany({
                    where: { authorId: userId },
                    select: { id: true },
                  })
                  .then(comments => comments.map(c => c.id)),
              },
            },
          ],
        },
        include: {
          moderator: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      reports,
      actions,
    };
  }
}