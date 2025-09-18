import { IsOptional, IsString, MaxLength, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'Computer Science student passionate about AI and machine learning.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ required: false, example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ 
    required: false, 
    example: ['programming', 'machine-learning', 'web-development'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ 
    required: false,
    example: {
      allowAnonymousPosts: true,
      allowDirectMessages: true,
      allowMoodTracking: true,
      allowStressAnalysis: false
    }
  })
  @IsOptional()
  @IsObject()
  privacySettings?: {
    allowAnonymousPosts?: boolean;
    allowDirectMessages?: boolean;
    allowMoodTracking?: boolean;
    allowStressAnalysis?: boolean;
  };
}