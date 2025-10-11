import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseUtils } from './database.utils';

@Module({
  imports: [PrismaModule],
  providers: [DatabaseUtils],
  exports: [DatabaseUtils],
})
export class DatabaseModule {}