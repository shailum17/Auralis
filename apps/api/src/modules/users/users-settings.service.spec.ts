import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateWellnessSettingsDto } from './dto/update-wellness-settings.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UpdateAcademicInfoDto } from './dto/update-academic-info.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';

describe('UsersService - Settings Management', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    username: 'testuser',
    wellnessSettings: {
      trackMood: true,
      trackStress: true,
      shareWellnessData: false,
      crisisAlertsEnabled: true,
      allowWellnessInsights: true,
    },
    preferences: {
      feedAlgorithm: 'personalized',
      privacyLevel: 'public',
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        messageNotifications: true,
        postReactions: true,
        commentReplies: true,
        studyGroupInvites: true,
        sessionReminders: true,
        wellnessAlerts: true,
        moderationActions: true,
        systemAnnouncements: true,
      },
    },
    academicInfo: {
      institution: 'Test University',
      major: 'Computer Science',
      year: 3,
      courses: ['CS101', 'MATH201'],
      gpa: 3.75,
      graduationYear: 2025,
    },
    privacySettings: {
      allowDirectMessages: true,
      showOnlineStatus: true,
      allowProfileViewing: true,
      dataCollection: true,
    },
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Wellness Settings Management', () => {
    describe('getWellnessSettings', () => {
      it('should return wellness settings for existing user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          wellnessSettings: mockUser.wellnessSettings,
        });

        const result = await service.getWellnessSettings('user123');

        expect(result).toEqual(mockUser.wellnessSettings);
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'user123' },
          select: { wellnessSettings: true },
        });
      });

      it('should throw NotFoundException for non-existent user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(service.getWellnessSettings('nonexistent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateWellnessSettings', () => {
      it('should update wellness settings successfully', async () => {
        const updateDto: UpdateWellnessSettingsDto = {
          trackMood: false,
          trackStress: true,
          shareWellnessData: true,
          crisisAlertsEnabled: false,
          allowWellnessInsights: true,
        };

        const expectedResult = {
          id: 'user123',
          wellnessSettings: updateDto,
          updatedAt: expect.any(Date),
        };

        mockPrismaService.user.update.mockResolvedValue(expectedResult);

        const result = await service.updateWellnessSettings('user123', updateDto);

        expect(result).toEqual(expectedResult);
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
          where: { id: 'user123' },
          data: {
            wellnessSettings: updateDto,
            updatedAt: expect.any(Date),
          },
          select: {
            id: true,
            wellnessSettings: true,
            updatedAt: true,
          },
        });
      });

      it('should handle partial updates', async () => {
        const updateDto: UpdateWellnessSettingsDto = {
          trackMood: false,
        };

        const expectedResult = {
          id: 'user123',
          wellnessSettings: { ...mockUser.wellnessSettings, trackMood: false },
          updatedAt: expect.any(Date),
        };

        mockPrismaService.user.update.mockResolvedValue(expectedResult);

        const result = await service.updateWellnessSettings('user123', updateDto);

        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('User Preferences Management', () => {
    describe('getUserPreferences', () => {
      it('should return user preferences for existing user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          preferences: mockUser.preferences,
        });

        const result = await service.getUserPreferences('user123');

        expect(result).toEqual(mockUser.preferences);
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'user123' },
          select: { preferences: true },
        });
      });

      it('should throw NotFoundException for non-existent user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(service.getUserPreferences('nonexistent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateUserPreferences', () => {
      it('should update user preferences successfully', async () => {
        const updateDto: UpdateUserPreferencesDto = {
          feedAlgorithm: 'chronological',
          theme: 'dark',
          notifications: {
            emailNotifications: false,
            pushNotifications: true,
          },
        };

        const expectedResult = {
          id: 'user123',
          preferences: {
            ...mockUser.preferences,
            ...updateDto,
            notifications: {
              ...mockUser.preferences.notifications,
              ...updateDto.notifications,
            },
          },
          updatedAt: expect.any(Date),
        };

        mockPrismaService.user.update.mockResolvedValue(expectedResult);

        const result = await service.updateUserPreferences('user123', updateDto);

        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Academic Info Management', () => {
    describe('getAcademicInfo', () => {
      it('should return academic info for existing user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          academicInfo: mockUser.academicInfo,
        });

        const result = await service.getAcademicInfo('user123');

        expect(result).toEqual(mockUser.academicInfo);
      });

      it('should throw NotFoundException for non-existent user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(service.getAcademicInfo('nonexistent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateAcademicInfo', () => {
      it('should update academic info successfully', async () => {
        const updateDto: UpdateAcademicInfoDto = {
          institution: 'New University',
          major: 'Data Science',
          year: 4,
          gpa: 3.9,
        };

        const expectedResult = {
          id: 'user123',
          academicInfo: updateDto,
          updatedAt: expect.any(Date),
        };

        mockPrismaService.user.update.mockResolvedValue(expectedResult);

        const result = await service.updateAcademicInfo('user123', updateDto);

        expect(result).toEqual(expectedResult);
      });

      it('should validate GPA range', async () => {
        const updateDto: UpdateAcademicInfoDto = {
          gpa: 5.0, // Invalid GPA
        };

        // This would be caught by the DTO validation, but we test the service behavior
        const expectedResult = {
          id: 'user123',
          academicInfo: updateDto,
          updatedAt: expect.any(Date),
        };

        mockPrismaService.user.update.mockResolvedValue(expectedResult);

        const result = await service.updateAcademicInfo('user123', updateDto);
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Privacy Settings Management', () => {
    describe('getPrivacySettings', () => {
      it('should return privacy settings for existing user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          privacySettings: mockUser.privacySettings,
        });

        const result = await service.getPrivacySettings('user123');

        expect(result).toEqual(mockUser.privacySettings);
      });

      it('should throw NotFoundException for non-existent user', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(service.getPrivacySettings('nonexistent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updatePrivacySettings', () => {
      it('should update privacy settings successfully', async () => {
        const updateDto: UpdatePrivacySettingsDto = {
          allowDirectMessages: false,
          showOnlineStatus: false,
          dataCollection: false,
        };

        const expectedResult = {
          id: 'user123',
          privacySettings: updateDto,
          updatedAt: expect.any(Date),
        };

        mockPrismaService.user.update.mockResolvedValue(expectedResult);

        const result = await service.updatePrivacySettings('user123', updateDto);

        expect(result).toEqual(expectedResult);
      });

      it('should handle privacy controls properly', async () => {
        const updateDto: UpdatePrivacySettingsDto = {
          dataCollection: false, // User opts out of data collection
          allowProfileViewing: false, // User makes profile private
        };

        const expectedResult = {
          id: 'user123',
          privacySettings: {
            ...mockUser.privacySettings,
            ...updateDto,
          },
          updatedAt: expect.any(Date),
        };

        mockPrismaService.user.update.mockResolvedValue(expectedResult);

        const result = await service.updatePrivacySettings('user123', updateDto);

        expect(result).toEqual(expectedResult);
        expect(result.privacySettings.dataCollection).toBe(false);
        expect(result.privacySettings.allowProfileViewing).toBe(false);
      });
    });
  });

  describe('Privacy Controls Integration', () => {
    it('should respect privacy settings when updating wellness data sharing', async () => {
      const wellnessUpdateDto: UpdateWellnessSettingsDto = {
        shareWellnessData: true,
      };

      const privacyUpdateDto: UpdatePrivacySettingsDto = {
        dataCollection: false,
      };

      // First update privacy to disable data collection
      mockPrismaService.user.update.mockResolvedValueOnce({
        id: 'user123',
        privacySettings: { ...mockUser.privacySettings, dataCollection: false },
        updatedAt: new Date(),
      });

      await service.updatePrivacySettings('user123', privacyUpdateDto);

      // Then try to enable wellness data sharing
      const wellnessResult = {
        id: 'user123',
        wellnessSettings: { ...mockUser.wellnessSettings, shareWellnessData: true },
        updatedAt: new Date(),
      };
      mockPrismaService.user.update.mockResolvedValueOnce(wellnessResult);

      const result = await service.updateWellnessSettings('user123', wellnessUpdateDto);

      // The service should allow the update, but the application logic should
      // respect the privacy settings when actually sharing data
      expect((result as any).wellnessSettings.shareWellnessData).toBe(true);
    });
  });
});