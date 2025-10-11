import { Controller, Get, Put, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateWellnessSettingsDto } from './dto/update-wellness-settings.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UpdateAcademicInfoDto } from './dto/update-academic-info.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity feed' })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  async getUserActivity(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    
    return this.usersService.getUserActivity(req.user.id, limitNum, offsetNum);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getUserStats(@Request() req) {
    return this.usersService.getUserStats(req.user.id);
  }

  @Get('wellness-settings')
  @ApiOperation({ summary: 'Get user wellness settings' })
  @ApiResponse({ status: 200, description: 'Wellness settings retrieved successfully' })
  async getWellnessSettings(@Request() req) {
    return this.usersService.getWellnessSettings(req.user.id);
  }

  @Put('wellness-settings')
  @ApiOperation({ summary: 'Update user wellness settings' })
  @ApiResponse({ status: 200, description: 'Wellness settings updated successfully' })
  async updateWellnessSettings(@Request() req, @Body() updateWellnessSettingsDto: UpdateWellnessSettingsDto) {
    return this.usersService.updateWellnessSettings(req.user.id, updateWellnessSettingsDto);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved successfully' })
  async getUserPreferences(@Request() req) {
    return this.usersService.getUserPreferences(req.user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences updated successfully' })
  async updateUserPreferences(@Request() req, @Body() updateUserPreferencesDto: UpdateUserPreferencesDto) {
    return this.usersService.updateUserPreferences(req.user.id, updateUserPreferencesDto);
  }

  @Get('academic-info')
  @ApiOperation({ summary: 'Get user academic information' })
  @ApiResponse({ status: 200, description: 'Academic information retrieved successfully' })
  async getAcademicInfo(@Request() req) {
    return this.usersService.getAcademicInfo(req.user.id);
  }

  @Put('academic-info')
  @ApiOperation({ summary: 'Update user academic information' })
  @ApiResponse({ status: 200, description: 'Academic information updated successfully' })
  async updateAcademicInfo(@Request() req, @Body() updateAcademicInfoDto: UpdateAcademicInfoDto) {
    return this.usersService.updateAcademicInfo(req.user.id, updateAcademicInfoDto);
  }

  @Get('privacy-settings')
  @ApiOperation({ summary: 'Get user privacy settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings retrieved successfully' })
  async getPrivacySettings(@Request() req) {
    return this.usersService.getPrivacySettings(req.user.id);
  }

  @Put('privacy-settings')
  @ApiOperation({ summary: 'Update user privacy settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings updated successfully' })
  async updatePrivacySettings(@Request() req, @Body() updatePrivacySettingsDto: UpdatePrivacySettingsDto) {
    return this.usersService.updatePrivacySettings(req.user.id, updatePrivacySettingsDto);
  }
}