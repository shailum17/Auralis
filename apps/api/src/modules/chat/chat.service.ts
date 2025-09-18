import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChannelType } from '../../common/types/enums';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChannel(userId: string, createChannelDto: CreateChannelDto) {
    const { name, type, memberIds } = createChannelDto;

    // For direct messages, ensure only 2 members
    if (type === ChannelType.DIRECT_MESSAGE && memberIds.length !== 1) {
      throw new ForbiddenException('Direct messages must have exactly 2 members');
    }

    // Check if DM channel already exists
    if (type === ChannelType.DIRECT_MESSAGE) {
      const existingChannel = await this.prisma.chatChannel.findFirst({
        where: {
          type: ChannelType.DIRECT_MESSAGE,
          members: {
            every: {
              userId: {
                in: [userId, memberIds[0]],
              },
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (existingChannel && existingChannel.members.length === 2) {
        return existingChannel;
      }
    }

    const channel = await this.prisma.chatChannel.create({
      data: {
        name,
        type,
        members: {
          create: [
            { userId, role: 'ADMIN' },
            ...memberIds.map(memberId => ({ userId: memberId, role: 'MEMBER' as const })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return channel;
  }

  async getUserChannels(userId: string) {
    const channels = await this.prisma.chatChannel.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                lastActive: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return channels.map(channel => ({
      ...channel,
      lastMessage: channel.messages[0] || null,
      messages: undefined, // Remove messages array, keep only lastMessage
    }));
  }

  async getChannelMessages(channelId: string, userId: string, limit = 50, offset = 0) {
    // Verify user is member of channel
    const membership = await this.prisma.chatChannelMember.findFirst({
      where: {
        channelId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        channelId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return messages.reverse(); // Return in chronological order
  }

  async sendMessage(userId: string, sendMessageDto: SendMessageDto) {
    const { channelId, content } = sendMessageDto;

    // Verify user is member of channel
    const membership = await this.prisma.chatChannelMember.findFirst({
      where: {
        channelId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    // Use a transaction to ensure message creation and channel update are atomic
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          channelId,
          senderId: userId,
          content,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.chatChannel.update({
        where: { id: channelId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return message;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return { message: 'Message deleted successfully' };
  }

  async addMemberToChannel(channelId: string, userId: string, newMemberId: string) {
    // Verify user is admin of channel
    const membership = await this.prisma.chatChannelMember.findFirst({
      where: {
        channelId,
        userId,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new ForbiddenException('Only channel admins can add members');
    }

    // Check if channel is group chat
    const channel = await this.prisma.chatChannel.findUnique({
      where: { id: channelId },
    });

    if (channel?.type === ChannelType.DIRECT_MESSAGE) {
      throw new ForbiddenException('Cannot add members to direct messages');
    }

    // Add member
    const newMember = await this.prisma.chatChannelMember.create({
      data: {
        channelId,
        userId: newMemberId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return newMember;
  }

  async leaveChannel(channelId: string, userId: string) {
    const membership = await this.prisma.chatChannelMember.findFirst({
      where: {
        channelId,
        userId,
      },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this channel');
    }

    await this.prisma.chatChannelMember.delete({
      where: { id: membership.id },
    });

    // If no members left, delete the channel
    const remainingMembers = await this.prisma.chatChannelMember.count({
      where: { channelId },
    });

    if (remainingMembers === 0) {
      await this.prisma.chatChannel.delete({
        where: { id: channelId },
      });
    }

    return { message: 'Left channel successfully' };
  }
}