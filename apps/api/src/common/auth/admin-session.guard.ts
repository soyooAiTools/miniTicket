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
      adminSessionId?: string;
      headers?: Record<string, string | string[] | undefined>;
    }>();

    const sessionToken = parseCookie(
      request.headers?.cookie,
      ADMIN_SESSION_COOKIE_NAME,
    );

    if (!sessionToken) {
      throw new UnauthorizedException('admin session expired');
    }

    const session = await this.prisma.adminSession.findFirst({
      select: {
        id: true,
        user: {
          select: {
            email: true,
            enabled: true,
            id: true,
            name: true,
            role: true,
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
      throw new UnauthorizedException('admin session expired');
    }

    request.adminSessionId = session.id;
    request.admin = {
      email: session.user.email,
      id: session.user.id,
      name: session.user.name,
      role: session.user.role as CurrentAdminPrincipal['role'],
    };

    return true;
  }
}
