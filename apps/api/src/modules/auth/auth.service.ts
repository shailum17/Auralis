import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';
import { OtpService } from './services/otp.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EnhancedLoginDto } from './dto/enhanced-login.dto';
import { EnhancedRequestOtpDto } from './dto/enhanced-request-otp.dto';
import { EnhancedVerifyOtpDto } from './dto/enhanced-verify-otp.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private otpService: OtpService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        privacySettings: {
          allowDirectMessages: true,
          showOnlineStatus: true,
          allowProfileViewing: true,
          dataCollection: true,
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        interests: user.interests,
        role: user.role,
        emailVerified: user.emailVerified,
        academicInfo: user.academicInfo,
        preferences: user.preferences,
        wellnessSettings: user.wellnessSettings,
        privacySettings: user.privacySettings,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  // Enhanced validation that supports both email and username
  async validateUserByIdentifier(identifier: string, password: string) {
    // Try to find user by email first, then by username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  // Helper method to find user by email or username
  async findUserByIdentifier(identifier: string) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateJwtPayload(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        interests: true,
        role: true,
        emailVerified: true,
        academicInfo: true,
        preferences: true,
        wellnessSettings: true,
        privacySettings: true,
        createdAt: true,
        lastActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // OTP Functionality
  async requestEmailVerificationOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP (in production, use Redis or database)
    await this.storeOtp(email, otp, expiresAt, 'email_verification');

    // Send OTP via email
    await this.emailService.sendOtpEmail(email, otp, 'email_verification');

    return { message: 'OTP sent to your email' };
  }

  async requestLoginOtp(requestOtpDto: RequestOtpDto) {
    const { email } = requestOtpDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.storeOtp(email, otp, expiresAt, 'login');
    await this.emailService.sendOtpEmail(email, otp, 'login');

    return { message: 'Login OTP sent to your email' };
  }

  async requestPasswordResetOtp(requestOtpDto: RequestOtpDto) {
    const { email } = requestOtpDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.storeOtp(email, otp, expiresAt, 'password_reset');
    await this.emailService.sendOtpEmail(email, otp, 'password_reset');

    return { message: 'Password reset OTP sent to your email' };
  }

  async verifyEmailOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const isValid = await this.validateOtp(email, otp, 'email_verification');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark email as verified
    const user = await this.prisma.user.update({
      where: { email },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        interests: true,
        role: true,
        emailVerified: true,
        academicInfo: true,
        preferences: true,
        wellnessSettings: true,
        privacySettings: true,
        createdAt: true,
        lastActive: true,
      },
    });

    // Clear OTP
    await this.clearOtp(email, 'email_verification');

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  async verifyLoginOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const isValid = await this.validateOtp(email, otp, 'login');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        interests: true,
        role: true,
        emailVerified: true,
        academicInfo: true,
        preferences: true,
        wellnessSettings: true,
        privacySettings: true,
        createdAt: true,
        lastActive: true,
      },
    });

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    // Clear OTP
    await this.clearOtp(email, 'login');

    const tokens = await this.generateTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  async verifyPasswordResetOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const isValid = await this.validateOtp(email, otp, 'password_reset');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Generate temporary token for password reset
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password_reset' },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' }
    );

    // Clear OTP
    await this.clearOtp(email, 'password_reset');

    return {
      resetToken,
      message: 'OTP verified. You can now reset your password.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetPasswordDto;

    try {
      const payload = this.jwtService.verify(resetToken, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid reset token');
      }

      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      const user = await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash },
        select: {
          id: true,
          email: true,
          username: true,
        },
      });

      return {
        user,
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  // Password verification + OTP login methods
  async verifyPasswordAndRequestOtp(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // First verify the password
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate and send OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.storeOtp(email, otp, expiresAt, 'password-login');

    // Send OTP email
    const emailSent = await this.emailService.sendOtpEmail(email, otp, 'password-login');
    
    if (!emailSent) {
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      message: 'Password verified. OTP sent to your email for additional security.',
      email: email,
    };
  }

  async verifyPasswordOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    // Validate OTP
    const isValidOtp = await this.validateOtp(email, otp, 'password-login');
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        interests: true,
        role: true,
        emailVerified: true,
        academicInfo: true,
        preferences: true,
        wellnessSettings: true,
        privacySettings: true,
        createdAt: true,
        lastActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    // Clear the OTP
    await this.clearOtp(email, 'password-login');

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  // Enhanced authentication methods that support both email and username

  async enhancedLogin(loginDto: EnhancedLoginDto) {
    const { email, username, password } = loginDto;
    const identifier = email || username;

    if (!identifier) {
      throw new BadRequestException('Either email or username is required');
    }

    const user = await this.validateUserByIdentifier(identifier, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        interests: user.interests,
        role: user.role,
        emailVerified: user.emailVerified,
        academicInfo: user.academicInfo,
        preferences: user.preferences,
        wellnessSettings: user.wellnessSettings,
        privacySettings: user.privacySettings,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
      ...tokens,
    };
  }

  async enhancedRequestLoginOtp(requestOtpDto: EnhancedRequestOtpDto) {
    const { email, username } = requestOtpDto;
    const identifier = email || username;

    if (!identifier) {
      throw new BadRequestException('Either email or username is required');
    }

    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.storeOtp(user.email, otp, expiresAt, 'login');
    await this.emailService.sendOtpEmail(user.email, otp, 'login');

    return { 
      message: 'Login OTP sent to your email',
      email: user.email // Return the email for frontend display
    };
  }

  async enhancedVerifyPasswordAndRequestOtp(loginDto: EnhancedLoginDto) {
    const { email, username, password } = loginDto;
    const identifier = email || username;

    if (!identifier) {
      throw new BadRequestException('Either email or username is required');
    }

    // First verify the password
    const user = await this.validateUserByIdentifier(identifier, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate and send OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.storeOtp(user.email, otp, expiresAt, 'password-login');

    // Send OTP email
    const emailSent = await this.emailService.sendOtpEmail(user.email, otp, 'password-login');
    
    if (!emailSent) {
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      message: 'Password verified. OTP sent to your email for additional security.',
      email: user.email,
    };
  }

  async enhancedVerifyLoginOtp(verifyOtpDto: EnhancedVerifyOtpDto) {
    const { email, username, identifier, otp, rememberMe, sessionDuration } = verifyOtpDto;
    const userIdentifier = identifier || email || username;

    if (!userIdentifier) {
      throw new BadRequestException('User identifier is required');
    }

    const user = await this.findUserByIdentifier(userIdentifier);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.validateOtp(user.email, otp, 'login');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    // Clear OTP
    await this.clearOtp(user.email, 'login');

    // Generate tokens with custom expiration if rememberMe is enabled
    const tokens = await this.generateCustomTokens(user.id, rememberMe, sessionDuration);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        interests: user.interests,
        role: user.role,
        emailVerified: user.emailVerified,
        academicInfo: user.academicInfo,
        preferences: user.preferences,
        wellnessSettings: user.wellnessSettings,
        privacySettings: user.privacySettings,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
      ...tokens,
    };
  }

  async enhancedVerifyPasswordOtp(verifyOtpDto: EnhancedVerifyOtpDto) {
    const { email, username, identifier, otp, rememberMe, sessionDuration } = verifyOtpDto;
    const userIdentifier = identifier || email || username;

    if (!userIdentifier) {
      throw new BadRequestException('User identifier is required');
    }

    const user = await this.findUserByIdentifier(userIdentifier);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate OTP
    const isValidOtp = await this.validateOtp(user.email, otp, 'password-login');
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    // Clear the OTP
    await this.clearOtp(user.email, 'password-login');

    // Generate tokens with custom expiration if rememberMe is enabled
    const tokens = await this.generateCustomTokens(user.id, rememberMe, sessionDuration);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        interests: user.interests,
        role: user.role,
        emailVerified: user.emailVerified,
        academicInfo: user.academicInfo,
        preferences: user.preferences,
        wellnessSettings: user.wellnessSettings,
        privacySettings: user.privacySettings,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
      ...tokens,
    };
  }

  // Generate tokens with custom expiration
  private async generateCustomTokens(userId: string, rememberMe?: boolean, sessionDuration?: number) {
    const payload = { sub: userId };

    // Calculate expiration times
    let accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
    let refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    if (rememberMe && sessionDuration) {
      // Convert hours to appropriate time format
      const hours = Math.min(Math.max(sessionDuration, 1), 720); // Between 1 hour and 30 days
      accessTokenExpiry = `${hours}h`;
      refreshTokenExpiry = `${Math.min(hours * 2, 720)}h`; // Refresh token lasts twice as long, max 30 days
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: accessTokenExpiry,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: refreshTokenExpiry,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // New OTP System Methods

  /**
   * Request OTP using new system
   */
  async requestOtp(otpRequestDto: OtpRequestDto, ipAddress?: string, userAgent?: string) {
    const { email, username, type } = otpRequestDto;
    const identifier = email || username;

    if (!identifier) {
      throw new BadRequestException('Either email or username is required');
    }

    // Find user by identifier
    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check rate limiting
    const canRequest = await this.otpService.checkRateLimit(user.email, type);
    if (!canRequest) {
      throw new BadRequestException('Too many OTP requests. Please try again later.');
    }

    // Generate and send OTP
    const result = await this.otpService.generateAndSendOtp({
      email: user.email,
      userId: user.id,
      type: type as any,
      ipAddress,
      userAgent
    });

    if (!result.success) {
      throw new BadRequestException(result.error || 'Failed to send OTP');
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      email: user.email,
      otpId: result.otpId
    };
  }

  /**
   * Verify OTP using new system
   */
  async verifyOtp(otpVerifyDto: OtpVerifyDto, ipAddress?: string, userAgent?: string) {
    const { email, username, otp, type, rememberMe, sessionDuration } = otpVerifyDto;
    const identifier = email || username;

    if (!identifier) {
      throw new BadRequestException('Either email or username is required');
    }

    // Find user by identifier
    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify OTP
    const result = await this.otpService.verifyOtp({
      email: user.email,
      otp,
      type: type as any,
      ipAddress,
      userAgent
    });

    if (!result.success) {
      throw new BadRequestException(result.error || 'OTP verification failed');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    // Generate tokens with custom expiration if needed
    const tokens = await this.generateCustomTokens(user.id, rememberMe, sessionDuration);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        interests: user.interests,
        role: user.role,
        emailVerified: user.emailVerified,
        academicInfo: user.academicInfo,
        preferences: user.preferences,
        wellnessSettings: user.wellnessSettings,
        privacySettings: user.privacySettings,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
      ...tokens,
    };
  }

  /**
   * Get OTP status
   */
  async getOtpStatus(email: string, type: string) {
    return await this.otpService.getOtpStatus(email, type);
  }

  // Test email functionality
  async testEmail(email: string) {
    const result = await this.otpService.generateAndSendOtp({
      email,
      type: 'LOGIN'
    });
    
    return {
      success: result.success,
      message: result.success 
        ? 'Test email sent successfully! Check your inbox.' 
        : result.error || 'Email sending failed.',
      otpId: result.otpId,
    };
  }

  // Helper methods
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async storeOtp(email: string, otp: string, expiresAt: Date, type: string) {
    try {
      // Try to use database first
      const otpType = this.mapOtpType(type);
      
      // Delete any existing OTP for this email and type
      await this.prisma.$runCommandRaw({
        delete: 'otps',
        deletes: [{
          q: { email, type: otpType },
          limit: 0
        }]
      });

      // Create new OTP record
      await this.prisma.$runCommandRaw({
        insert: 'otps',
        documents: [{
          email,
          otp,
          type: otpType,
          expiresAt,
          createdAt: new Date(),
          isUsed: false
        }]
      });
    } catch (error) {
      console.error('Database OTP storage failed, using fallback:', error);
      // Fallback to in-memory store
      const key = `${email}:${type}`;
      global.otpStore = global.otpStore || new Map();
      global.otpStore.set(key, { otp, expiresAt });
    }
  }

  private async validateOtp(email: string, otp: string, type: string): Promise<boolean> {
    try {
      // Try database first
      const otpType = this.mapOtpType(type);
      
      const result = await this.prisma.$runCommandRaw({
        find: 'otps',
        filter: { email, type: otpType, isUsed: false }
      }) as any;

      if (result.cursor && result.cursor.firstBatch && result.cursor.firstBatch.length > 0) {
        const storedOtp = result.cursor.firstBatch[0];
        
        if (new Date() > new Date(storedOtp.expiresAt)) {
          // Clean up expired OTP
          await this.prisma.$runCommandRaw({
            delete: 'otps',
            deletes: [{
              q: { _id: storedOtp._id },
              limit: 1
            }]
          });
          return false;
        }

        if (storedOtp.otp === otp) {
          // Mark OTP as used
          await this.prisma.$runCommandRaw({
            update: 'otps',
            updates: [{
              q: { _id: storedOtp._id },
              u: { $set: { isUsed: true } }
            }]
          });
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Database OTP validation failed, using fallback:', error);
    }

    // Fallback to in-memory store
    const key = `${email}:${type}`;
    const stored = global.otpStore?.get(key);
    
    if (!stored) return false;
    if (new Date() > stored.expiresAt) {
      global.otpStore.delete(key);
      return false;
    }
    
    if (stored.otp === otp) {
      // Clear OTP from fallback store after successful validation
      global.otpStore.delete(key);
      return true;
    }
    
    return false;
  }

  private async clearOtp(email: string, type: string) {
    try {
      // Try database first
      const otpType = this.mapOtpType(type);
      
      await this.prisma.$runCommandRaw({
        delete: 'otps',
        deletes: [{
          q: { email, type: otpType },
          limit: 0
        }]
      });
    } catch (error) {
      console.error('Database OTP cleanup failed, using fallback:', error);
    }

    // Also clear from fallback store
    const key = `${email}:${type}`;
    global.otpStore?.delete(key);
  }

  private mapOtpType(type: string): string {
    const typeMap = {
      'email_verification': 'EMAIL_VERIFICATION',
      'login': 'LOGIN',
      'password_reset': 'PASSWORD_RESET',
      'password-login': 'PASSWORD_LOGIN',
    };
    
    return typeMap[type] || 'LOGIN';
  }

  async registerEnhanced(registerDto: any, ipAddress?: string, userAgent?: string) {
    const { 
      email, 
      password, 
      confirmPassword, 
      username, 
      fullName, 
      bio, 
      interests, 
      academicInfo, 
      acceptTerms 
    } = registerDto;

    // Validate required fields
    if (!email || !password || !username || !fullName || !acceptTerms) {
      throw new BadRequestException('Missing required fields: email, password, username, fullName, and acceptTerms are required');
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      throw new BadRequestException('You must accept the terms and conditions to register');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Prepare user data with defaults
    const userData = {
      email: email.toLowerCase(),
      username,
      passwordHash,
      fullName,
      bio: bio || null,
      interests: interests || [],
      emailVerified: false, // Will be set to true after OTP verification
      role: 'USER' as const,
      
      // Privacy settings with defaults
      privacySettings: {
        allowDirectMessages: true,
        showOnlineStatus: true,
        allowProfileViewing: true,
        dataCollection: true,
      },
      
      // Wellness settings with defaults
      wellnessSettings: {
        trackMood: false,
        trackStress: false,
        shareWellnessData: false,
        crisisAlertsEnabled: true,
        allowWellnessInsights: false,
      },
      
      // User preferences with defaults
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
        }
      },
      
      // Academic information (only if provided)
      ...(academicInfo && { academicInfo }),
      
      lastActive: new Date(),
    };

    try {
      // Create user in database
      const user = await this.prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          username: true,
          bio: true,
          interests: true,
          emailVerified: true,
          role: true,
          academicInfo: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log('✅ User created successfully in database:', {
        id: user.id,
        email: user.email,
        username: user.username,
        hasAcademicInfo: !!user.academicInfo,
        interestsCount: user.interests?.length || 0
      });

      // Generate and send OTP for email verification
      try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        await this.storeOtp(user.email, otp, expiresAt, 'email_verification');

        // Send OTP via email
        const emailSent = await this.emailService.sendOtpEmail(user.email, otp, 'email_verification');
        
        if (emailSent) {
          console.log('✅ Verification email sent successfully to:', user.email);
        } else {
          console.log('⚠️ Email sending failed, but OTP stored for manual verification');
        }

      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
        // Don't fail registration if email fails - user can still verify manually
      }

      return {
        success: true,
        data: {
          user,
          message: 'Account created successfully. Please check your email for verification code.'
        }
      };

    } catch (error) {
      console.error('Enhanced registration error:', error);
      throw new BadRequestException('Failed to create user account. Please try again.');
    }
  }

  async sendOtpEmail(email: string, otp: string, type: string) {
    try {
      const emailSent = await this.emailService.sendOtpEmail(email, otp, type);
      
      return {
        success: true,
        data: {
          message: emailSent ? 'OTP sent successfully via email' : 'OTP generated (email service unavailable)',
          emailSent
        }
      };
    } catch (error) {
      console.error('Send OTP email error:', error);
      return {
        success: false,
        error: 'Failed to send OTP email'
      };
    }
  }

  // Email communication methods
  async sendWelcomeEmail(email: string, recipientName?: string, otp?: string) {
    try {
      const emailSent = await this.emailService.sendWelcomeEmail(email, recipientName, otp);
      
      return {
        success: true,
        data: {
          message: emailSent ? 'Welcome email sent successfully' : 'Welcome email generated (email service unavailable)',
          emailSent,
          email
        }
      };
    } catch (error) {
      console.error('Send welcome email error:', error);
      return {
        success: false,
        error: 'Failed to send welcome email'
      };
    }
  }

  async resendVerificationEmail(email: string, recipientName?: string, ipAddress?: string, userAgent?: string) {
    try {
      // Check if user exists and needs verification
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, emailVerified: true }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.emailVerified) {
        throw new BadRequestException('Email already verified');
      }

      // Check rate limiting using OTP service
      const canRequest = await this.otpService.checkRateLimit(email, 'EMAIL_VERIFICATION');
      if (!canRequest) {
        throw new BadRequestException('Too many verification requests. Please try again later.');
      }

      // Generate new OTP and send welcome email
      const result = await this.otpService.generateAndSendOtp({
        email,
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        ipAddress,
        userAgent
      });

      if (!result.success) {
        throw new BadRequestException(result.error || 'Failed to send verification email');
      }

      return {
        success: true,
        data: {
          message: 'Verification email resent successfully',
          email,
          otpId: result.otpId
        }
      };
    } catch (error) {
      console.error('Resend verification email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend verification email'
      };
    }
  }

  async resendOTPEmail(email: string, type: string, recipientName?: string, ipAddress?: string, userAgent?: string) {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Map type to OTP service type
      const otpType = this.mapOtpType(type);

      // Check rate limiting
      const canRequest = await this.otpService.checkRateLimit(email, otpType);
      if (!canRequest) {
        throw new BadRequestException('Too many OTP requests. Please try again later.');
      }

      // Generate and send new OTP
      const result = await this.otpService.generateAndSendOtp({
        email,
        userId: user.id,
        type: otpType as any,
        ipAddress,
        userAgent
      });

      if (!result.success) {
        throw new BadRequestException(result.error || 'Failed to resend OTP email');
      }

      return {
        success: true,
        data: {
          message: 'OTP email resent successfully',
          email,
          otpId: result.otpId
        }
      };
    } catch (error) {
      console.error('Resend OTP email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend OTP email'
      };
    }
  }

  async getEmailDeliveryStatus(emailId: string) {
    try {
      // In a real implementation, this would check with the email service provider
      // For now, we'll return a mock status
      return {
        success: true,
        data: {
          emailId,
          status: 'delivered', // delivered, pending, failed, bounced
          deliveredAt: new Date(),
          attempts: 1
        }
      };
    } catch (error) {
      console.error('Get email delivery status error:', error);
      return {
        success: false,
        error: 'Failed to get email delivery status'
      };
    }
  }


}