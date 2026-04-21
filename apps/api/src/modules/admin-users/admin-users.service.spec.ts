import { ConflictException, NotFoundException } from '@nestjs/common';

import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  const prismaMock = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists only admin users from the database', async () => {
    (prismaMock.user.findMany as jest.Mock).mockResolvedValue([
      {
        createdAt: new Date('2026-04-20T08:00:00.000Z'),
        email: 'admin@miniticket.local',
        enabled: true,
        id: 'seed-admin-super',
        name: 'Super Admin',
        role: 'ADMIN',
        updatedAt: new Date('2026-04-20T08:00:00.000Z'),
      },
      {
        createdAt: new Date('2026-04-20T09:00:00.000Z'),
        email: 'ops@miniticket.local',
        enabled: true,
        id: 'seed-admin-ops',
        name: 'Ops Lead',
        role: 'OPERATIONS',
        updatedAt: new Date('2026-04-20T09:00:00.000Z'),
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
        name: 'Super Admin',
        role: 'ADMIN',
        updatedAt: new Date('2026-04-20T08:00:00.000Z'),
      },
      {
        createdAt: new Date('2026-04-20T09:00:00.000Z'),
        email: 'ops@miniticket.local',
        enabled: true,
        id: 'seed-admin-ops',
        name: 'Ops Lead',
        role: 'OPERATIONS',
        updatedAt: new Date('2026-04-20T09:00:00.000Z'),
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
      where: {
        role: {
          in: ['ADMIN', 'OPERATIONS'],
        },
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
      name: 'Ops B',
      role: 'OPERATIONS',
      updatedAt: new Date('2026-04-21T08:00:00.000Z'),
    });

    const service = new AdminUsersService(prismaMock);
    const result = await service.createUser({
      email: 'ops2@miniticket.local',
      name: 'Ops B',
      password: 'OpsOps123!',
      role: 'OPERATIONS',
    });

    expect(result).toMatchObject({
      email: 'ops2@miniticket.local',
      enabled: true,
      name: 'Ops B',
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
        name: 'Ops B',
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
        name: 'Duplicate Email',
        password: 'Admin123!',
        role: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('updates only admin users when toggling enabled state', async () => {
    (prismaMock.user.updateMany as jest.Mock).mockResolvedValue({
      count: 1,
    });
    (prismaMock.user.findFirst as jest.Mock).mockResolvedValue({
      createdAt: new Date('2026-04-21T08:00:00.000Z'),
      email: 'ops2@miniticket.local',
      enabled: false,
      id: 'user_ops_002',
      name: 'Ops B',
      role: 'OPERATIONS',
      updatedAt: new Date('2026-04-21T09:00:00.000Z'),
    });

    const service = new AdminUsersService(prismaMock);
    const result = await service.setEnabled('user_ops_002', false);

    expect(result).toEqual({
      createdAt: new Date('2026-04-21T08:00:00.000Z'),
      email: 'ops2@miniticket.local',
      enabled: false,
      id: 'user_ops_002',
      name: 'Ops B',
      role: 'OPERATIONS',
      updatedAt: new Date('2026-04-21T09:00:00.000Z'),
    });
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      data: {
        enabled: false,
      },
      where: {
        id: 'user_ops_002',
        role: {
          in: ['ADMIN', 'OPERATIONS'],
        },
      },
    });
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
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
        role: {
          in: ['ADMIN', 'OPERATIONS'],
        },
      },
    });
  });

  it('rejects non-admin users when toggling enabled state', async () => {
    (prismaMock.user.updateMany as jest.Mock).mockResolvedValue({
      count: 0,
    });

    const service = new AdminUsersService(prismaMock);

    await expect(service.setEnabled('viewer_001', true)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      data: {
        enabled: true,
      },
      where: {
        id: 'viewer_001',
        role: {
          in: ['ADMIN', 'OPERATIONS'],
        },
      },
    });
  });
});
