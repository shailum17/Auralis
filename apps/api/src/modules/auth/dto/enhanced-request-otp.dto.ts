import { IsString, IsOptional, IsEmail, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnhancedRequestOtpDto {
  @ApiProperty({ 
    example: 'user@university.edu', 
    description: 'Email address for OTP request',
    required: false 
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ 
    example: 'john_doe', 
    description: 'Username for OTP request',
    required: false 
  })
  @IsOptional()
  @IsString()
  username?: string;
}