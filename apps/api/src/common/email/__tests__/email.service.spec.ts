import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email.service';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let mockTransporter: any;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock transporter
    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn(),
    };

    mockNodemailer.createTransport.mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                SMTP_HOST: 'smtp.test.com',
                SMTP_PORT: 587,
                SMTP_USER: 'test@auralis.com',
                SMTP_PASS: 'test-password',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('Email Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create transporter with correct configuration', () => {
      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@auralis.com',
          pass: 'test-password',
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    });

    it('should verify transporter connection', () => {
      expect(mockTransporter.verify).toHaveBeenCalled();
    });
  });

  describe('sendOtpEmail (Legacy)', () => {
    it('should send OTP email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      const result = await service.sendOtpEmail('test@example.com', '123456', 'email_verification');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: {
          name: 'Auralis Student Community',
          address: 'test@auralis.com',
        },
        to: 'test@example.com',
        subject: expect.stringContaining('Verify Your Email'),
        html: expect.stringContaining('123456'),
      });
    });

    it('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const result = await service.sendOtpEmail('test@example.com', '123456', 'login');

      expect(result).toBe(false);
    });

    it('should return true when transporter is not configured', async () => {
      // Create service without transporter
      const moduleWithoutSMTP: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined), // No SMTP config
            },
          },
        ],
      }).compile();

      const serviceWithoutSMTP = moduleWithoutSMTP.get<EmailService>(EmailService);
      const result = await serviceWithoutSMTP.sendOtpEmail('test@example.com', '123456', 'login');

      expect(result).toBe(true); // Should return true for development
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with OTP', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'welcome-message-id',
      });

      const result = await service.sendWelcomeEmail('test@example.com', 'John Doe', '123456');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: {
          name: 'Auralis Student Community',
          address: 'test@auralis.com',
        },
        to: 'test@example.com',
        subject: expect.stringContaining('Welcome to Auralis'),
        html: expect.stringContaining('John Doe'),
        text: expect.stringContaining('John Doe'),
        headers: expect.objectContaining({
          'X-Tracking-ID': expect.stringContaining('welcome-'),
        }),
      });
    });

    it('should send welcome email without OTP', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'welcome-message-id',
      });

      const result = await service.sendWelcomeEmail('test@example.com', 'Jane Smith');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Welcome to Auralis'),
          html: expect.stringContaining('Jane Smith'),
        })
      );
    });
  });

  describe('sendOTPEmail (New Template System)', () => {
    it('should send email verification OTP', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'otp-message-id',
      });

      const result = await service.sendOTPEmail('test@example.com', '123456', 'EMAIL_VERIFICATION', 'John Doe');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: {
          name: 'Auralis Student Community',
          address: 'test@auralis.com',
        },
        to: 'test@example.com',
        subject: expect.stringContaining('Email Verification Code'),
        html: expect.stringContaining('123456'),
        text: expect.stringContaining('123456'),
        headers: expect.objectContaining({
          'X-Tracking-ID': expect.stringContaining('otp-EMAIL_VERIFICATION-'),
        }),
      });
    });

    it('should send login OTP', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'login-otp-id',
      });

      const result = await service.sendOTPEmail('test@example.com', '654321', 'LOGIN');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Login Verification Code'),
          html: expect.stringContaining('654321'),
        })
      );
    });

    it('should send password login OTP', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'password-login-id',
      });

      const result = await service.sendOTPEmail('test@example.com', '789012', 'PASSWORD_LOGIN');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Additional Security Verification'),
          html: expect.stringContaining('789012'),
        })
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with OTP', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'reset-message-id',
      });

      const result = await service.sendPasswordResetEmail('test@example.com', '123456', undefined, 'John Doe');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: {
          name: 'Auralis Student Community',
          address: 'test@auralis.com',
        },
        to: 'test@example.com',
        subject: expect.stringContaining('Reset Your Password'),
        html: expect.stringContaining('123456'),
        text: expect.stringContaining('123456'),
        headers: expect.objectContaining({
          'X-Tracking-ID': expect.stringContaining('password-reset-'),
        }),
      });
    });

    it('should send password reset email with reset link', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'reset-link-id',
      });

      const resetLink = 'https://example.com/reset?token=abc123';
      const result = await service.sendPasswordResetEmail('test@example.com', undefined, resetLink, 'John Doe');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(resetLink),
          text: expect.stringContaining(resetLink),
        })
      );
    });
  });

  describe('sendTemplatedEmailWithDetails', () => {
    it('should return detailed response on success', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'detailed-message-id',
      });

      const template = {
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      };

      const result = await service.sendTemplatedEmailWithDetails('test@example.com', template, 'test-tracking-id');

      expect(result).toEqual({
        success: true,
        messageId: 'detailed-message-id',
      });
    });

    it('should return error details on failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Connection Failed'));

      const template = {
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      };

      const result = await service.sendTemplatedEmailWithDetails('test@example.com', template);

      expect(result).toEqual({
        success: false,
        error: 'SMTP Connection Failed',
      });
    });
  });

  describe('getDeliveryStatus', () => {
    it('should return mock delivery status', async () => {
      const result = await service.getDeliveryStatus('test-message-id');

      expect(result).toEqual({
        status: 'delivered',
        deliveredAt: expect.any(Date),
      });
    });
  });

  describe('verifyConfiguration', () => {
    it('should return configured true when transporter is valid', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const result = await service.verifyConfiguration();

      expect(result).toEqual({
        configured: true,
      });
    });

    it('should return configured false when transporter verification fails', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('SMTP Auth Failed'));

      const result = await service.verifyConfiguration();

      expect(result).toEqual({
        configured: false,
        error: 'SMTP Auth Failed',
      });
    });

    it('should return configured false when no transporter', async () => {
      // Create service without transporter
      const moduleWithoutSMTP: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const serviceWithoutSMTP = moduleWithoutSMTP.get<EmailService>(EmailService);
      const result = await serviceWithoutSMTP.verifyConfiguration();

      expect(result).toEqual({
        configured: false,
        error: 'SMTP not configured. Check your environment variables.',
      });
    });
  });

  describe('Email Subject Generation', () => {
    it('should generate correct subjects for different OTP types', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test' });

      // Test email verification
      await service.sendOtpEmail('test@example.com', '123456', 'email_verification');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Verify Your Email - Auralis Student Community',
        })
      );

      // Test login
      await service.sendOtpEmail('test@example.com', '123456', 'login');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Your Login Code - Auralis Student Community',
        })
      );

      // Test password reset
      await service.sendOtpEmail('test@example.com', '123456', 'password_reset');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Password Reset Code - Auralis Student Community',
        })
      );
    });
  });
});