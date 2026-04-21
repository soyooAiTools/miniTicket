import { Module } from '@nestjs/common';

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';
import { PrismaModule } from '../../common/prisma/prisma.module';

import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

@Module({
  controllers: [AdminDashboardController],
  imports: [PrismaModule],
  providers: [AdminDashboardService, AdminSessionGuard],
})
export class AdminDashboardModule {}
