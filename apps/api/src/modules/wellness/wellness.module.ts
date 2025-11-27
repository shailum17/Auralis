import { Module } from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { WellnessController } from './wellness.controller';
import { StressAnalysisService } from './services/stress-analysis.service';
import { EntryScoringService } from './services/entry-scoring.service';

@Module({
  providers: [WellnessService, StressAnalysisService, EntryScoringService],
  controllers: [WellnessController],
  exports: [WellnessService, StressAnalysisService, EntryScoringService],
})
export class WellnessModule {}