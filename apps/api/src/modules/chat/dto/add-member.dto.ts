import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the user to add to the channel'
  })
  @IsUUID()
  userId: string;
}