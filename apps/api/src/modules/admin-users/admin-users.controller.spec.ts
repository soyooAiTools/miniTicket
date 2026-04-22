import { BadRequestException } from '@nestjs/common';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersController', () => {
  const adminUsersServiceMock = {
    createUser: jest.fn(),
    listUsers: jest.fn(),
    setEnabled: jest.fn(),
  } as unknown as AdminUsersService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects admin-user create payloads with a short password', async () => {
    const controller = new AdminUsersController(adminUsersServiceMock);

    expect(() =>
      controller.createUser(
        { id: 'admin_001' },
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
      { id: 'admin_001' },
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
    );
    expect(result).toEqual({
      email: 'new-admin@example.com',
      enabled: true,
      id: 'admin_002',
      name: '新管理员',
      role: 'ADMIN',
    });
  });
});
