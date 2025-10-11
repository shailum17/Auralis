import { Injectable } from '@nestjs/common';
import { StudySession, SessionAttendee, AttendeeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository, RepositoryOptions } from './base.repository';

export interface CreateStudySessionDto {
  groupId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  location?: string;
}

export interface UpdateStudySessionDto {
  title?: string;
  description?: string;
  scheduledAt?: Date;
  duration?: number;
  location?: string;
}

export interface StudySessionFilters {
  groupId?: string;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
}

@Injectable()
export class StudySessionRepository extends BaseRepository<StudySession, CreateStudySessionDto, UpdateStudySessionDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateStudySessionDto): Promise<StudySession> {
    try {
      return await this.prisma.studySession.create({
        data,
        include: {
          group: {
            select: {
              id: true,
              name: true,
              courseCode: true,
            },
          },
          attendees: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              attendees: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'create study session');
    }
  }

  async findById(id: string): Promise<StudySession | null> {
    try {
      return await this.prisma.studySession.findUnique({
        where: { id },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              courseCode: true,
            },
          },
          attendees: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              attendees: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'find study session by id');
    }
  }

  async update(id: string, data: UpdateStudySessionDto): Promise<StudySession> {
    try {
      return await this.prisma.studySession.update({
        where: { id },
        data,
        include: {
          group: {
            select: {
              id: true,
              name: true,
              courseCode: true,
            },
          },
          attendees: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              attendees: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'update study session');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.studySession.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, 'delete study session');
    }
  }

  async findMany(options: RepositoryOptions & { filters?: StudySessionFilters } = {}): Promise<StudySession[]> {
    try {
      const { limit = 20, offset = 0, orderBy = { scheduledAt: 'asc' }, where, filters } = options;
      
      const whereClause: any = { ...where };
      
      if (filters) {
        if (filters.groupId) whereClause.groupId = filters.groupId;
        if (filters.scheduledAfter || filters.scheduledBefore) {
          whereClause.scheduledAt = {};
          if (filters.scheduledAfter) whereClause.scheduledAt.gte = filters.scheduledAfter;
          if (filters.scheduledBefore) whereClause.scheduledAt.lte = filters.scheduledBefore;
        }
      }

      return await this.prisma.studySession.findMany({
        where: whereClause,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          group: {
            select: {
              id: true,
              name: true,
              courseCode: true,
            },
          },
          attendees: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              attendees: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'find many study sessions');
    }
  }

  async findByGroup(groupId: string, options: RepositoryOptions = {}): Promise<StudySession[]> {
    return this.findMany({
      ...options,
      filters: { groupId },
    });
  }

  async findUpcomingSessions(groupId?: string, options: RepositoryOptions = {}): Promise<StudySession[]> {
    const now = new Date();
    return this.findMany({
      ...options,
      filters: { 
        groupId,
        scheduledAfter: now,
      },
    });
  }

  async addAttendee(sessionId: string, userId: string, status: AttendeeStatus = AttendeeStatus.PENDING): Promise<SessionAttendee> {
    try {
      return await this.prisma.sessionAttendee.create({
        data: {
          sessionId,
          userId,
          status,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          session: {
            select: {
              id: true,
              title: true,
              scheduledAt: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'add session attendee');
    }
  }

  async updateAttendeeStatus(sessionId: string, userId: string, status: AttendeeStatus): Promise<SessionAttendee> {
    try {
      return await this.prisma.sessionAttendee.update({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
        data: { status },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          session: {
            select: {
              id: true,
              title: true,
              scheduledAt: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'update attendee status');
    }
  }

  async removeAttendee(sessionId: string, userId: string): Promise<void> {
    try {
      await this.prisma.sessionAttendee.delete({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'remove session attendee');
    }
  }

  async findUserSessions(userId: string, options: RepositoryOptions = {}): Promise<StudySession[]> {
    try {
      const { limit = 20, offset = 0, orderBy = { scheduledAt: 'asc' } } = options;

      const attendances = await this.prisma.sessionAttendee.findMany({
        where: { userId },
        include: {
          session: {
            include: {
              group: {
                select: {
                  id: true,
                  name: true,
                  courseCode: true,
                },
              },
              attendees: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  attendees: true,
                },
              },
            },
          },
        },
        orderBy: { session: orderBy },
        take: limit,
        skip: offset,
      });

      return attendances.map(attendance => attendance.session);
    } catch (error) {
      this.handleError(error, 'find user sessions');
    }
  }
}