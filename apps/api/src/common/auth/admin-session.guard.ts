import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { type UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import {
  ADMIN_SESSION_COOKIE_NAME,
  hashSessionToken,
  parseCookie,
} from './admin-cookie';
import { type CurrentAdminPrincipal } from './current-admin.decorator';

function isAdminRole(role: UserRole): role is CurrentAdminPrincipal['role'] {
  return role === 'ADMIN' || role === 'OPERATIONS';
}

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      admin?: CurrentAdminPrincipal;
      headers?: Record<string, string | string[] | undefined>;
    }>();

    const sessionToken = parseCookie(
      request.headers?.cookie,
      ADMIN_SESSION_COOKIE_NAME,
    );

    if (!sessionToken) {
      throw new UnauthorizedException('管理员登录已失效。');
    }

    const session = await this.prisma.adminSession.findFirst({
      select: {
        user: {
          select: {
            createdAt: true,
            email: true,
            enabled: true,
            id: true,
            name: true,
            role: true,
            updatedAt: true,
          },
        },
      },
      where: {
        expiresAt: {
          gt: new Date(),
        },
        tokenHash: hashSessionToken(sessionToken),
      },
    });

    if (!session?.user?.enabled || !isAdminRole(session.user.role)) {
      throw new UnauthorizedException('管理员登录已失效。');
    }

    request.admin = {
      ...session.user,
      role: session.user.role as CurrentAdminPrincipal['role'],
    };

    return true;
  }
}
