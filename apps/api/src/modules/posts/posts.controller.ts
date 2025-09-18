import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AddReactionDto } from './dto/add-reaction.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(req.user.id, createPostDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get posts feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  async getPosts(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('tags') tags?: string | string[],
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const tagsArray = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;
    
    return this.postsService.getPosts(limitNum, offsetNum, tagsArray);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific post' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPost(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.postsService.getPost(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to edit this post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, req.user.id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(@Param('id') id: string, @Request() req) {
    return this.postsService.deletePost(id, req.user.id);
  }

  @Post(':id/reactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add reaction to a post' })
  @ApiResponse({ status: 201, description: 'Reaction added successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async addReaction(
    @Param('id') id: string,
    @Request() req,
    @Body() addReactionDto: AddReactionDto,
  ) {
    return this.postsService.addReaction(id, req.user.id, addReactionDto.reactionType);
  }

  @Delete(':id/reactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove reaction from a post' })
  @ApiResponse({ status: 200, description: 'Reaction removed successfully' })
  async removeReaction(@Param('id') id: string, @Request() req) {
    return this.postsService.removeReaction(id, req.user.id);
  }
}