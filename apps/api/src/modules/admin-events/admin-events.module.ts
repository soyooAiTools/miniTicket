import { Module } from '@nestjs/common';

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';
import { PrismaModule } from '../../common/prisma/prisma.module';

import { AdminEventsController } from './admin-events.controller';
import { AdminEventsService } from './admin-events.service';

@Module({
  controllers: [AdminEventsController],
  imports: [PrismaModule],
  exports: [AdminEventsService],
  providers: [AdminEventsService, AdminSessionGuard],
})
export class AdminEventsModule {}
