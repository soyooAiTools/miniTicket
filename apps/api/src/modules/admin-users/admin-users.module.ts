import { Module } from '@nestjs/common';

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

@Module({
  controllers: [AdminUsersController],
  exports: [AdminUsersService],
  providers: [AdminUsersService, AdminSessionGuard],
})
export class AdminUsersModule {}
