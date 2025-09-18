import { IsString, IsEnum, IsUrl, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceCategory } from '../../../common/types/enums';

export class CreateResourceDto {
  @ApiProperty({ 
    example: 'University Counseling Services',
    description: 'Title of the resource'
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ 
    required: false,
    example: 'Free confidential counseling services available to all students',
    description: 'Description of the resource'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ 
    example: 'https://university.edu/counseling',
    description: 'URL to the resource'
  })
  @IsUrl()
  url: string;

  @ApiProperty({ 
    enum: ResourceCategory,
    example: ResourceCategory.MENTAL_HEALTH,
    description: 'Category of the resource'
  })
  @IsEnum(ResourceCategory)
  category: ResourceCategory;

  @ApiProperty({ 
    required: false,
    example: 'en',
    description: 'Locale/language of the resource'
  })
  @IsOptional()
  @IsString()
  locale?: string;
}