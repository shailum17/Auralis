import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

import { ReactionType } from '../../common/types/enums';

interface PostWithAuthor {
  id: string;
  authorId: string;
  content: string;
  isAnonymous: boolean;
  tags: any;
  createdAt: Date;
  updatedAt: Date;
  isHidden: boolean;
  hiddenByModId: string | null;
  hideReason: string | null;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    comments: number;
    reactions: number;
  };
  reactions?: {
    id: string;
    reactionType: ReactionType;
    userId: string;
  }[];
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  async createPost(userId: string, createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        content: createPostDto.content,
        isAnonymous: createPostDto.isAnonymous || false,
        tags: JSON.stringify(createPostDto.tags || []),
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
            comments: true,
            reactions: true,
          },
        },
      },
    });

    // Return post with anonymized author if needed
    return this.formatPostResponse(post);
  }

  async getPosts(limit = 20, offset = 0, tags?: string[]) {
    const where = {
      isHidden: false,
    };

    // Fetch more posts if we need to filter by tags
    const fetchLimit = tags && tags.length > 0 ? limit * 2 : limit;

    const posts = await this.prisma.post.findMany({
      where,
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
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: fetchLimit,
      skip: offset,
    });

    let filteredPosts = posts;

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      filteredPosts = posts.filter((post: any) => {
        try {
          const postTags = post.tags ? JSON.parse(post.tags) : [];
          return tags.some((tag: string) => postTags.includes(tag));
        } catch {
          return false;
        }
      });
    }

    // Limit the results
    const limitedPosts = filteredPosts.slice(0, limit);

    return limitedPosts.map((post: any) => this.formatPostResponse(post));
  }

  async getPost(postId: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        reactions: {
          select: {
            id: true,
            reactionType: true,
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.isHidden) {
      throw new NotFoundException('Post not found');
    }

    const formattedPost = this.formatPostResponse(post);

    // Add user's reaction if authenticated
    if (userId && post.reactions) {
      const userReaction = post.reactions.find((r: any) => r.userId === userId);
      (formattedPost as any).userReaction = userReaction?.reactionType || null;
    }

    return formattedPost;
  }

  async updatePost(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    const existingPost = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    if (existingPost.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        content: updatePostDto.content,
        tags: updatePostDto.tags ? JSON.stringify(updatePostDto.tags) : undefined,
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
            comments: true,
            reactions: true,
          },
        },
      },
    });

    return this.formatPostResponse(post);
  }

  async deletePost(postId: string, userId: string) {
    const existingPost = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    if (existingPost.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }

  async addReaction(postId: string, userId: string, reactionType: ReactionType) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.isHidden) {
      throw new NotFoundException('Post not found');
    }

    // Remove existing reaction if any
    await this.prisma.reaction.deleteMany({
      where: {
        userId,
        targetId: postId,
        targetType: 'POST',
      },
    });

    // Add new reaction
    const reaction = await this.prisma.reaction.create({
      data: {
        userId,
        targetId: postId,
        targetType: 'POST',
        reactionType,
      },
    });

    return reaction;
  }

  async removeReaction(postId: string, userId: string) {
    await this.prisma.reaction.deleteMany({
      where: {
        userId,
        targetId: postId,
        targetType: 'POST',
      },
    });

    return { message: 'Reaction removed successfully' };
  }

  private formatPostResponse(post: any) {
    const { author, ...postData } = post;

    return {
      ...postData,
      author: post.isAnonymous
        ? {
          id: 'anonymous',
          username: 'Anonymous',
          avatarUrl: null,
        }
        : author,
    };
  }
}