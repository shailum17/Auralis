import { Injectable } from '@nestjs/common';
import { StudyGroup, StudyGroupMember, GroupRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository, RepositoryOptions } from './base.repository';

export interface CreateStudyGroupDto {
  name: string;
  description?: string;
  courseCode?: string;
  maxMembers?: number;
  isPublic?: boolean;
  createdById: string;
}

export interface UpdateStudyGroupDto {
  name?: string;
  description?: string;
  courseCode?: string;
  maxMembers?: number;
  isPublic?: boolean;
}

export interface StudyGroupFilters {
  createdById?: string;
  courseCode?: string;
  isPublic?: boolean;
  hasAvailableSlots?: boolean;
}

@Injectable()
export class StudyGroupRepository extends BaseRepository<StudyGroup, CreateStudyGroupDto, UpdateStudyGroupDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateStudyGroupDto): Promise<StudyGroup> {
    try {
      return await this.prisma.studyGroup.create({
        data,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          members: {
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
              members: true,
              sessions: true,
              resources: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'create study group');
    }
  }

  async findById(id: string): Promise<StudyGroup | null> {
    try {
      return await this.prisma.studyGroup.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          members: {
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
          sessions: {
            orderBy: { scheduledAt: 'asc' },
            take: 5,
          },
          resources: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              members: true,
              sessions: true,
              resources: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'find study group by id');
    }
  }

  async update(id: string, data: UpdateStudyGroupDto): Promise<StudyGroup> {
    try {
      return await this.prisma.studyGroup.update({
        where: { id },
        data,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          members: {
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
              members: true,
              sessions: true,
              resources: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'update study group');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.studyGroup.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, 'delete study group');
    }
  }

  async findMany(options: RepositoryOptions & { filters?: StudyGroupFilters } = {}): Promise<StudyGroup[]> {
    try {
      const { limit = 20, offset = 0, orderBy = { createdAt: 'desc' }, where, filters } = options;
      
      const whereClause: any = { ...where };
      
      if (filters) {
        if (filters.createdById) whereClause.createdById = filters.createdById;
        if (filters.courseCode) whereClause.courseCode = { contains: filters.courseCode, mode: 'insensitive' };
        if (filters.isPublic !== undefined) whereClause.isPublic = filters.isPublic;
        if (filters.hasAvailableSlots) {
          whereClause.members = {
            _count: {
              lt: whereClause.maxMembers || 10,
            },
          };
        }
      }

      return await this.prisma.studyGroup.findMany({
        where: whereClause,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          members: {
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
              members: true,
              sessions: true,
              resources: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'find many study groups');
    }
  }

  async addMember(groupId: string, userId: string, role: GroupRole = GroupRole.MEMBER): Promise<StudyGroupMember> {
    try {
      return await this.prisma.studyGroupMember.create({
        data: {
          groupId,
          userId,
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'add study group member');
    }
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    try {
      await this.prisma.studyGroupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'remove study group member');
    }
  }

  async updateMemberRole(groupId: string, userId: string, role: GroupRole): Promise<StudyGroupMember> {
    try {
      return await this.prisma.studyGroupMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        data: { role },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'update study group member role');
    }
  }

  async findUserGroups(userId: string): Promise<StudyGroup[]> {
    try {
      const memberships = await this.prisma.studyGroupMember.findMany({
        where: { userId },
        include: {
          group: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
              _count: {
                select: {
                  members: true,
                  sessions: true,
                  resources: true,
                },
              },
            },
          },
        },
      });

      return memberships.map(membership => membership.group);
    } catch (error) {
      this.handleError(error, 'find user study groups');
    }
  }
}