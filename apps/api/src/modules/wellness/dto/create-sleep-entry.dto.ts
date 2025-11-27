import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';

export class CreateSleepEntryDto {
  @ApiProperty({ description: 'Sleep quality rating (1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  sleepQuality: number;

  @ApiProperty({ description: 'Hours of sleep', example: 7.5 })
  @IsNumber()
  @Min(0)
  @Max(24)
  hoursSlept: number;

  @ApiProperty({ description: 'Time went to bed (HH:MM)', required: false, example: '23:30' })
  @IsOptional()
  @IsString()
  bedTime?: string;

  @ApiProperty({ description: 'Time woke up (HH:MM)', required: false, example: '07:00' })
  @IsOptional()
  @IsString()
  wakeTime?: string;

  @ApiProperty({ 
    description: 'Sleep issues experienced', 
    required: false,
    example: ['Insomnia', 'Nightmares', 'Restless']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sleepIssues?: string[];

  @ApiProperty({ 
    description: 'Factors affecting sleep', 
    required: false,
    example: ['Caffeine', 'Stress', 'Screen time']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  factors?: string[];

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
