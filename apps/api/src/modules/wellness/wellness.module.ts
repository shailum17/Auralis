import { Module } from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { WellnessController } from './wellness.controller';
import { StressAnalysisService } from './services/stress-analysis.service';
import { EntryScoringService } from './services/entry-scoring.service';
import { WellnessNotificationService } from './notifications.service';
import { EmailModule } from '../../common/email/email.module';

@Module({
  imports: [EmailModule],
  providers: [WellnessService, StressAnalysisService, EntryScoringService, WellnessNotificationService],
  controllers: [WellnessController],
  exports: [WellnessService, StressAnalysisService, EntryScoringService, WellnessNotificationService],
})
export class WellnessModule {}