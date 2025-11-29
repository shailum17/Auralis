import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WellnessService } from './wellness.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { CreateStressEntryDto } from './dto/create-stress-entry.dto';

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

  @Post('stress')
  @ApiOperation({ summary: 'Log a stress entry' })
  @ApiResponse({ status: 201, description: 'Stress entry created successfully' })
  async createStressEntry(@Request() req, @Body() createStressEntryDto: CreateStressEntryDto) {
    return this.wellnessService.createStressEntry(req.user.id, createStressEntryDto);
  }

  @Get('stress/history')
  @ApiOperation({ summary: 'Get stress history' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look back' })
  @ApiResponse({ status: 200, description: 'Stress history retrieved successfully' })
  async getStressHistory(@Request() req, @Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.wellnessService.getUserStressHistory(req.user.id, daysNum);
  }

  @Get('stress/analytics')
  @ApiOperation({ summary: 'Get stress analytics and patterns' })
  @ApiResponse({ status: 200, description: 'Stress analytics retrieved successfully' })
  async getStressAnalytics(@Request() req) {
    return this.wellnessService.getStressAnalytics(req.user.id);
  }

  @Post('sleep')
  @ApiOperation({ summary: 'Log a sleep entry' })
  @ApiResponse({ status: 201, description: 'Sleep entry created successfully' })
  async createSleepEntry(@Request() req, @Body() createSleepEntryDto: any) {
    return this.wellnessService.createSleepEntry(req.user.id, createSleepEntryDto);
  }

  @Get('sleep/history')
  @ApiOperation({ summary: 'Get sleep history' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look back' })
  @ApiResponse({ status: 200, description: 'Sleep history retrieved successfully' })
  async getSleepHistory(@Request() req, @Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.wellnessService.getUserSleepHistory(req.user.id, daysNum);
  }

  @Get('sleep/analytics')
  @ApiOperation({ summary: 'Get sleep analytics and patterns' })
  @ApiResponse({ status: 200, description: 'Sleep analytics retrieved successfully' })
  async getSleepAnalytics(@Request() req) {
    return this.wellnessService.getSleepAnalytics(req.user.id);
  }

  @Post('social')
  @ApiOperation({ summary: 'Log a social connection entry' })
  @ApiResponse({ status: 201, description: 'Social entry created successfully' })
  async createSocialEntry(@Request() req, @Body() createSocialEntryDto: any) {
    return this.wellnessService.createSocialEntry(req.user.id, createSocialEntryDto);
  }

  @Get('social/history')
  @ApiOperation({ summary: 'Get social connection history' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look back' })
  @ApiResponse({ status: 200, description: 'Social history retrieved successfully' })
  async getSocialHistory(@Request() req, @Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.wellnessService.getUserSocialHistory(req.user.id, daysNum);
  }

  @Get('social/analytics')
  @ApiOperation({ summary: 'Get social connection analytics and patterns' })
  @ApiResponse({ status: 200, description: 'Social analytics retrieved successfully' })
  async getSocialAnalytics(@Request() req) {
    return this.wellnessService.getSocialAnalytics(req.user.id);
  }

  @Post('goals')
  @ApiOperation({ summary: 'Set weekly wellness goals' })
  @ApiResponse({ status: 201, description: 'Goals saved successfully' })
  async setWeeklyGoals(@Request() req, @Body() body: { goals: any[] }) {
    return this.wellnessService.setWeeklyGoals(req.user.id, body.goals);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get weekly wellness goals' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  async getWeeklyGoals(@Request() req) {
    return this.wellnessService.getWeeklyGoals(req.user.id);
  }

  @Post('goals/track')
  @ApiOperation({ summary: 'Manually track goal progress by category' })
  @ApiResponse({ status: 200, description: 'Goal progress updated successfully' })
  async trackGoalProgress(@Request() req, @Body() body: { category: string; amount?: number }) {
    return this.wellnessService.trackGoalManually(req.user.id, body.category, body.amount || 1);
  }

  @Post('goals/increment')
  @ApiOperation({ summary: 'Increment a specific goal by name' })
  @ApiResponse({ status: 200, description: 'Goal incremented successfully' })
  async incrementGoal(@Request() req, @Body() body: { goalName: string; amount?: number }) {
    return this.wellnessService.incrementGoalByName(req.user.id, body.goalName, body.amount || 1);
  }
}