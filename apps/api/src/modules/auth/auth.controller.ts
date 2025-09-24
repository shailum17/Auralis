import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // 2 attempts per minute
  @ApiOperation({ summary: 'Test email configuration (development only)' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  async testEmail(@Body() testEmailDto: { email: string }) {
    return this.authService.testEmail(testEmailDto.email);
  }
}