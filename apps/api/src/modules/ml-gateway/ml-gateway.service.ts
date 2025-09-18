import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface TextAnalysisRequest {
  text: string;
  user_id?: string;
  context?: Record<string, any>;
}

export interface TextAnalysisResponse {
  sentiment: Record<string, number>;
  emotion: Record<string, number>;
  toxicity_score: number;
  stress_indicators: string[];
  safety_flags: string[];
  processing_time_ms: number;
}

export interface BehaviorAnalysisRequest {
  user_id: string;
  activity_data: Record<string, any>;
  time_window_days?: number;
}

export interface BehaviorAnalysisResponse {
  activity_score: number;
  rhythm_changes: Record<string, number>;
  engagement_trend: string;
  anomaly_flags: string[];
  processing_time_ms: number;
}

export interface StressScoreRequest {
  user_id: string;
  text_features?: Record<string, number>;
  behavior_features?: Record<string, number>;
}

export interface StressScoreResponse {
  stress_score: number;
  confidence: number;
  contributing_factors: string[];
  recommendations: string[];
  processing_time_ms: number;
}

@Injectable()
export class MlGatewayService {
  private readonly mlClient: AxiosInstance;
  private readonly timeout: number;

  constructor() {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
    this.timeout = parseInt(process.env.ML_SERVICE_TIMEOUT || '5000', 10);

    this.mlClient = axios.create({
      baseURL: `${mlServiceUrl}/api/v1`,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.mlClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED') {
          throw new HttpException('ML service timeout', HttpStatus.REQUEST_TIMEOUT);
        }
        if (error.response?.status >= 500) {
          throw new HttpException('ML service error', HttpStatus.BAD_GATEWAY);
        }
        throw new HttpException(
          error.response?.data?.detail || 'ML service error',
          error.response?.status || HttpStatus.BAD_GATEWAY
        );
      }
    );
  }

  async analyzeText(request: TextAnalysisRequest): Promise<TextAnalysisResponse> {
    try {
      const response = await this.mlClient.post<TextAnalysisResponse>('/analyze-text', request);
      return response.data;
    } catch (error) {
      console.error('Text analysis failed:', error);
      throw error;
    }
  }

  async analyzeBehavior(request: BehaviorAnalysisRequest): Promise<BehaviorAnalysisResponse> {
    try {
      const response = await this.mlClient.post<BehaviorAnalysisResponse>('/analyze-behavior', request);
      return response.data;
    } catch (error) {
      console.error('Behavior analysis failed:', error);
      throw error;
    }
  }

  async calculateStressScore(request: StressScoreRequest): Promise<StressScoreResponse> {
    try {
      const response = await this.mlClient.post<StressScoreResponse>('/stress-score', request);
      return response.data;
    } catch (error) {
      console.error('Stress score calculation failed:', error);
      throw error;
    }
  }

  async getModelInfo(): Promise<any> {
    try {
      const response = await this.mlClient.get('/model-info');
      return response.data;
    } catch (error) {
      console.error('Failed to get model info:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.mlClient.get('/health');
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('ML service health check failed:', error);
      return false;
    }
  }

  // Convenience method for post content analysis
  async analyzePostContent(content: string, userId?: string): Promise<{
    isSafe: boolean;
    toxicityScore: number;
    stressIndicators: string[];
    recommendations: string[];
  }> {
    try {
      const textAnalysis = await this.analyzeText({
        text: content,
        user_id: userId,
        context: { type: 'post' }
      });

      const isSafe = textAnalysis.toxicity_score < 0.8 && 
                    !textAnalysis.safety_flags.includes('self_harm') &&
                    !textAnalysis.safety_flags.includes('violence');

      return {
        isSafe,
        toxicityScore: textAnalysis.toxicity_score,
        stressIndicators: textAnalysis.stress_indicators,
        recommendations: [], // Would be populated by stress score analysis
      };
    } catch (error) {
      // Fail safe - if ML service is down, allow content but log the error
      console.error('Content analysis failed, allowing content:', error);
      return {
        isSafe: true,
        toxicityScore: 0,
        stressIndicators: [],
        recommendations: [],
      };
    }
  }

  // Convenience method for user stress analysis
  async analyzeUserStress(userId: string, recentActivity: Record<string, any>): Promise<{
    stressScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    try {
      const [behaviorAnalysis, stressScore] = await Promise.all([
        this.analyzeBehavior({
          user_id: userId,
          activity_data: recentActivity,
          time_window_days: 7
        }),
        this.calculateStressScore({
          user_id: userId,
          behavior_features: recentActivity
        })
      ]);

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (stressScore.stress_score > 0.7) {
        riskLevel = 'high';
      } else if (stressScore.stress_score > 0.4) {
        riskLevel = 'medium';
      }

      return {
        stressScore: stressScore.stress_score,
        riskLevel,
        recommendations: stressScore.recommendations,
      };
    } catch (error) {
      console.error('User stress analysis failed:', error);
      // Return safe defaults
      return {
        stressScore: 0.3,
        riskLevel: 'low',
        recommendations: [],
      };
    }
  }
}