import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityService } from './community.service';

@ApiTags('Community')
@Controller('community')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Get('preferences')
  @ApiOperation({ summary: 'Get user community preferences' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved successfully' })
  async getUserPreferences(@Request() req) {
    const userId = req.user.sub;
    return this.communityService.getUserPreferences(userId);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user community preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updateUserPreferences(
    @Request() req,
    @Body() updatePreferencesDto: {
      interests: string[];
      hasCompletedOnboarding?: boolean;
    }
  ) {
    const userId = req.user.sub;
    return this.communityService.updateUserPreferences(userId, updatePreferencesDto);
  }

  @Get('forums')
  @ApiOperation({ summary: 'Get available community forums' })
  @ApiResponse({ status: 200, description: 'Forums retrieved successfully' })
  async getForums() {
    return this.communityService.getForums();
  }

  @Get('personalized-feed')
  @ApiOperation({ summary: 'Get personalized forum feed based on user interests' })
  @ApiResponse({ status: 200, description: 'Personalized feed retrieved successfully' })
  async getPersonalizedFeed(@Request() req) {
    const userId = req.user.sub;
    return this.communityService.getPersonalizedFeed(userId);
  }

  @Post('onboarding/complete')
  @ApiOperation({ summary: 'Mark community onboarding as completed' })
  @ApiResponse({ status: 200, description: 'Onboarding completed successfully' })
  async completeOnboarding(
    @Request() req,
    @Body() completeOnboardingDto: { interests: string[] }
  ) {
    const userId = req.user.sub;
    return this.communityService.completeOnboarding(userId, completeOnboardingDto.interests);
  }
}