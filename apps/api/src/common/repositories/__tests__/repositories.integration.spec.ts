import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { WellnessMetricRepository } from '../wellness-metric.repository';
import { StudyGroupRepository } from '../study-group.repository';
import { NotificationRepository } from '../notification.repository';
import { ContentFlagRepository } from '../content-flag.repository';
import { StudySessionRepository } from '../study-session.repository';
import { WellnessType, NotificationType, FlagType, TargetType, FlagStatus, GroupRole } from '@prisma/client';

describe('Repositories Integration Tests', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let wellnessRepo: WellnessMetricRepository;
  let studyGroupRepo: StudyGroupRepository;
  let notificationRepo: NotificationRepository;
  let contentFlagRepo: ContentFlagRepository;
  let studySessionRepo: StudySessionRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        WellnessMetricRepository,
        StudyGroupRepository,
        NotificationRepository,
        ContentFlagRepository,
        StudySessionRepository,
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    wellnessRepo = module.get<WellnessMetricRepository>(WellnessMetricRepository);
    studyGroupRepo = module.get<StudyGroupRepository>(StudyGroupRepository);
    notificationRepo = module.get<NotificationRepository>(NotificationRepository);
    contentFlagRepo = module.get<ContentFlagRepository>(ContentFlagRepository);
    studySessionRepo = module.get<StudySessionRepository>(StudySessionRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('WellnessMetricRepository', () => {
    it('should be defined', () => {
      expect(wellnessRepo).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(wellnessRepo.create).toBeDefined();
      expect(wellnessRepo.findById).toBeDefined();
      expect(wellnessRepo.update).toBeDefined();
      expect(wellnessRepo.delete).toBeDefined();
      expect(wellnessRepo.findMany).toBeDefined();
      expect(wellnessRepo.findByUserAndType).toBeDefined();
      expect(wellnessRepo.getLatestByUser).toBeDefined();
    });
  });

  describe('StudyGroupRepository', () => {
    it('should be defined', () => {
      expect(studyGroupRepo).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(studyGroupRepo.create).toBeDefined();
      expect(studyGroupRepo.findById).toBeDefined();
      expect(studyGroupRepo.update).toBeDefined();
      expect(studyGroupRepo.delete).toBeDefined();
      expect(studyGroupRepo.findMany).toBeDefined();
      expect(studyGroupRepo.addMember).toBeDefined();
      expect(studyGroupRepo.removeMember).toBeDefined();
      expect(studyGroupRepo.updateMemberRole).toBeDefined();
      expect(studyGroupRepo.findUserGroups).toBeDefined();
    });
  });

  describe('NotificationRepository', () => {
    it('should be defined', () => {
      expect(notificationRepo).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(notificationRepo.create).toBeDefined();
      expect(notificationRepo.findById).toBeDefined();
      expect(notificationRepo.update).toBeDefined();
      expect(notificationRepo.delete).toBeDefined();
      expect(notificationRepo.findMany).toBeDefined();
      expect(notificationRepo.findByUser).toBeDefined();
      expect(notificationRepo.markAsRead).toBeDefined();
      expect(notificationRepo.markAllAsRead).toBeDefined();
      expect(notificationRepo.getUnreadCount).toBeDefined();
      expect(notificationRepo.createBulk).toBeDefined();
    });
  });

  describe('ContentFlagRepository', () => {
    it('should be defined', () => {
      expect(contentFlagRepo).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(contentFlagRepo.create).toBeDefined();
      expect(contentFlagRepo.findById).toBeDefined();
      expect(contentFlagRepo.update).toBeDefined();
      expect(contentFlagRepo.delete).toBeDefined();
      expect(contentFlagRepo.findMany).toBeDefined();
      expect(contentFlagRepo.findByContent).toBeDefined();
      expect(contentFlagRepo.findPendingFlags).toBeDefined();
      expect(contentFlagRepo.findHighConfidenceFlags).toBeDefined();
      expect(contentFlagRepo.findCrisisFlags).toBeDefined();
      expect(contentFlagRepo.reviewFlag).toBeDefined();
      expect(contentFlagRepo.escalateFlag).toBeDefined();
      expect(contentFlagRepo.getFlagStats).toBeDefined();
    });
  });

  describe('StudySessionRepository', () => {
    it('should be defined', () => {
      expect(studySessionRepo).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(studySessionRepo.create).toBeDefined();
      expect(studySessionRepo.findById).toBeDefined();
      expect(studySessionRepo.update).toBeDefined();
      expect(studySessionRepo.delete).toBeDefined();
      expect(studySessionRepo.findMany).toBeDefined();
      expect(studySessionRepo.findByGroup).toBeDefined();
      expect(studySessionRepo.findUpcomingSessions).toBeDefined();
      expect(studySessionRepo.addAttendee).toBeDefined();
      expect(studySessionRepo.updateAttendeeStatus).toBeDefined();
      expect(studySessionRepo.removeAttendee).toBeDefined();
      expect(studySessionRepo.findUserSessions).toBeDefined();
    });
  });
});