import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { UserRole } from '../../common/types/enums';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Get user growth statistics (Admin only)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze' })
  @ApiResponse({ status: 200, description: 'User growth stats retrieved successfully' })
  async getUserGrowthStats(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getUserGrowthStats(daysNum);
  }

  @Get('content')
  @ApiOperation({ summary: 'Get content statistics (Admin only)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze' })
  @ApiResponse({ status: 200, description: 'Content stats retrieved successfully' })
  async getContentStats(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getContentStats(daysNum);
  }

  @Get('wellness')
  @ApiOperation({ summary: 'Get wellness statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Wellness stats retrieved successfully' })
  async getWellnessStats() {
    return this.analyticsService.getWellnessStats();
  }

  @Get('engagement')
  @ApiOperation({ summary: 'Get engagement statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Engagement stats retrieved successfully' })
  async getEngagementStats() {
    return this.analyticsService.getEngagementStats();
  }
}