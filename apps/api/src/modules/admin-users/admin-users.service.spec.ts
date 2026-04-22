import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  const prismaMock = {
    adminAuditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
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
        createdAt: '2026-04-20T08:00:00.000Z',
        email: 'admin@miniticket.local',
        enabled: true,
        id: 'seed-admin-super',
        name: 'Super Admin',
        role: 'ADMIN',
        updatedAt: '2026-04-20T08:00:00.000Z',
      },
      {
        createdAt: '2026-04-20T09:00:00.000Z',
        email: 'ops@miniticket.local',
        enabled: true,
        id: 'seed-admin-ops',
        name: 'Ops Lead',
        role: 'OPERATIONS',
        updatedAt: '2026-04-20T09:00:00.000Z',
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
    const txMock = {
      adminAuditLog: {
        create: jest.fn().mockResolvedValue({
          id: 'audit_001',
        }),
      },
      user: {
        create: jest.fn().mockResolvedValue({
          createdAt: new Date('2026-04-21T08:00:00.000Z'),
          email: 'ops2@miniticket.local',
          enabled: true,
          id: 'user_ops_002',
          name: 'Ops B',
          role: 'OPERATIONS',
          updatedAt: new Date('2026-04-21T08:00:00.000Z'),
        }),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);
    const result = await service.createUser({
      email: 'ops2@miniticket.local',
      name: 'Ops B',
      password: 'OpsOps123!',
      role: 'OPERATIONS',
    }, 'seed-admin-ops', 'ADMIN');

    expect(result).toMatchObject({
      email: 'ops2@miniticket.local',
      enabled: true,
      name: 'Ops B',
      role: 'OPERATIONS',
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: {
        email: 'ops2@miniticket.local',
      },
    });
    expect(txMock.user.create).toHaveBeenCalledWith({
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
    expect(txMock.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'ADMIN_USER_CREATED',
        payload: {
          email: 'ops2@miniticket.local',
          role: 'OPERATIONS',
        },
        targetId: 'user_ops_002',
        targetType: 'ADMIN_USER',
        userId: 'seed-admin-ops',
      },
    });
  });

  it('rejects createUser when audit logging fails inside the transaction', async () => {
    (prismaMock.user.findFirst as jest.Mock).mockResolvedValue(null);
    const txMock = {
      adminAuditLog: {
        create: jest.fn().mockRejectedValue(new Error('audit failed')),
      },
      user: {
        create: jest.fn().mockResolvedValue({
          createdAt: new Date('2026-04-21T08:00:00.000Z'),
          email: 'ops2@miniticket.local',
          enabled: true,
          id: 'user_ops_002',
          name: 'Ops B',
          role: 'OPERATIONS',
          updatedAt: new Date('2026-04-21T08:00:00.000Z'),
        }),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);

    await expect(
      service.createUser(
        {
          email: 'ops2@miniticket.local',
          name: 'Ops B',
          password: 'OpsOps123!',
          role: 'OPERATIONS',
        },
        'seed-admin-ops',
        'ADMIN',
      ),
    ).rejects.toThrow('audit failed');

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.user.create).toHaveBeenCalledTimes(1);
    expect(txMock.adminAuditLog.create).toHaveBeenCalledTimes(1);
  });

  it('maps unique constraint errors to ConflictException', async () => {
    (prismaMock.user.findFirst as jest.Mock).mockResolvedValue(null);
    const txMock = {
      adminAuditLog: {
        create: jest.fn(),
      },
      user: {
        create: jest.fn().mockRejectedValue({
          code: 'P2002',
        }),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);

    await expect(
      service.createUser({
        email: 'new@miniticket.local',
        name: 'New Admin',
        password: 'Admin123!',
        role: 'ADMIN',
      }, 'seed-admin-ops', 'ADMIN'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
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
      }, 'seed-admin-ops', 'ADMIN'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('rejects createUser from operations actors', async () => {
    const service = new AdminUsersService(prismaMock);

    await expect(
      service.createUser(
        {
          email: 'new-admin@example.com',
          name: 'New Admin',
          password: 'Admin123!',
          role: 'ADMIN',
        },
        'seed-admin-ops',
        'OPERATIONS',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('updates only admin users when changing role and records the previous role', async () => {
    const txMock = {
      adminAuditLog: {
        create: jest.fn().mockResolvedValue({
          id: 'audit_003',
        }),
      },
      user: {
        create: jest.fn(),
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({
            createdAt: new Date('2026-04-21T08:00:00.000Z'),
            email: 'ops2@miniticket.local',
            enabled: true,
            id: 'user_ops_002',
            name: 'Ops B',
            role: 'OPERATIONS',
            updatedAt: new Date('2026-04-21T08:00:00.000Z'),
          })
          .mockResolvedValueOnce({
            createdAt: new Date('2026-04-21T08:00:00.000Z'),
            email: 'ops2@miniticket.local',
            enabled: true,
            id: 'user_ops_002',
            name: 'Ops B',
            role: 'ADMIN',
            updatedAt: new Date('2026-04-21T09:00:00.000Z'),
          }),
        updateMany: jest.fn().mockResolvedValue({
          count: 1,
        }),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);
    const result = await service.updateRole(
      'user_ops_002',
      'ADMIN',
      'seed-admin-ops',
      'ADMIN',
    );

    expect(result).toEqual({
      createdAt: '2026-04-21T08:00:00.000Z',
      email: 'ops2@miniticket.local',
      enabled: true,
      id: 'user_ops_002',
      name: 'Ops B',
      role: 'ADMIN',
      updatedAt: '2026-04-21T09:00:00.000Z',
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.user.findFirst).toHaveBeenNthCalledWith(1, {
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
    expect(txMock.user.updateMany).toHaveBeenCalledWith({
      data: {
        role: 'ADMIN',
      },
      where: {
        id: 'user_ops_002',
        role: {
          in: ['ADMIN', 'OPERATIONS'],
        },
      },
    });
    expect(txMock.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'ADMIN_USER_ROLE_UPDATED',
        payload: {
          nextRole: 'ADMIN',
          previousRole: 'OPERATIONS',
        },
        targetId: 'user_ops_002',
        targetType: 'ADMIN_USER',
        userId: 'seed-admin-ops',
      },
    });
  });

  it('rejects role updates from operations actors', async () => {
    const service = new AdminUsersService(prismaMock);

    await expect(
      service.updateRole('user_ops_002', 'ADMIN', 'seed-admin-ops', 'OPERATIONS'),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects updateRole when audit logging fails inside the transaction', async () => {
    const txMock = {
      adminAuditLog: {
        create: jest.fn().mockRejectedValue(new Error('audit failed')),
      },
      user: {
        create: jest.fn(),
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({
            createdAt: new Date('2026-04-21T08:00:00.000Z'),
            email: 'ops2@miniticket.local',
            enabled: true,
            id: 'user_ops_002',
            name: 'Ops B',
            role: 'OPERATIONS',
            updatedAt: new Date('2026-04-21T08:00:00.000Z'),
          })
          .mockResolvedValueOnce({
            createdAt: new Date('2026-04-21T08:00:00.000Z'),
            email: 'ops2@miniticket.local',
            enabled: true,
            id: 'user_ops_002',
            name: 'Ops B',
            role: 'ADMIN',
            updatedAt: new Date('2026-04-21T09:00:00.000Z'),
          }),
        updateMany: jest.fn().mockResolvedValue({
          count: 1,
        }),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);

    await expect(
      service.updateRole('user_ops_002', 'ADMIN', 'seed-admin-admin', 'ADMIN'),
    ).rejects.toThrow('audit failed');

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.user.updateMany).toHaveBeenCalledTimes(1);
    expect(txMock.adminAuditLog.create).toHaveBeenCalledTimes(1);
  });

  it('returns the existing user unchanged when the requested role is already set', async () => {
    const txMock = {
      adminAuditLog: {
        create: jest.fn(),
      },
      user: {
        create: jest.fn(),
        findFirst: jest.fn().mockResolvedValue({
          createdAt: new Date('2026-04-21T08:00:00.000Z'),
          email: 'ops2@miniticket.local',
          enabled: true,
          id: 'user_ops_002',
          name: 'Ops B',
          role: 'OPERATIONS',
          updatedAt: new Date('2026-04-21T09:00:00.000Z'),
        }),
        updateMany: jest.fn(),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);
    const result = await service.updateRole(
      'user_ops_002',
      'OPERATIONS',
      'seed-admin-admin',
      'ADMIN',
    );

    expect(result).toEqual({
      createdAt: '2026-04-21T08:00:00.000Z',
      email: 'ops2@miniticket.local',
      enabled: true,
      id: 'user_ops_002',
      name: 'Ops B',
      role: 'OPERATIONS',
      updatedAt: '2026-04-21T09:00:00.000Z',
    });
    expect(txMock.user.updateMany).not.toHaveBeenCalled();
    expect(txMock.adminAuditLog.create).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects role updates when the target is not an admin user', async () => {
    const txMock = {
      adminAuditLog: {
        create: jest.fn(),
      },
      user: {
        create: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn(),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);

    await expect(
      service.updateRole('viewer_001', 'ADMIN', 'seed-admin-ops', 'ADMIN'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(txMock.user.updateMany).not.toHaveBeenCalled();
    expect(txMock.adminAuditLog.create).not.toHaveBeenCalled();
  });

  it('updates only admin users when toggling enabled state', async () => {
    (prismaMock.user.updateMany as jest.Mock).mockResolvedValue({
      count: 1,
    });
    const txMock = {
      adminAuditLog: {
        create: jest.fn().mockResolvedValue({
          id: 'audit_002',
        }),
      },
      user: {
        create: jest.fn(),
        findFirst: jest.fn().mockResolvedValue({
          createdAt: new Date('2026-04-21T08:00:00.000Z'),
          email: 'ops2@miniticket.local',
          enabled: false,
          id: 'user_ops_002',
          name: 'Ops B',
          role: 'OPERATIONS',
          updatedAt: new Date('2026-04-21T09:00:00.000Z'),
        }),
        updateMany: jest.fn().mockResolvedValue({
          count: 1,
        }),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);
    const result = await service.setEnabled(
      'user_ops_002',
      false,
      'seed-admin-ops',
      'ADMIN',
    );

    expect(result).toEqual({
      createdAt: '2026-04-21T08:00:00.000Z',
      email: 'ops2@miniticket.local',
      enabled: false,
      id: 'user_ops_002',
      name: 'Ops B',
      role: 'OPERATIONS',
      updatedAt: '2026-04-21T09:00:00.000Z',
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.user.updateMany).toHaveBeenCalledWith({
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
    expect(txMock.user.findFirst).toHaveBeenCalledWith({
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
    expect(txMock.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'ADMIN_USER_DISABLED',
        payload: {
          enabled: false,
        },
        targetId: 'user_ops_002',
        targetType: 'ADMIN_USER',
        userId: 'seed-admin-ops',
      },
    });
  });

  it('rejects setEnabled from operations actors', async () => {
    const service = new AdminUsersService(prismaMock);

    await expect(
      service.setEnabled('user_ops_002', false, 'seed-admin-ops', 'OPERATIONS'),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects setEnabled when audit logging fails inside the transaction', async () => {
    const txMock = {
      adminAuditLog: {
        create: jest.fn().mockRejectedValue(new Error('audit failed')),
      },
      user: {
        create: jest.fn(),
        findFirst: jest.fn().mockResolvedValue({
          createdAt: new Date('2026-04-21T08:00:00.000Z'),
          email: 'ops2@miniticket.local',
          enabled: false,
          id: 'user_ops_002',
          name: 'Ops B',
          role: 'OPERATIONS',
          updatedAt: new Date('2026-04-21T09:00:00.000Z'),
        }),
        updateMany: jest.fn().mockResolvedValue({
          count: 1,
        }),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);

    await expect(
      service.setEnabled('user_ops_002', false, 'seed-admin-ops', 'ADMIN'),
    ).rejects.toThrow('audit failed');

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.user.updateMany).toHaveBeenCalledTimes(1);
    expect(txMock.adminAuditLog.create).toHaveBeenCalledTimes(1);
  });

  it('rejects non-admin users when toggling enabled state', async () => {
    const txMock = {
      adminAuditLog: {
        create: jest.fn(),
      },
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({
          count: 0,
        }),
      },
    } as never;
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: (transaction: never) => Promise<never>) =>
        callback(txMock),
    );

    const service = new AdminUsersService(prismaMock);

    await expect(
      service.setEnabled('viewer_001', true, 'seed-admin-ops', 'ADMIN'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.user.updateMany).toHaveBeenCalledWith({
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
