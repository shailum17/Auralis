import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';

export class CreateSocialEntryDto {
  @ApiProperty({ description: 'Social connection quality (1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  connectionQuality: number;

  @ApiProperty({ 
    description: 'Types of interactions', 
    required: false,
    example: ['In-person', 'Online', 'Phone call']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interactions?: string[];

  @ApiProperty({ 
    description: 'Social activities', 
    required: false,
    example: ['Study group', 'Hangout', 'Video chat']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activities?: string[];

  @ApiProperty({ 
    description: 'Feelings about social interactions', 
    required: false,
    example: ['Supported', 'Energized', 'Connected']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  feelings?: string[];

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
