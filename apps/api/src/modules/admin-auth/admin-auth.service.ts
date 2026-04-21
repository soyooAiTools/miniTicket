import { Injectable, UnauthorizedException } from '@nestjs/common';
import { type UserRole } from '@prisma/client';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import {
  ADMIN_SESSION_TTL_MS,
  createSessionToken,
  hashSessionToken,
} from '../../common/auth/admin-cookie';
import { type CurrentAdminPrincipal } from '../../common/auth/current-admin.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';

type AdminAuthLoginInput = {
  email: string;
  password: string;
};

type AdminAuthLoginResult = {
  sessionToken: string;
  user: CurrentAdminPrincipal;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isAdminRole(role: UserRole): role is CurrentAdminPrincipal['role'] {
  return role === 'ADMIN' || role === 'OPERATIONS';
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${hash}`;
}

@Injectable()
export class AdminAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(input: AdminAuthLoginInput): Promise<AdminAuthLoginResult> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: normalizeEmail(input.email),
      },
    });

    if (
      !user ||
      !user.enabled ||
      !isAdminRole(user.role) ||
      !this.verifyPassword(input.password, user.passwordHash)
    ) {
      throw new UnauthorizedException('邮箱或密码错误。');
    }

    const sessionToken = createSessionToken();

    await this.prisma.$transaction(async (tx) => {
      const session = await tx.adminSession.create({
        data: {
          expiresAt: new Date(Date.now() + ADMIN_SESSION_TTL_MS),
          tokenHash: hashSessionToken(sessionToken),
          userId: user.id,
        },
      });

      await tx.adminAuditLog.create({
        data: {
          action: 'ADMIN_LOGIN',
          payload: {
            sessionId: session.id,
          },
          targetId: session.id,
          targetType: 'ADMIN_SESSION',
          userId: user.id,
        },
      });
    });

    return {
      sessionToken,
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(sessionId: string) {
    await this.prisma.adminSession.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }

  verifyPassword(password: string, passwordHash: string) {
    const [salt, storedHash] = passwordHash.split(':');

    if (!salt || !storedHash) {
      return false;
    }

    const computedHash = scryptSync(password, salt, 64);
    const expectedHash = Buffer.from(storedHash, 'hex');

    if (expectedHash.length !== computedHash.length) {
      return false;
    }

    return timingSafeEqual(computedHash, expectedHash);
  }

  hashPassword(password: string) {
    return hashPassword(password);
  }
}
