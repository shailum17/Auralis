import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWellnessSettingsDto {
  @ApiProperty({ 
    required: false, 
    example: true,
    description: 'Allow mood tracking and logging'
  })
  @IsOptional()
  @IsBoolean()
  trackMood?: boolean;

  @ApiProperty({ 
    required: false, 
    example: true,
    description: 'Allow stress level monitoring and analysis'
  })
  @IsOptional()
  @IsBoolean()
  trackStress?: boolean;

  @ApiProperty({ 
    required: false, 
    example: false,
    description: 'Share anonymized wellness data for research and platform improvement'
  })
  @IsOptional()
  @IsBoolean()
  shareWellnessData?: boolean;

  @ApiProperty({ 
    required: false, 
    example: true,
    description: 'Enable crisis detection and support alerts'
  })
  @IsOptional()
  @IsBoolean()
  crisisAlertsEnabled?: boolean;

  @ApiProperty({ 
    required: false, 
    example: true,
    description: 'Allow generation of personalized wellness insights'
  })
  @IsOptional()
  @IsBoolean()
  allowWellnessInsights?: boolean;
}