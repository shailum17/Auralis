import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WellnessService } from './wellness.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';

@ApiTags('Wellness')
@Controller('wellness')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WellnessController {
  constructor(private wellnessService: WellnessService) {}

  @Post('mood')
  @ApiOperation({ summary: 'Log a mood entry' })
  @ApiResponse({ status: 201, description: 'Mood entry created successfully' })
  async createMoodEntry(@Request() req, @Body() createMoodEntryDto: CreateMoodEntryDto) {
    return this.wellnessService.createMoodEntry(req.user.id, createMoodEntryDto);
  }

  @Get('mood/history')
  @ApiOperation({ summary: 'Get mood history' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look back' })
  @ApiResponse({ status: 200, description: 'Mood history retrieved successfully' })
  async getMoodHistory(@Request() req, @Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.wellnessService.getUserMoodHistory(req.user.id, daysNum);
  }

  @Get('banners')
  @ApiOperation({ summary: 'Get personalized wellness banners' })
  @ApiResponse({ status: 200, description: 'Wellness banners retrieved successfully' })
  async getWellnessBanners(@Request() req) {
    return this.wellnessService.getWellnessBanners(req.user.id);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get wellness insights and trends' })
  @ApiResponse({ status: 200, description: 'Wellness insights retrieved successfully' })
  async getWellnessInsights(@Request() req) {
    return this.wellnessService.getWellnessInsights(req.user.id);
  }
}