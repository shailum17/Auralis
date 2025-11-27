import { IsOptional, IsString, MaxLength, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiProperty({ required: false, example: 'Computer Science student passionate about AI and machine learning.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ required: false, example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ required: false, example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ required: false, example: 'they/them' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pronouns?: string;

  @ApiProperty({ required: false, example: 'San Francisco, CA' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

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
      allowDirectMessages: true,
      showOnlineStatus: true,
      allowProfileViewing: true,
      dataCollection: true
    }
  })
  @IsOptional()
  @IsObject()
  privacySettings?: {
    allowDirectMessages?: boolean;
    showOnlineStatus?: boolean;
    allowProfileViewing?: boolean;
    dataCollection?: boolean;
  };

  @ApiProperty({ 
    required: false,
    example: {
      trackMood: true,
      trackStress: false,
      shareWellnessData: false,
      crisisAlertsEnabled: true,
      allowWellnessInsights: true
    }
  })
  @IsOptional()
  @IsObject()
  wellnessSettings?: {
    trackMood?: boolean;
    trackStress?: boolean;
    shareWellnessData?: boolean;
    crisisAlertsEnabled?: boolean;
    allowWellnessInsights?: boolean;
  };

  @ApiProperty({ 
    required: false,
    example: {
      institution: 'University of Technology',
      major: 'Computer Science',
      year: 3,
      gpa: 3.75,
      graduationYear: 2025
    }
  })
  @IsOptional()
  @IsObject()
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
    courses?: string[];
    gpa?: number;
    graduationYear?: number;
  };
}