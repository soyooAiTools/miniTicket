import { Controller, Get, UseGuards } from '@nestjs/common';

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';

import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin/dashboard')
@UseGuards(AdminSessionGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('summary')
  getSummary() {
    return this.adminDashboardService.getSummary();
  }
}
