import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FeedService, SortOption } from './feed.service';

@ApiTags('Feed')
@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get('main')
  @ApiOperation({ summary: 'Get main community feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: SortOption })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiResponse({ status: 200, description: 'Main feed retrieved successfully' })
  async getMainFeed(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sort') sort?: SortOption,
    @Query('tags') tags?: string | string[],
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const tagsArray = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;
    
    return this.feedService.getMainFeed(limitNum, offsetNum, sort, tagsArray);
  }

  @Get('topic/:topic')
  @ApiOperation({ summary: 'Get topic-specific feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: SortOption })
  @ApiResponse({ status: 200, description: 'Topic feed retrieved successfully' })
  async getTopicFeed(
    @Param('topic') topic: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sort') sort?: SortOption,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    
    return this.feedService.getTopicFeed(topic, limitNum, offsetNum, sort);
  }

  @Get('trending-tags')
  @ApiOperation({ summary: 'Get trending tags' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Trending tags retrieved successfully' })
  async getTrendingTags(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.feedService.getTrendingTags(limitNum);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get community feed statistics' })
  @ApiResponse({ status: 200, description: 'Feed statistics retrieved successfully' })
  async getFeedStats() {
    return this.feedService.getFeedStats();
  }
}