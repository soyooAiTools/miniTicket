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

import { AdminSessionGuard } from '../../common/auth/admin-session.guard';

import { AdminUsersService } from './admin-users.service';

type CreateAdminUserBody = {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'OPERATIONS';
};

type SetAdminUserEnabledBody = {
  enabled: boolean;
};

function parseCreateAdminUserBody(body: unknown): CreateAdminUserBody {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('账号信息不完整。');
  }

  const email = (body as { email?: unknown }).email;
  const name = (body as { name?: unknown }).name;
  const password = (body as { password?: unknown }).password;
  const role = (body as { role?: unknown }).role;

  if (
    typeof email !== 'string' ||
    typeof name !== 'string' ||
    typeof password !== 'string' ||
    (role !== 'ADMIN' && role !== 'OPERATIONS')
  ) {
    throw new BadRequestException('账号信息不完整。');
  }

  if (!email.trim() || !name.trim() || !password.trim()) {
    throw new BadRequestException('账号信息不完整。');
  }

  return {
    email,
    name,
    password,
    role,
  };
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
  createUser(@Body() body: unknown) {
    return this.adminUsersService.createUser(parseCreateAdminUserBody(body));
  }

  @Patch(':userId/enabled')
  setEnabled(@Param('userId') userId: string, @Body() body: unknown) {
    const payload = parseSetEnabledBody(body);
    return this.adminUsersService.setEnabled(userId, payload.enabled);
  }
}
