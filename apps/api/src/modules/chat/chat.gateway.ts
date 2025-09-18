import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.WEB_URL] 
      : ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      this.connectedUsers.set(client.id, payload.sub);

      // Join user to their channel rooms
      const channels = await this.chatService.getUserChannels(payload.sub);
      channels.forEach(channel => {
        client.join(`channel:${channel.id}`);
      });

      // Notify others that user is online
      client.broadcast.emit('user:online', { userId: payload.sub });

      console.log(`User ${payload.sub} connected to chat`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      
      // Notify others that user is offline
      client.broadcast.emit('user:offline', { userId });
      
      console.log(`User ${userId} disconnected from chat`);
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Not authenticated' };
      }

      const message = await this.chatService.sendMessage(client.userId, sendMessageDto);

      // Emit message to all channel members
      this.server.to(`channel:${sendMessageDto.channelId}`).emit('message:new', message);

      return { success: true, message };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    client.to(`channel:${data.channelId}`).emit('typing:start', {
      userId: client.userId,
      channelId: data.channelId,
    });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    client.to(`channel:${data.channelId}`).emit('typing:stop', {
      userId: client.userId,
      channelId: data.channelId,
    });
  }

  @SubscribeMessage('channel:join')
  async handleJoinChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    client.join(`channel:${data.channelId}`);
    return { success: true };
  }

  @SubscribeMessage('channel:leave')
  async handleLeaveChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    client.leave(`channel:${data.channelId}`);
    return { success: true };
  }

  // Method to notify channel members of new member
  async notifyChannelUpdate(channelId: string, event: string, data: any) {
    this.server.to(`channel:${channelId}`).emit(event, data);
  }

  // Method to get online users in a channel
  getOnlineUsersInChannel(channelId: string): string[] {
    const room = this.server.sockets.adapter.rooms.get(`channel:${channelId}`);
    if (!room) return [];

    const onlineUsers: string[] = [];
    room.forEach(socketId => {
      const userId = this.connectedUsers.get(socketId);
      if (userId) {
        onlineUsers.push(userId);
      }
    });

    return onlineUsers;
  }
}