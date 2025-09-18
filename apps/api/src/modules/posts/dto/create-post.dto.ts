import { IsString, IsOptional, IsBoolean, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ 
    example: 'Just finished my final exams! Feeling relieved but also anxious about the results.',
    description: 'The content of the post'
  })
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ 
    required: false,
    example: true,
    description: 'Whether to post anonymously (publicly shows as "Anonymous" but privately linked to user)'
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({ 
    required: false,
    example: ['exams', 'stress', 'university'],
    description: 'Tags to categorize the post'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}