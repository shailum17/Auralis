import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(userId: string, createCommentDto: CreateCommentDto) {
    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: createCommentDto.postId },
    });

    if (!post || post.isHidden) {
      throw new NotFoundException('Post not found');
    }

    // Verify parent comment exists if provided
    if (createCommentDto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentId },
      });

      if (!parentComment || parentComment.postId !== createCommentDto.postId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        authorId: userId,
        postId: createCommentDto.postId,
        parentId: createCommentDto.parentId,
        content: createCommentDto.content,
        isAnonymous: createCommentDto.isAnonymous || false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            replies: true,
            reactions: true,
          },
        },
      },
    });

    return this.formatCommentResponse(comment);
  }

  async getCommentsByPost(postId: string, limit = 50, offset = 0) {
    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        isHidden: false,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        replies: {
          where: { isHidden: false },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                reactions: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            replies: true,
            reactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return comments.map(comment => ({
      ...this.formatCommentResponse(comment),
      replies: comment.replies.map(reply => this.formatCommentResponse(reply)),
    }));
  }

  async updateComment(commentId: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }

    if (existingComment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const comment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: updateCommentDto.content,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            replies: true,
            reactions: true,
          },
        },
      },
    });

    return this.formatCommentResponse(comment);
  }

  async deleteComment(commentId: string, userId: string) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }

    if (existingComment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }

  private formatCommentResponse(comment: any) {
    const { author, ...commentData } = comment;

    return {
      ...commentData,
      author: comment.isAnonymous
        ? {
            id: 'anonymous',
            username: 'Anonymous',
            avatarUrl: null,
          }
        : author,
    };
  }
}