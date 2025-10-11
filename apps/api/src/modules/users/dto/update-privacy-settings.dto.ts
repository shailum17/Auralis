import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePrivacySettingsDto {
  @ApiProperty({ 
    required: false, 
    example: true,
    description: 'Allow other users to send direct messages'
  })
  @IsOptional()
  @IsBoolean()
  allowDirectMessages?: boolean;

  @ApiProperty({ 
    required: false, 
    example: true,
    description: 'Show online status to other users'
  })
  @IsOptional()
  @IsBoolean()
  showOnlineStatus?: boolean;

  @ApiProperty({ 
    required: false, 
    example: true,
    description: 'Allow other users to view profile'
  })
  @IsOptional()
  @IsBoolean()
  allowProfileViewing?: boolean;

  @ApiProperty({ 
    required: false, 
    example: true,
    description: 'Allow data collection for platform improvement'
  })
  @IsOptional()
  @IsBoolean()
  dataCollection?: boolean;
}