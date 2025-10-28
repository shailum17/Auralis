import { Controller, Post, Body, HttpCode, HttpStatus, Req, Get, Query, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EnhancedLoginDto } from './dto/enhanced-login.dto';
import { EnhancedRequestOtpDto } from './dto/enhanced-request-otp.dto';
import { EnhancedVerifyOtpDto } from './dto/enhanced-verify-otp.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { RegisterEnhancedDto } from './dto/register-enhanced.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 900000 } }) // 10 attempts per 15 minutes
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  // OTP Endpoints
  @Post('otp/request-login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiOperation({ summary: 'Request OTP for login' })
  @ApiResponse({ status: 200, description: 'Login OTP sent successfully' })
  @ApiResponse({ status: 401, description: 'User not found' })
  async requestLoginOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestLoginOtp(requestOtpDto);
  }

  @Post('otp/verify-login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  @ApiOperation({ summary: 'Verify OTP and login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyLoginOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyLoginOtp(verifyOtpDto);
  }

  @Post('otp/request-email-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiOperation({ summary: 'Request OTP for email verification' })
  @ApiResponse({ status: 200, description: 'Email verification OTP sent' })
  @ApiResponse({ status: 400, description: 'Email already verified' })
  async requestEmailVerificationOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestEmailVerificationOtp(requestOtpDto.email);
  }

  @Post('otp/verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  @ApiOperation({ summary: 'Verify email with OTP' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyEmailOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyEmailOtp(verifyOtpDto);
  }

  @Post('password/request-reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiOperation({ summary: 'Request OTP for password reset' })
  @ApiResponse({ status: 200, description: 'Password reset OTP sent' })
  @ApiResponse({ status: 401, description: 'User not found' })
  async requestPasswordResetOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestPasswordResetOtp(requestOtpDto);
  }

  @Post('password/verify-reset-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  @ApiOperation({ summary: 'Verify password reset OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified, reset token provided' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyPasswordResetOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyPasswordResetOtp(verifyOtpDto);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiOperation({ summary: 'Reset password with reset token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Password verification + OTP endpoints
  @Post('verify-password-request-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  @ApiOperation({ summary: 'Verify password and request OTP for secure login' })
  @ApiResponse({ status: 200, description: 'Password verified, OTP sent' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async verifyPasswordAndRequestOtp(@Body() loginDto: LoginDto) {
    return this.authService.verifyPasswordAndRequestOtp(loginDto);
  }

  @Post('verify-password-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  @ApiOperation({ summary: 'Verify OTP after password verification and complete login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyPasswordOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyPasswordOtp(verifyOtpDto);
  }

  // Enhanced endpoints that support both email and username authentication

  @Post('enhanced/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 900000 } }) // 10 attempts per 15 minutes
  @ApiOperation({ summary: 'Login with email or username and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async enhancedLogin(@Body() enhancedLoginDto: EnhancedLoginDto) {
    return this.authService.enhancedLogin(enhancedLoginDto);
  }

  @Post('enhanced/otp/request-login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiOperation({ summary: 'Request OTP for login using email or username' })
  @ApiResponse({ status: 200, description: 'Login OTP sent successfully' })
  @ApiResponse({ status: 401, description: 'User not found' })
  async enhancedRequestLoginOtp(@Body() enhancedRequestOtpDto: EnhancedRequestOtpDto) {
    return this.authService.enhancedRequestLoginOtp(enhancedRequestOtpDto);
  }

  @Post('enhanced/verify-password-request-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  @ApiOperation({ summary: 'Verify password (email or username) and request OTP for secure login' })
  @ApiResponse({ status: 200, description: 'Password verified, OTP sent' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async enhancedVerifyPasswordAndRequestOtp(@Body() enhancedLoginDto: EnhancedLoginDto) {
    return this.authService.enhancedVerifyPasswordAndRequestOtp(enhancedLoginDto);
  }

  @Post('enhanced/otp/verify-login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  @ApiOperation({ summary: 'Verify OTP and login (supports email/username with session preferences)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async enhancedVerifyLoginOtp(@Body() enhancedVerifyOtpDto: EnhancedVerifyOtpDto) {
    return this.authService.enhancedVerifyLoginOtp(enhancedVerifyOtpDto);
  }

  @Post('enhanced/verify-password-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  @ApiOperation({ summary: 'Verify OTP after password verification and complete login (supports session preferences)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async enhancedVerifyPasswordOtp(@Body() enhancedVerifyOtpDto: EnhancedVerifyOtpDto) {
    return this.authService.enhancedVerifyPasswordOtp(enhancedVerifyOtpDto);
  }

  // New OTP System Endpoints

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  @ApiOperation({ summary: 'Request OTP using new system' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or rate limited' })
  @ApiResponse({ status: 401, description: 'User not found' })
  async requestOtp(@Body() otpRequestDto: OtpRequestDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.requestOtp(otpRequestDto, ipAddress, userAgent);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 attempts per 5 minutes
  @ApiOperation({ summary: 'Verify OTP using new system' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 401, description: 'User not found' })
  async verifyOtp(@Body() otpVerifyDto: OtpVerifyDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.verifyOtp(otpVerifyDto, ipAddress, userAgent);
  }

  @Get('otp/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get OTP status' })
  @ApiResponse({ status: 200, description: 'OTP status retrieved' })
  async getOtpStatus(@Query('email') email: string, @Query('type') type: string) {
    return this.authService.getOtpStatus(email, type);
  }

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // 2 attempts per minute
  @ApiOperation({ summary: 'Test email configuration (development only)' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  async testEmail(@Body() testEmailDto: { email: string }) {
    return this.authService.testEmail(testEmailDto.email);
  }

  @Post('register-enhanced')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  @ApiOperation({ summary: 'Register a new user with enhanced profile data' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async registerEnhanced(@Body() registerDto: RegisterEnhancedDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.registerEnhanced(registerDto, ipAddress, userAgent);
  }

  @Post('send-otp-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 attempts per 5 minutes
  @ApiOperation({ summary: 'Send OTP via email' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtpEmail(@Body() sendOtpDto: { email: string; otp: string; type: string }) {
    return this.authService.sendOtpEmail(sendOtpDto.email, sendOtpDto.otp, sendOtpDto.type);
  }

  // Email communication endpoints
  @Post('email/send-welcome')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  @ApiOperation({ summary: 'Send welcome email with verification' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully' })
  async sendWelcomeEmail(@Body() welcomeEmailDto: { email: string; recipientName?: string; otp?: string }) {
    return this.authService.sendWelcomeEmail(welcomeEmailDto.email, welcomeEmailDto.recipientName, welcomeEmailDto.otp);
  }

  @Post('email/resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiOperation({ summary: 'Resend email verification OTP' })
  @ApiResponse({ status: 200, description: 'Verification email resent successfully' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async resendVerificationEmail(@Body() resendDto: { email: string; recipientName?: string }, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.resendVerificationEmail(resendDto.email, resendDto.recipientName, ipAddress, userAgent);
  }

  @Post('email/resend-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiOperation({ summary: 'Resend OTP email' })
  @ApiResponse({ status: 200, description: 'OTP email resent successfully' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async resendOTPEmail(@Body() resendDto: { email: string; type: string; recipientName?: string }, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.resendOTPEmail(resendDto.email, resendDto.type, resendDto.recipientName, ipAddress, userAgent);
  }

  @Get('email/delivery-status/:emailId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get email delivery status' })
  @ApiResponse({ status: 200, description: 'Email delivery status retrieved' })
  async getEmailDeliveryStatus(@Query('emailId') emailId: string) {
    return this.authService.getEmailDeliveryStatus(emailId);
  }

  // Admin Management Endpoints
  @Post('admin/setup')
  @ApiOperation({ summary: 'Create admin user' })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or user already exists' })
  async createAdminUser(@Body() createAdminDto: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: 'ADMIN' | 'MODERATOR';
  }) {
    console.log('🔧 Admin setup request received');
    
    try {
      const admin = await this.authService.createAdminUser(createAdminDto);
      console.log('✅ Admin user created successfully');
      
      return {
        success: true,
        message: 'Admin user created successfully',
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          createdAt: admin.createdAt
        }
      };
    } catch (error) {
      console.error('❌ Admin creation failed:', error);
      throw new BadRequestException(error.message || 'Failed to create admin user');
    }
  }

  @Get('admin/setup')
  @ApiOperation({ summary: 'Check if admin users exist' })
  @ApiResponse({ status: 200, description: 'Admin users check completed' })
  async checkAdminUsers() {
    console.log('🔍 Checking for existing admin users');
    
    try {
      const hasAdmins = await this.authService.hasAdminUsers();
      console.log('📊 Has admin users:', hasAdmins);
      
      return {
        success: true,
        hasAdmins,
        message: hasAdmins ? 'Admin users exist' : 'No admin users found'
      };
    } catch (error) {
      console.error('❌ Admin check failed:', error);
      throw new BadRequestException('Failed to check admin users');
    }
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or insufficient privileges' })
  async adminLogin(@Body() loginDto: { username: string; password: string }) {
    console.log('🔐 Admin login attempt:', loginDto.username);
    
    try {
      const authResult = await this.authService.authenticateAdmin(loginDto.username, loginDto.password);
      
      if (!authResult.success) {
        throw new UnauthorizedException(authResult.message || 'Admin login failed');
      }
      
      // Generate JWT token
      const payload = { 
        email: authResult.user.email, 
        sub: authResult.user.id,
        role: authResult.user.role 
      };
      
      const access_token = this.jwtService.sign(payload);
      console.log('✅ Admin login successful');
      
      return {
        success: true,
        message: 'Admin login successful',
        access_token,
        user: {
          id: authResult.user.id,
          email: authResult.user.email,
          username: authResult.user.username,
          fullName: authResult.user.fullName,
          role: authResult.user.role,
          emailVerified: authResult.user.emailVerified,
        }
      };
    } catch (error) {
      console.error('❌ Admin login failed:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(error.message || 'Admin login failed');
    }
  }

  @Get('admin/users')
  @ApiOperation({ summary: 'List admin users' })
  @ApiResponse({ status: 200, description: 'Admin users listed successfully' })
  async listAdminUsers() {
    console.log('📋 Listing admin users');
    
    try {
      const admins = await this.authService.listAdminUsers();
      console.log('✅ Admin users listed:', admins.length);
      
      return {
        success: true,
        admins,
        count: admins.length
      };
    } catch (error) {
      console.error('❌ Failed to list admin users:', error);
      throw new BadRequestException('Failed to list admin users');
    }
  }
}