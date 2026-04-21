import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type UserRole } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';

import { PrismaService } from '../../common/prisma/prisma.service';

type AdminUserRole = 'ADMIN' | 'OPERATIONS';

type AdminUserListItem = {
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toAdminRole(role: UserRole): AdminUserRole {
  if (role !== 'ADMIN' && role !== 'OPERATIONS') {
    throw new NotFoundException('后台账号不存在。');
  }

  return role;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${hash}`;
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(): Promise<AdminUserListItem[]> {
    const users = await this.prisma.user.findMany({
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

    return users.map((user) => ({
      ...user,
      role: toAdminRole(user.role),
    }));
  }

  async createUser(input: CreateAdminUserInput): Promise<AdminUserListItem> {
    const email = normalizeEmail(input.email);
    const existing = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existing) {
      throw new ConflictException('邮箱已存在。');
    }

    const user = await this.prisma.user.create({
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

    return {
      ...user,
      role: toAdminRole(user.role),
    };
  }

  async setEnabled(userId: string, enabled: boolean): Promise<AdminUserListItem> {
    try {
      const user = await this.prisma.user.update({
        data: {
          enabled,
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
        where: {
          id: userId,
        },
      });

      return {
        ...user,
        role: toAdminRole(user.role),
      };
    } catch {
      throw new NotFoundException('后台账号不存在。');
    }
  }
}
