import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FeedModule } from './modules/feed/feed.module';
import { ChatModule } from './modules/chat/chat.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WellnessModule } from './modules/wellness/wellness.module';
import { MlGatewayModule } from './modules/ml-gateway/ml-gateway.module';
import { CommunityModule } from './modules/community/community.module';
import { HealthModule } from './health/health.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    }]),
    
    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    FeedModule,
    ChatModule,
    ResourcesModule,
    ModerationModule,
    AnalyticsModule,
    WellnessModule,
    MlGatewayModule,
    CommunityModule,
    HealthModule,
    NewsletterModule,
  ],
})
export class AppModule {}