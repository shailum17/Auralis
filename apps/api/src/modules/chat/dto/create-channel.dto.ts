import { IsString, IsEnum, IsArray, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChannelType } from '../../../common/types/enums';

export class CreateChannelDto {
  @ApiProperty({ 
    required: false,
    example: 'Study Group - CS101',
    description: 'Name of the channel (optional for direct messages)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ 
    enum: ChannelType,
    example: ChannelType.GROUP_CHAT,
    description: 'Type of channel'
  })
  @IsEnum(ChannelType)
  type: ChannelType;

  @ApiProperty({ 
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Array of user IDs to add as members'
  })
  @IsArray()
  @IsUUID(4, { each: true })
  memberIds: string[];
}