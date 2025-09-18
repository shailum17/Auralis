import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ModerationService } from './moderation.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { ReportStatus, UserRole } from '../../common/types/enums';

@ApiTags('Moderation')
@Controller('moderation')
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Post('reports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  async createReport(@Request() req, @Body() createReportDto: CreateReportDto) {
    return this.moderationService.createReport(req.user.id, createReportDto);
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reports (Moderators only)' })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getReports(
    @Query('status') status?: ReportStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    
    return this.moderationService.getReports(status, limitNum, offsetNum);
  }

  @Get('reports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific report (Moderators only)' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getReport(@Param('id') id: string) {
    return this.moderationService.getReport(id);
  }

  @Put('reports/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update report status (Moderators only)' })
  @ApiResponse({ status: 200, description: 'Report status updated successfully' })
  async updateReportStatus(
    @Param('id') id: string,
    @Request() req,
    @Body('status') status: ReportStatus,
  ) {
    return this.moderationService.updateReportStatus(id, req.user.id, status);
  }

  @Post('actions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Take moderation action (Moderators only)' })
  @ApiResponse({ status: 201, description: 'Moderation action taken successfully' })
  async takeModerationAction(
    @Request() req,
    @Body() moderationActionDto: ModerationActionDto,
  ) {
    return this.moderationService.takeModerationAction(req.user.id, moderationActionDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get moderation statistics (Moderators only)' })
  @ApiResponse({ status: 200, description: 'Moderation stats retrieved successfully' })
  async getModerationStats() {
    return this.moderationService.getModerationStats();
  }

  @Get('users/:userId/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user moderation history (Moderators only)' })
  @ApiResponse({ status: 200, description: 'User moderation history retrieved successfully' })
  async getUserModerationHistory(@Param('userId') userId: string) {
    return this.moderationService.getUserModerationHistory(userId);
  }
}