import { describe, expect, it, vi } from 'vitest';

import {
  createAdminUser,
  getAdminUsers,
  updateAdminUserRole,
  setAdminUserEnabled,
} from './admin-users';
import { jsonRequest, request } from './request';

vi.mock('./request', () => ({
  jsonRequest: vi.fn(),
  request: vi.fn(),
}));

describe('admin-users service', () => {
  it('loads admin users from the users endpoint', async () => {
    vi.mocked(request).mockResolvedValue([
      {
        createdAt: '2026-04-20T08:00:00.000Z',
        email: 'admin@miniticket.local',
        enabled: true,
        id: 'admin_001',
        name: '超级管理员',
        role: 'ADMIN',
        updatedAt: '2026-04-21T08:00:00.000Z',
      },
    ]);

    await expect(getAdminUsers()).resolves.toEqual([
      {
        createdAt: '2026-04-20T08:00:00.000Z',
        email: 'admin@miniticket.local',
        enabled: true,
        id: 'admin_001',
        name: '超级管理员',
        role: 'ADMIN',
        updatedAt: '2026-04-21T08:00:00.000Z',
      },
    ]);
    expect(request).toHaveBeenCalledWith('/admin/users');
  });

  it('creates an admin user through the create endpoint', async () => {
    vi.mocked(jsonRequest).mockResolvedValue({
      createdAt: '2026-04-22T08:00:00.000Z',
      email: 'ops2@miniticket.local',
      enabled: true,
      id: 'admin_002',
      name: '运营二号',
      role: 'OPERATIONS',
      updatedAt: '2026-04-22T08:00:00.000Z',
    });

    await expect(
      createAdminUser({
        email: 'ops2@miniticket.local',
        name: '运营二号',
        password: 'OpsOps123!',
        role: 'OPERATIONS',
      }),
    ).resolves.toMatchObject({
      email: 'ops2@miniticket.local',
      role: 'OPERATIONS',
    });
    expect(jsonRequest).toHaveBeenCalledWith('/admin/users', 'POST', {
      email: 'ops2@miniticket.local',
      name: '运营二号',
      password: 'OpsOps123!',
      role: 'OPERATIONS',
    });
  });

  it('toggles an admin user enabled state through the patch endpoint', async () => {
    vi.mocked(jsonRequest).mockResolvedValue({
      createdAt: '2026-04-20T08:00:00.000Z',
      email: 'ops2@miniticket.local',
      enabled: false,
      id: 'admin_002',
      name: '运营二号',
      role: 'OPERATIONS',
      updatedAt: '2026-04-22T08:30:00.000Z',
    });

    await expect(setAdminUserEnabled('admin_002', false)).resolves.toMatchObject(
      {
        enabled: false,
        id: 'admin_002',
      },
    );
    expect(jsonRequest).toHaveBeenCalledWith('/admin/users/admin_002/enabled', 'PATCH', {
      enabled: false,
    });
  });

  it('updates an admin user role through the patch endpoint', async () => {
    vi.mocked(jsonRequest).mockResolvedValue({
      createdAt: '2026-04-20T08:00:00.000Z',
      email: 'ops@miniticket.local',
      enabled: true,
      id: 'admin_002',
      name: '杩愯惀浜屽彿',
      role: 'ADMIN',
      updatedAt: '2026-04-22T09:00:00.000Z',
    });

    await expect(updateAdminUserRole('admin_002', 'ADMIN')).resolves.toMatchObject({
      id: 'admin_002',
      role: 'ADMIN',
    });

    expect(jsonRequest).toHaveBeenCalledWith('/admin/users/admin_002', 'PATCH', {
      role: 'ADMIN',
    });
  });
});
