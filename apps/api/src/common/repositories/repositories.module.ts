import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WellnessMetricRepository } from './wellness-metric.repository';
import { StudyGroupRepository } from './study-group.repository';
import { NotificationRepository } from './notification.repository';
import { ContentFlagRepository } from './content-flag.repository';
import { StudySessionRepository } from './study-session.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    WellnessMetricRepository,
    StudyGroupRepository,
    NotificationRepository,
    ContentFlagRepository,
    StudySessionRepository,
  ],
  exports: [
    WellnessMetricRepository,
    StudyGroupRepository,
    NotificationRepository,
    ContentFlagRepository,
    StudySessionRepository,
  ],
})
export class RepositoriesModule {}