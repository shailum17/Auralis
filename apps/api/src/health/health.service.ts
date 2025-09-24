import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'student-community-api',
    };
  }

  async detailedCheck() {
    const checks = {
      database: await this.checkDatabase(),
      timestamp: new Date().toISOString(),
      service: 'student-community-api',
    };

    const isHealthy = Object.values(checks).every(
      check => typeof check === 'object' ? check.status === 'ok' : true
    );

    return {
      status: isHealthy ? 'ok' : 'error',
      ...checks,
    };
  }

  private async checkDatabase() {
    try {
      // For MongoDB, we'll use a simple findFirst query instead of raw SQL
      await this.prisma.user.findFirst({ take: 1 });
      return { status: 'ok', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'error', message: 'Database connection failed', error: error.message };
    }
  }
}