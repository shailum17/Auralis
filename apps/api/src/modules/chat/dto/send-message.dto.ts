import { IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the channel to send message to'
  })
  @IsUUID()
  channelId: string;

  @ApiProperty({ 
    example: 'Hey everyone! How did the exam go?',
    description: 'Content of the message'
  })
  @IsString()
  @MaxLength(2000)
  content: string;
}