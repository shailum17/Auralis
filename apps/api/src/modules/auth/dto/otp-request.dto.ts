import { IsString, IsOptional, IsEmail, IsEnum, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OtpType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  LOGIN = 'LOGIN',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_LOGIN = 'PASSWORD_LOGIN',
  REGISTRATION = 'REGISTRATION'
}

export class OtpRequestDto {
  @ApiProperty({ 
    example: 'user@university.edu', 
    description: 'Email address for OTP request',
    required: false 
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @ValidateIf(o => !o.username)
  email?: string;

  @ApiProperty({ 
    example: 'john_doe', 
    description: 'Username for OTP request',
    required: false 
  })
  @IsOptional()
  @IsString()
  @ValidateIf(o => !o.email)
  username?: string;

  @ApiProperty({ 
    example: 'LOGIN',
    description: 'Type of OTP request',
    enum: OtpType
  })
  @IsEnum(OtpType)
  type: OtpType;
}