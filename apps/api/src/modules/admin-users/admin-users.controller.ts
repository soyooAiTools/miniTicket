import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  adminUserCreateRequestSchema,
  adminUserRoleUpdateRequestSchema,
} from '../../../../../packages/contracts/src';
import { AdminSessionGuard } from '../../common/auth/admin-session.guard';
import { CurrentAdmin } from '../../common/auth/current-admin.decorator';

import { AdminUsersService } from './admin-users.service';

type CurrentAdminUser = {
  id: string;
  role: 'ADMIN' | 'OPERATIONS';
};

type CreateAdminUserBody = {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'OPERATIONS';
};

type UpdateAdminUserRoleBody = {
  role: 'ADMIN' | 'OPERATIONS';
};

type SetAdminUserEnabledBody = {
  enabled: boolean;
};

function parseCreateAdminUserBody(body: unknown): CreateAdminUserBody {
  const parsed = adminUserCreateRequestSchema.safeParse(body);

  if (!parsed.success) {
    throw new BadRequestException('账号信息不完整或格式不正确，请检查后重试。');
  }

  return parsed.data;
}

function parseUpdateAdminUserRoleBody(body: unknown): UpdateAdminUserRoleBody {
  const parsed = adminUserRoleUpdateRequestSchema.safeParse(body);

  if (!parsed.success) {
    throw new BadRequestException('Invalid admin user role payload.');
  }

  return parsed.data;
}

function parseSetEnabledBody(body: unknown): SetAdminUserEnabledBody {
  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as { enabled?: unknown }).enabled !== 'boolean'
  ) {
    throw new BadRequestException('启用状态不能为空。');
  }

  return {
    enabled: (body as { enabled: boolean }).enabled,
  };
}

@Controller('admin/users')
@UseGuards(AdminSessionGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  listUsers() {
    return this.adminUsersService.listUsers();
  }

  @Post()
  createUser(@CurrentAdmin() admin: CurrentAdminUser, @Body() body: unknown) {
    return this.adminUsersService.createUser(
      parseCreateAdminUserBody(body),
      admin.id,
      admin.role,
    );
  }

  @Patch(':userId')
  updateUserRole(
    @CurrentAdmin() admin: CurrentAdminUser,
    @Param('userId') userId: string,
    @Body() body: unknown,
  ) {
    const payload = parseUpdateAdminUserRoleBody(body);
    return this.adminUsersService.updateRole(
      userId,
      payload.role,
      admin.id,
      admin.role,
    );
  }

  @Patch(':userId/enabled')
  setEnabled(
    @CurrentAdmin() admin: CurrentAdminUser,
    @Param('userId') userId: string,
    @Body() body: unknown,
  ) {
    const payload = parseSetEnabledBody(body);
    return this.adminUsersService.setEnabled(
      userId,
      payload.enabled,
      admin.id,
      admin.role,
    );
  }
}
