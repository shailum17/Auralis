import { IsInt, Min, Max, IsOptional, IsArray, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStressEntryDto {
  @ApiProperty({ 
    example: 3,
    description: 'Stress level from 1 (minimal) to 5 (overwhelming)',
    minimum: 1,
    maximum: 5
  })
  @IsInt()
  @Min(1)
  @Max(5)
  stressLevel: number;

  @ApiProperty({ 
    required: false,
    example: ['Work deadlines', 'Exams', 'Financial concerns'],
    description: 'What is causing stress'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  triggers?: string[];

  @ApiProperty({ 
    required: false,
    example: ['Headache', 'Difficulty sleeping', 'Anxiety'],
    description: 'Physical or mental symptoms'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @ApiProperty({ 
    required: false,
    example: ['Deep breathing', 'Exercise', 'Talking to friend'],
    description: 'Coping strategies used'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  copingUsed?: string[];

  @ApiProperty({ 
    required: false,
    example: 'Feeling overwhelmed with multiple deadlines this week.',
    description: 'Additional notes about stress'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
