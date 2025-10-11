import { IsOptional, IsString, IsIn, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  messageNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  postReactions?: boolean;

  @IsOptional()
  @IsBoolean()
  commentReplies?: boolean;

  @IsOptional()
  @IsBoolean()
  studyGroupInvites?: boolean;

  @IsOptional()
  @IsBoolean()
  sessionReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  wellnessAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  moderationActions?: boolean;

  @IsOptional()
  @IsBoolean()
  systemAnnouncements?: boolean;
}

export class UpdateUserPreferencesDto {
  @ApiProperty({ 
    required: false, 
    example: 'personalized',
    description: 'Feed algorithm preference',
    enum: ['chronological', 'personalized']
  })
  @IsOptional()
  @IsString()
  @IsIn(['chronological', 'personalized'])
  feedAlgorithm?: string;

  @ApiProperty({ 
    required: false, 
    example: 'public',
    description: 'Privacy level setting',
    enum: ['public', 'friends', 'private']
  })
  @IsOptional()
  @IsString()
  @IsIn(['public', 'friends', 'private'])
  privacyLevel?: string;

  @ApiProperty({ 
    required: false, 
    example: 'light',
    description: 'Theme preference',
    enum: ['light', 'dark', 'auto']
  })
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'auto'])
  theme?: string;

  @ApiProperty({ 
    required: false, 
    example: 'en',
    description: 'Language preference'
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ 
    required: false, 
    example: 'UTC',
    description: 'Timezone preference'
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ 
    required: false,
    description: 'Notification preferences',
    type: NotificationPreferencesDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notifications?: NotificationPreferencesDto;
}