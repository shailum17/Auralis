import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ 
    example: 'Updated: I totally understand how you feel! The waiting is definitely the hardest part.',
    description: 'The updated content of the comment'
  })
  @IsString()
  @MaxLength(1000)
  content: string;
}