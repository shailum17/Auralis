import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({ 
    required: false,
    example: 'Updated: Just finished my final exams! Feeling much better now.',
    description: 'The updated content of the post'
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiProperty({ 
    required: false,
    example: ['exams', 'relief', 'university'],
    description: 'Updated tags for the post'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}