import { BadRequestException } from '@nestjs/common';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersController', () => {
  const adminUsersServiceMock = {
    createUser: jest.fn(),
    listUsers: jest.fn(),
    updateRole: jest.fn(),
    setEnabled: jest.fn(),
  } as unknown as AdminUsersService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects admin-user create payloads with a short password', async () => {
    const controller = new AdminUsersController(adminUsersServiceMock);

    expect(() =>
      controller.createUser(
        { id: 'admin_001', role: 'ADMIN' },
        {
          email: 'new-admin@example.com',
          name: '新管理员',
          password: 'short7',
          role: 'ADMIN',
        },
      ),
    ).toThrow(BadRequestException);
    expect(adminUsersServiceMock.createUser).not.toHaveBeenCalled();
  });

  it('delegates valid admin-user create payloads to the service', async () => {
    (adminUsersServiceMock.createUser as jest.Mock).mockResolvedValue({
      email: 'new-admin@example.com',
      enabled: true,
      id: 'admin_002',
      name: '新管理员',
      role: 'ADMIN',
    });

    const controller = new AdminUsersController(adminUsersServiceMock);
    const result = await controller.createUser(
      { id: 'admin_001', role: 'ADMIN' },
      {
        email: 'new-admin@example.com',
        name: '新管理员',
        password: 'LongEnough123',
        role: 'ADMIN',
      },
    );

    expect(adminUsersServiceMock.createUser).toHaveBeenCalledWith(
      {
        email: 'new-admin@example.com',
        name: '新管理员',
        password: 'LongEnough123',
        role: 'ADMIN',
      },
      'admin_001',
      'ADMIN',
    );
    expect(result).toEqual({
      email: 'new-admin@example.com',
      enabled: true,
      id: 'admin_002',
      name: '新管理员',
      role: 'ADMIN',
    });
  });

  it('rejects admin-user role payloads with an invalid role body', async () => {
    const controller = new AdminUsersController(adminUsersServiceMock);

    expect(() =>
      controller.updateUserRole(
        { id: 'admin_001', role: 'ADMIN' },
        'admin_002',
        {
          role: 'SUPERADMIN',
        },
      ),
    ).toThrow(BadRequestException);
    expect(adminUsersServiceMock.updateRole).not.toHaveBeenCalled();
  });

  it('delegates valid admin-user role payloads to the service', async () => {
    (adminUsersServiceMock.updateRole as jest.Mock).mockResolvedValue({
      email: 'ops2@miniticket.local',
      enabled: true,
      id: 'admin_002',
      name: '新管理员',
      role: 'OPERATIONS',
    });

    const controller = new AdminUsersController(adminUsersServiceMock);
    const result = await controller.updateUserRole(
      { id: 'admin_001', role: 'ADMIN' },
      'admin_002',
      {
        role: 'OPERATIONS',
      },
    );

    expect(adminUsersServiceMock.updateRole).toHaveBeenCalledWith(
      'admin_002',
      'OPERATIONS',
      'admin_001',
      'ADMIN',
    );
    expect(result).toEqual({
      email: 'ops2@miniticket.local',
      enabled: true,
      id: 'admin_002',
      name: '新管理员',
      role: 'OPERATIONS',
    });
  });

  it('delegates enabled updates with the actor role', async () => {
    (adminUsersServiceMock.setEnabled as jest.Mock).mockResolvedValue({
      createdAt: '2026-04-21T08:00:00.000Z',
      email: 'ops2@miniticket.local',
      enabled: false,
      id: 'admin_002',
      name: '新管理员',
      role: 'OPERATIONS',
      updatedAt: '2026-04-21T09:00:00.000Z',
    });

    const controller = new AdminUsersController(adminUsersServiceMock);
    const result = await controller.setEnabled(
      { id: 'admin_001', role: 'ADMIN' },
      'admin_002',
      {
        enabled: false,
      },
    );

    expect(adminUsersServiceMock.setEnabled).toHaveBeenCalledWith(
      'admin_002',
      false,
      'admin_001',
      'ADMIN',
    );
    expect(result).toEqual({
      createdAt: '2026-04-21T08:00:00.000Z',
      email: 'ops2@miniticket.local',
      enabled: false,
      id: 'admin_002',
      name: '新管理员',
      role: 'OPERATIONS',
      updatedAt: '2026-04-21T09:00:00.000Z',
    });
  });
});
