import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
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
        role: user.role,
        emailVerified: user.emailVerified,
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
        role: true,
        emailVerified: true,
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
        emailVerified: true,
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
        role: true,
        emailVerified: true,
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

  // Test email functionality
  async testEmail(email: string) {
    const otp = this.generateOtp();
    const success = await this.emailService.sendOtpEmail(email, otp, 'login');
    
    return {
      success,
      message: success 
        ? 'Test email sent successfully! Check your inbox.' 
        : 'Email sending failed. Check console logs for details.',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  // Helper methods
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async storeOtp(email: string, otp: string, expiresAt: Date, type: string) {
    // In production, use Redis or a dedicated OTP table
    // For now, we'll use a simple in-memory store (not recommended for production)
    const key = `${email}:${type}`;
    // This is a simplified implementation - use Redis in production
    global.otpStore = global.otpStore || new Map();
    global.otpStore.set(key, { otp, expiresAt });
  }

  private async validateOtp(email: string, otp: string, type: string): Promise<boolean> {
    const key = `${email}:${type}`;
    const stored = global.otpStore?.get(key);
    
    if (!stored) return false;
    if (new Date() > stored.expiresAt) {
      global.otpStore.delete(key);
      return false;
    }
    
    return stored.otp === otp;
  }

  private async clearOtp(email: string, type: string) {
    const key = `${email}:${type}`;
    global.otpStore?.delete(key);
  }


}