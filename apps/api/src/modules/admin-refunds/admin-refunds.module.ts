import { Module } from '@nestjs/common';

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { UpstreamTicketingGateway } from '../../common/vendors/upstream-ticketing.gateway';

import { AdminRefundsController } from './admin-refunds.controller';
import { AdminRefundsService } from './admin-refunds.service';

@Module({
  controllers: [AdminRefundsController],
  exports: [AdminRefundsService],
  imports: [PrismaModule],
  providers: [
    AdminRefundsService,
    AdminSessionGuard,
    UpstreamTicketingGateway,
  ],
})
export class AdminRefundsModule {}
