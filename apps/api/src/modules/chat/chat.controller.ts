import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddMemberDto } from './dto/add-member.dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('channels')
  @ApiOperation({ summary: 'Create a new chat channel' })
  @ApiResponse({ status: 201, description: 'Channel created successfully' })
  async createChannel(@Request() req, @Body() createChannelDto: CreateChannelDto) {
    return this.chatService.createChannel(req.user.id, createChannelDto);
  }

  @Get('channels')
  @ApiOperation({ summary: 'Get user channels' })
  @ApiResponse({ status: 200, description: 'Channels retrieved successfully' })
  async getUserChannels(@Request() req) {
    return this.chatService.getUserChannels(req.user.id);
  }

  @Get('channels/:channelId/messages')
  @ApiOperation({ summary: 'Get messages from a channel' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getChannelMessages(
    @Param('channelId') channelId: string,
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    
    return this.chatService.getChannelMessages(channelId, req.user.id, limitNum, offsetNum);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, sendMessageDto);
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  async deleteMessage(@Param('messageId') messageId: string, @Request() req) {
    return this.chatService.deleteMessage(messageId, req.user.id);
  }

  @Post('channels/:channelId/members')
  @ApiOperation({ summary: 'Add member to channel' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  async addMember(
    @Param('channelId') channelId: string,
    @Request() req,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.chatService.addMemberToChannel(channelId, req.user.id, addMemberDto.userId);
  }

  @Delete('channels/:channelId/leave')
  @ApiOperation({ summary: 'Leave a channel' })
  @ApiResponse({ status: 200, description: 'Left channel successfully' })
  async leaveChannel(@Param('channelId') channelId: string, @Request() req) {
    return this.chatService.leaveChannel(channelId, req.user.id);
  }
}