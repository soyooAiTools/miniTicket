import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
} from '../../common/auth/admin-cookie';
import { AdminSessionGuard } from '../../common/auth/admin-session.guard';
import { CurrentAdmin } from '../../common/auth/current-admin.decorator';

import { AdminAuthService } from './admin-auth.service';

type AdminLoginBody = {
  email: string;
  password: string;
};

function parseLoginBody(body: unknown): AdminLoginBody {
  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as { email?: unknown }).email !== 'string' ||
    typeof (body as { password?: unknown }).password !== 'string'
  ) {
    throw new BadRequestException('邮箱和密码不能为空。');
  }

  const email = (body as { email: string }).email.trim();
  const password = (body as { password: string }).password;

  if (!email || typeof password !== 'string' || password.trim().length === 0) {
    throw new BadRequestException('邮箱和密码不能为空。');
  }

  return {
    email,
    password,
  };
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: any) {
    const payload = parseLoginBody(body);
    const result = await this.adminAuthService.login(payload);

    res.cookie(ADMIN_SESSION_COOKIE_NAME, result.sessionToken, {
      httpOnly: true,
      maxAge: ADMIN_SESSION_TTL_MS,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      user: result.user,
    };
  }

  @Post('logout')
  @UseGuards(AdminSessionGuard)
  async logout(
    @CurrentAdmin() admin: { id: string },
    @Req() request: { adminSessionId?: string },
    @Res({ passthrough: true }) res: any,
  ) {
    const sessionId = request.adminSessionId;

    if (!sessionId) {
      throw new BadRequestException('管理员登录已失效。');
    }

    await this.adminAuthService.logout(sessionId);
    res.clearCookie(ADMIN_SESSION_COOKIE_NAME, {
      path: '/',
    });

    return { ok: true };
  }

  @Get('me')
  @UseGuards(AdminSessionGuard)
  getMe(@CurrentAdmin() admin: unknown) {
    return { user: admin };
  }
}
