import { IsOptional, IsString, IsInt, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAcademicInfoDto {
  @ApiProperty({ 
    required: false, 
    example: 'University of Technology',
    description: 'Educational institution name'
  })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiProperty({ 
    required: false, 
    example: 'Computer Science',
    description: 'Major or field of study'
  })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiProperty({ 
    required: false, 
    example: 3,
    description: 'Current academic year (1-4 for undergraduate, 5+ for graduate)'
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  year?: number;

  @ApiProperty({ 
    required: false, 
    example: ['CS101', 'MATH201', 'PHYS150'],
    description: 'List of current courses',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courses?: string[];

  @ApiProperty({ 
    required: false, 
    example: 3.75,
    description: 'Grade Point Average (0.0-4.0 scale)'
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(4.0)
  gpa?: number;

  @ApiProperty({ 
    required: false, 
    example: 2025,
    description: 'Expected graduation year'
  })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2035)
  graduationYear?: number;
}