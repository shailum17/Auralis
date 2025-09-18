import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { 
  MlGatewayService, 
  TextAnalysisResponse, 
  BehaviorAnalysisResponse, 
  StressScoreResponse 
} from './ml-gateway.service';

// Define UserRole as string for SQLite compatibility
const UserRole = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
} as const;

@ApiTags('ML Gateway')
@Controller('ml')
export class MlGatewayController {
  constructor(private mlGatewayService: MlGatewayService) {}

  @Post('analyze-text')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analyze text content for sentiment, emotion, and safety' })
  @ApiResponse({ status: 200, description: 'Text analysis completed successfully' })
  async analyzeText(
    @Request() req,
    @Body() body: { text: string; context?: Record<string, any> }
  ): Promise<TextAnalysisResponse> {
    return this.mlGatewayService.analyzeText({
      text: body.text,
      user_id: req.user.id,
      context: body.context,
    });
  }

  @Post('analyze-behavior')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analyze user behavioral patterns' })
  @ApiResponse({ status: 200, description: 'Behavior analysis completed successfully' })
  async analyzeBehavior(
    @Request() req,
    @Body() body: { activity_data: Record<string, any>; time_window_days?: number }
  ): Promise<BehaviorAnalysisResponse> {
    return this.mlGatewayService.analyzeBehavior({
      user_id: req.user.id,
      activity_data: body.activity_data,
      time_window_days: body.time_window_days,
    });
  }

  @Post('stress-score')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate comprehensive stress score' })
  @ApiResponse({ status: 200, description: 'Stress score calculated successfully' })
  async calculateStressScore(
    @Request() req,
    @Body() body: { 
      text_features?: Record<string, number>; 
      behavior_features?: Record<string, number> 
    }
  ): Promise<StressScoreResponse> {
    return this.mlGatewayService.calculateStressScore({
      user_id: req.user.id,
      text_features: body.text_features,
      behavior_features: body.behavior_features,
    });
  }

  @Get('model-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ML model information (Admin only)' })
  @ApiResponse({ status: 200, description: 'Model information retrieved successfully' })
  async getModelInfo() {
    return this.mlGatewayService.getModelInfo();
  }

  @Get('health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check ML service health (Admin only)' })
  @ApiResponse({ status: 200, description: 'Health check completed' })
  async healthCheck() {
    const isHealthy = await this.mlGatewayService.healthCheck();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
}