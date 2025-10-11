import { IsString, IsOptional, IsEmail, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnhancedLoginDto {
  @ApiProperty({ 
    example: 'user@university.edu', 
    description: 'Email address for login',
    required: false 
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ 
    example: 'john_doe', 
    description: 'Username for login',
    required: false 
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  password: string;
}