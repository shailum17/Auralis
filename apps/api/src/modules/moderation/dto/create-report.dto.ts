import { IsString, IsEnum, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TargetType, ReportReason } from '../../../common/types/enums';

export class CreateReportDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the content or user being reported'
  })
  @IsUUID()
  targetId: string;

  @ApiProperty({ 
    enum: TargetType,
    example: TargetType.POST,
    description: 'Type of target being reported'
  })
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiProperty({ 
    enum: ReportReason,
    example: ReportReason.HARASSMENT,
    description: 'Reason for the report'
  })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiProperty({ 
    required: false,
    example: 'This post contains inappropriate content that violates community guidelines.',
    description: 'Additional details about the report'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}