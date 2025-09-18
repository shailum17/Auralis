import { IsInt, Min, Max, IsOptional, IsArray, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMoodEntryDto {
  @ApiProperty({ 
    example: 4,
    description: 'Mood score from 1 (very low) to 5 (very high)',
    minimum: 1,
    maximum: 5
  })
  @IsInt()
  @Min(1)
  @Max(5)
  moodScore: number;

  @ApiProperty({ 
    required: false,
    example: ['stressed', 'tired', 'hopeful'],
    description: 'Tags describing current feelings'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    required: false,
    example: 'Had a good day overall, but feeling a bit anxious about tomorrow\'s presentation.',
    description: 'Optional notes about mood'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}