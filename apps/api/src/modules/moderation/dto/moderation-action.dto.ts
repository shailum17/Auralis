import { IsString, IsEnum, IsUUID, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TargetType, ModerationActionType } from '../../../common/types/enums';

export class ModerationActionDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the content or user to moderate'
  })
  @IsUUID()
  targetId: string;

  @ApiProperty({ 
    enum: TargetType,
    example: TargetType.POST,
    description: 'Type of target being moderated'
  })
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiProperty({ 
    enum: ModerationActionType,
    example: ModerationActionType.HIDE_CONTENT,
    description: 'Type of moderation action to take'
  })
  @IsEnum(ModerationActionType)
  actionType: ModerationActionType;

  @ApiProperty({ 
    example: 'Content violates community guidelines regarding harassment.',
    description: 'Reason for the moderation action'
  })
  @IsString()
  @MaxLength(500)
  reason: string;

  @ApiProperty({ 
    required: false,
    example: '2024-01-01T00:00:00Z',
    description: 'When the action expires (for temporary actions like suspensions)'
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}