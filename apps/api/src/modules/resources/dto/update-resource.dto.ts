import { IsString, IsEnum, IsUrl, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceCategory } from '../../../common/types/enums';

export class UpdateResourceDto {
  @ApiProperty({ 
    required: false,
    example: 'Updated University Counseling Services',
    description: 'Updated title of the resource'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ 
    required: false,
    example: 'Updated description with new information',
    description: 'Updated description of the resource'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ 
    required: false,
    example: 'https://university.edu/counseling-updated',
    description: 'Updated URL to the resource'
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({ 
    required: false,
    enum: ResourceCategory,
    example: ResourceCategory.MENTAL_HEALTH,
    description: 'Updated category of the resource'
  })
  @IsOptional()
  @IsEnum(ResourceCategory)
  category?: ResourceCategory;

  @ApiProperty({ 
    required: false,
    example: 'en',
    description: 'Updated locale/language of the resource'
  })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ 
    required: false,
    example: true,
    description: 'Whether the resource is active'
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}