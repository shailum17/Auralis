import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '../../../common/types/enums';

export class AddReactionDto {
  @ApiProperty({ 
    enum: ReactionType,
    example: ReactionType.LIKE,
    description: 'Type of reaction to add'
  })
  @IsEnum(ReactionType)
  reactionType: ReactionType;
}