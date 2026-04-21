import { ConflictException, NotFoundException } from '@nestjs/common';

import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  const prismaMock = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists admin users in reverse chronological order', async () => {
    (prismaMock.user.findMany as jest.Mock).mockResolvedValue([
      {
        createdAt: new Date('2026-04-20T08:00:00.000Z'),
        email: 'admin@miniticket.local',
        enabled: true,
        id: 'seed-admin-super',
        name: '超级管理员',
        role: 'ADMIN',
        updatedAt: new Date('2026-04-20T08:00:00.000Z'),
      },
    ]);

    const service = new AdminUsersService(prismaMock);
    const result = await service.listUsers();

    expect(result).toEqual([
      {
        createdAt: new Date('2026-04-20T08:00:00.000Z'),
        email: 'admin@miniticket.local',
        enabled: true,
        id: 'seed-admin-super',
        name: '超级管理员',
        role: 'ADMIN',
        updatedAt: new Date('2026-04-20T08:00:00.000Z'),
      },
    ]);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
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
  });

  it('creates an enabled admin user with a hashed password', async () => {
    (prismaMock.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaMock.user.create as jest.Mock).mockResolvedValue({
      createdAt: new Date('2026-04-21T08:00:00.000Z'),
      email: 'ops2@miniticket.local',
      enabled: true,
      id: 'user_ops_002',
      name: '票务运营 B',
      role: 'OPERATIONS',
      updatedAt: new Date('2026-04-21T08:00:00.000Z'),
    });

    const service = new AdminUsersService(prismaMock);
    const result = await service.createUser({
      email: 'ops2@miniticket.local',
      name: '票务运营 B',
      password: 'OpsOps123!',
      role: 'OPERATIONS',
    });

    expect(result).toMatchObject({
      email: 'ops2@miniticket.local',
      enabled: true,
      name: '票务运营 B',
      role: 'OPERATIONS',
    });
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: {
        email: 'ops2@miniticket.local',
      },
    });
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'ops2@miniticket.local',
        enabled: true,
        name: '票务运营 B',
        passwordHash: expect.stringMatching(/^[a-f0-9]{32}:[a-f0-9]{128}$/),
        role: 'OPERATIONS',
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
  });

  it('rejects duplicate emails', async () => {
    (prismaMock.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'existing-user',
    });

    const service = new AdminUsersService(prismaMock);

    await expect(
      service.createUser({
        email: 'admin@miniticket.local',
        name: '重复邮箱',
        password: 'Admin123!',
        role: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('updates an admin user enabled state', async () => {
    (prismaMock.user.update as jest.Mock).mockResolvedValue({
      createdAt: new Date('2026-04-21T08:00:00.000Z'),
      email: 'ops2@miniticket.local',
      enabled: false,
      id: 'user_ops_002',
      name: '票务运营 B',
      role: 'OPERATIONS',
      updatedAt: new Date('2026-04-21T09:00:00.000Z'),
    });

    const service = new AdminUsersService(prismaMock);
    const result = await service.setEnabled('user_ops_002', false);

    expect(result).toMatchObject({
      enabled: false,
      id: 'user_ops_002',
      role: 'OPERATIONS',
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      data: {
        enabled: false,
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
        id: 'user_ops_002',
      },
    });
  });

  it('maps update failures to a not found error', async () => {
    (prismaMock.user.update as jest.Mock).mockRejectedValue(
      new Error('missing'),
    );

    const service = new AdminUsersService(prismaMock);

    await expect(service.setEnabled('missing-user', true)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
