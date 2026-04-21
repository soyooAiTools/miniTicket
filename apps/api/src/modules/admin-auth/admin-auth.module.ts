import { Module } from '@nestjs/common';

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';

import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';

@Module({
  controllers: [AdminAuthController],
  exports: [AdminAuthService],
  providers: [AdminAuthService, AdminSessionGuard],
})
export class AdminAuthModule {}
