import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateWellnessSettingsDto } from './dto/update-wellness-settings.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UpdateAcademicInfoDto } from './dto/update-academic-info.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';

describe('UsersController - Settings Management', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getWellnessSettings: jest.fn(),
    updateWellnessSettings: jest.fn(),
    getUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
    getAcademicInfo: jest.fn(),
    updateAcademicInfo: jest.fn(),
    getPrivacySettings: jest.fn(),
    updatePrivacySettings: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'user123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Wellness Settings Endpoints', () => {
    describe('GET /users/wellness-settings', () => {
      it('should return wellness settings', async () => {
        const mockSettings = {
          trackMood: true,
          trackStress: true,
          shareWellnessData: false,
          crisisAlertsEnabled: true,
          allowWellnessInsights: true,
        };

        mockUsersService.getWellnessSettings.mockResolvedValue(mockSettings);

        const result = await controller.getWellnessSettings(mockRequest);

        expect(result).toEqual(mockSettings);
        expect(mockUsersService.getWellnessSettings).toHaveBeenCalledWith('user123');
      });
    });

    describe('PUT /users/wellness-settings', () => {
      it('should update wellness settings', async () => {
        const updateDto: UpdateWellnessSettingsDto = {
          trackMood: false,
          trackStress: true,
          shareWellnessData: true,
        };

        const mockResult = {
          id: 'user123',
          wellnessSettings: updateDto,
          updatedAt: new Date(),
        };

        mockUsersService.updateWellnessSettings.mockResolvedValue(mockResult);

        const result = await controller.updateWellnessSettings(mockRequest, updateDto);

        expect(result).toEqual(mockResult);
        expect(mockUsersService.updateWellnessSettings).toHaveBeenCalledWith('user123', updateDto);
      });
    });
  });

  describe('User Preferences Endpoints', () => {
    describe('GET /users/preferences', () => {
      it('should return user preferences', async () => {
        const mockPreferences = {
          feedAlgorithm: 'personalized',
          privacyLevel: 'public',
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
          },
        };

        mockUsersService.getUserPreferences.mockResolvedValue(mockPreferences);

        const result = await controller.getUserPreferences(mockRequest);

        expect(result).toEqual(mockPreferences);
        expect(mockUsersService.getUserPreferences).toHaveBeenCalledWith('user123');
      });
    });

    describe('PUT /users/preferences', () => {
      it('should update user preferences', async () => {
        const updateDto: UpdateUserPreferencesDto = {
          feedAlgorithm: 'chronological',
          theme: 'dark',
          notifications: {
            emailNotifications: false,
            pushNotifications: true,
          },
        };

        const mockResult = {
          id: 'user123',
          preferences: updateDto,
          updatedAt: new Date(),
        };

        mockUsersService.updateUserPreferences.mockResolvedValue(mockResult);

        const result = await controller.updateUserPreferences(mockRequest, updateDto);

        expect(result).toEqual(mockResult);
        expect(mockUsersService.updateUserPreferences).toHaveBeenCalledWith('user123', updateDto);
      });
    });
  });

  describe('Academic Info Endpoints', () => {
    describe('GET /users/academic-info', () => {
      it('should return academic info', async () => {
        const mockAcademicInfo = {
          institution: 'Test University',
          major: 'Computer Science',
          year: 3,
          courses: ['CS101', 'MATH201'],
          gpa: 3.75,
          graduationYear: 2025,
        };

        mockUsersService.getAcademicInfo.mockResolvedValue(mockAcademicInfo);

        const result = await controller.getAcademicInfo(mockRequest);

        expect(result).toEqual(mockAcademicInfo);
        expect(mockUsersService.getAcademicInfo).toHaveBeenCalledWith('user123');
      });
    });

    describe('PUT /users/academic-info', () => {
      it('should update academic info', async () => {
        const updateDto: UpdateAcademicInfoDto = {
          institution: 'New University',
          major: 'Data Science',
          year: 4,
          gpa: 3.9,
        };

        const mockResult = {
          id: 'user123',
          academicInfo: updateDto,
          updatedAt: new Date(),
        };

        mockUsersService.updateAcademicInfo.mockResolvedValue(mockResult);

        const result = await controller.updateAcademicInfo(mockRequest, updateDto);

        expect(result).toEqual(mockResult);
        expect(mockUsersService.updateAcademicInfo).toHaveBeenCalledWith('user123', updateDto);
      });
    });
  });

  describe('Privacy Settings Endpoints', () => {
    describe('GET /users/privacy-settings', () => {
      it('should return privacy settings', async () => {
        const mockPrivacySettings = {
          allowDirectMessages: true,
          showOnlineStatus: true,
          allowProfileViewing: true,
          dataCollection: true,
        };

        mockUsersService.getPrivacySettings.mockResolvedValue(mockPrivacySettings);

        const result = await controller.getPrivacySettings(mockRequest);

        expect(result).toEqual(mockPrivacySettings);
        expect(mockUsersService.getPrivacySettings).toHaveBeenCalledWith('user123');
      });
    });

    describe('PUT /users/privacy-settings', () => {
      it('should update privacy settings', async () => {
        const updateDto: UpdatePrivacySettingsDto = {
          allowDirectMessages: false,
          showOnlineStatus: false,
          dataCollection: false,
        };

        const mockResult = {
          id: 'user123',
          privacySettings: updateDto,
          updatedAt: new Date(),
        };

        mockUsersService.updatePrivacySettings.mockResolvedValue(mockResult);

        const result = await controller.updatePrivacySettings(mockRequest, updateDto);

        expect(result).toEqual(mockResult);
        expect(mockUsersService.updatePrivacySettings).toHaveBeenCalledWith('user123', updateDto);
      });
    });
  });

  describe('Privacy Controls Integration', () => {
    it('should handle privacy-aware wellness settings updates', async () => {
      const wellnessDto: UpdateWellnessSettingsDto = {
        shareWellnessData: true,
      };

      const privacyDto: UpdatePrivacySettingsDto = {
        dataCollection: false,
      };

      // First update privacy settings
      const privacyResult = {
        id: 'user123',
        privacySettings: { ...privacyDto, allowDirectMessages: true },
        updatedAt: new Date(),
      };

      mockUsersService.updatePrivacySettings.mockResolvedValue(privacyResult);

      const privacyUpdateResult = await controller.updatePrivacySettings(mockRequest, privacyDto);
      expect(privacyUpdateResult).toEqual(privacyResult);

      // Then update wellness settings
      const wellnessResult = {
        id: 'user123',
        wellnessSettings: { ...wellnessDto, trackMood: true },
        updatedAt: new Date(),
      };

      mockUsersService.updateWellnessSettings.mockResolvedValue(wellnessResult);

      const wellnessUpdateResult = await controller.updateWellnessSettings(mockRequest, wellnessDto);
      expect(wellnessUpdateResult).toEqual(wellnessResult);

      // Verify both services were called correctly
      expect(mockUsersService.updatePrivacySettings).toHaveBeenCalledWith('user123', privacyDto);
      expect(mockUsersService.updateWellnessSettings).toHaveBeenCalledWith('user123', wellnessDto);
    });
  });
});