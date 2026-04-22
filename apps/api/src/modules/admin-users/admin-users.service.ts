import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scryptSync } from 'node:crypto';

import type { AdminUserListItem } from '../../../../../packages/contracts/src';
import { PrismaService } from '../../common/prisma/prisma.service';

type AdminUserRole = 'ADMIN' | 'OPERATIONS';

type AdminUserRecord = {
  createdAt: Date;
  email: string;
  enabled: boolean;
  id: string;
  name: string;
  role: AdminUserRole;
  updatedAt: Date;
};

type CreateAdminUserInput = {
  email: string;
  name: string;
  password: string;
  role: AdminUserRole;
};

type UpdateAdminUserRoleInput = {
  role: AdminUserRole;
};

function assertAdminAccountManager(actorRole: AdminUserRole) {
  if (actorRole !== 'ADMIN') {
    throw new ForbiddenException('Only ADMIN users can manage admin accounts.');
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${hash}`;
}

function serializeAdminUser(user: AdminUserRecord): AdminUserListItem {
  return {
    createdAt: user.createdAt.toISOString(),
    email: user.email,
    enabled: user.enabled,
    id: user.id,
    name: user.name,
    role: user.role,
    updatedAt: user.updatedAt.toISOString(),
  };
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(): Promise<AdminUserListItem[]> {
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'OPERATIONS'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
        email: true,
        enabled: true,
        id: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return users.map((user) => serializeAdminUser(user as AdminUserRecord));
  }

  async createUser(
    input: CreateAdminUserInput,
    actorUserId: string,
    actorRole: AdminUserRole,
  ): Promise<AdminUserListItem> {
    assertAdminAccountManager(actorRole);

    const email = normalizeEmail(input.email);
    const existing = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existing) {
      throw new ConflictException('邮箱已存在。');
    }

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email,
            enabled: true,
            name: input.name.trim(),
            passwordHash: hashPassword(input.password),
            role: input.role,
          },
          select: {
            createdAt: true,
            email: true,
            enabled: true,
            id: true,
            name: true,
            role: true,
            updatedAt: true,
          },
        });

        await tx.adminAuditLog.create({
          data: {
            action: 'ADMIN_USER_CREATED',
            payload: {
              email: createdUser.email,
              role: createdUser.role,
            },
            targetId: createdUser.id,
            targetType: 'ADMIN_USER',
            userId: actorUserId,
          },
        });

        return createdUser;
      });

      return serializeAdminUser(user as AdminUserRecord);
    } catch (error) {
      if ((error as { code?: string } | null)?.code === 'P2002') {
        throw new ConflictException('邮箱已存在。');
      }

      throw error;
    }
  }

  async updateRole(
    userId: string,
    input: UpdateAdminUserRoleInput['role'],
    actorUserId: string,
    actorRole: AdminUserRole,
  ): Promise<AdminUserListItem> {
    assertAdminAccountManager(actorRole);

    const user = await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        select: {
          createdAt: true,
          email: true,
          enabled: true,
          id: true,
          name: true,
          role: true,
          updatedAt: true,
        },
        where: {
          id: userId,
          role: {
            in: ['ADMIN', 'OPERATIONS'],
          },
        },
      });

      if (!existingUser) {
        throw new NotFoundException('Admin user not found.');
      }

      if (existingUser.role === input) {
        return existingUser;
      }

      const result = await tx.user.updateMany({
        data: {
          role: input,
        },
        where: {
          id: userId,
          role: {
            in: ['ADMIN', 'OPERATIONS'],
          },
        },
      });

      if (result.count === 0) {
        throw new NotFoundException('Admin user not found.');
      }

      const updatedUser = await tx.user.findFirst({
        select: {
          createdAt: true,
          email: true,
          enabled: true,
          id: true,
          name: true,
          role: true,
          updatedAt: true,
        },
        where: {
          id: userId,
          role: {
            in: ['ADMIN', 'OPERATIONS'],
          },
        },
      });

      if (!updatedUser) {
        throw new NotFoundException('Admin user not found.');
      }

      await tx.adminAuditLog.create({
        data: {
          action: 'ADMIN_USER_ROLE_UPDATED',
          payload: {
            nextRole: updatedUser.role,
            previousRole: existingUser.role,
          },
          targetId: updatedUser.id,
          targetType: 'ADMIN_USER',
          userId: actorUserId,
        },
      });

      return updatedUser;
    });

    return serializeAdminUser(user as AdminUserRecord);
  }

  async setEnabled(
    userId: string,
    enabled: boolean,
    actorUserId: string,
    actorRole: AdminUserRole,
  ): Promise<AdminUserListItem> {
    assertAdminAccountManager(actorRole);

    const user = await this.prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        data: {
          enabled,
        },
        where: {
          id: userId,
          role: {
            in: ['ADMIN', 'OPERATIONS'],
          },
        },
      });

      if (result.count === 0) {
        throw new NotFoundException('后台账号不存在。');
      }

      const updatedUser = await tx.user.findFirst({
        select: {
          createdAt: true,
          email: true,
          enabled: true,
          id: true,
          name: true,
          role: true,
          updatedAt: true,
        },
        where: {
          id: userId,
          role: {
            in: ['ADMIN', 'OPERATIONS'],
          },
        },
      });

      if (!updatedUser) {
        throw new NotFoundException('后台账号不存在。');
      }

      await tx.adminAuditLog.create({
        data: {
          action: enabled ? 'ADMIN_USER_ENABLED' : 'ADMIN_USER_DISABLED',
          payload: {
            enabled,
          },
          targetId: updatedUser.id,
          targetType: 'ADMIN_USER',
          userId: actorUserId,
        },
      });

      return updatedUser;
    });

    return serializeAdminUser(user as AdminUserRecord);
  }
}
