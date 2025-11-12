import { Module } from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { WellnessController } from './wellness.controller';
import { StressAnalysisService } from './services/stress-analysis.service';

@Module({
  providers: [WellnessService, StressAnalysisService],
  controllers: [WellnessController],
  exports: [WellnessService, StressAnalysisService],
})
export class WellnessModule {}