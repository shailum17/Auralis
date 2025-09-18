import { IsString, IsUUID, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ 
    example: 'I totally understand how you feel! The waiting is the worst part.',
    description: 'The content of the comment'
  })
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the post being commented on'
  })
  @IsUUID()
  postId: string;

  @ApiProperty({ 
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID of the parent comment (for replies)'
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ 
    required: false,
    example: true,
    description: 'Whether to comment anonymously'
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}