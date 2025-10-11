import { IsString, IsOptional, IsEmail, IsEnum, Length, ValidateIf, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { OtpType } from './otp-request.dto';

export class OtpVerifyDto {
  @ApiProperty({ 
    example: 'user@university.edu', 
    description: 'Email address for OTP verification',
    required: false 
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @ValidateIf(o => !o.username)
  email?: string;

  @ApiProperty({ 
    example: 'john_doe', 
    description: 'Username for OTP verification',
    required: false 
  })
  @IsOptional()
  @IsString()
  @ValidateIf(o => !o.email)
  username?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @ApiProperty({ 
    example: 'LOGIN',
    description: 'Type of OTP verification',
    enum: OtpType
  })
  @IsEnum(OtpType)
  type: OtpType;

  @ApiProperty({ 
    example: true, 
    description: 'Remember user session',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  rememberMe?: boolean;

  @ApiProperty({ 
    example: 24, 
    description: 'Session duration in hours',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(720) // Max 30 days
  @Transform(({ value }) => parseInt(value))
  sessionDuration?: number;
}