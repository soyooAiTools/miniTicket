import { Module } from '@nestjs/common';

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { OrderTimelineService } from '../orders/order-timeline.service';

import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';

@Module({
  controllers: [AdminOrdersController],
  exports: [AdminOrdersService],
  imports: [PrismaModule],
  providers: [AdminOrdersService, AdminSessionGuard, OrderTimelineService],
})
export class AdminOrdersModule {}
