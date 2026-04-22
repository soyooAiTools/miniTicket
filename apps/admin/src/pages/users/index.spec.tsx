import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UsersPage } from './index';
import {
  createAdminUser,
  getAdminUsers,
  setAdminUserEnabled,
} from '../../services/admin-users';

vi.mock('../../services/admin-users', () => ({
  createAdminUser: vi.fn(),
  getAdminUsers: vi.fn(),
  setAdminUserEnabled: vi.fn(),
}));

describe('UsersPage', () => {
  it('renders Chinese account management copy and user rows', async () => {
    vi.mocked(getAdminUsers).mockResolvedValue([
      {
        createdAt: '2026-04-20T08:00:00.000Z',
        email: 'admin@miniticket.local',
        enabled: true,
        id: 'admin_001',
        name: '超级管理员',
        role: 'ADMIN',
        updatedAt: '2026-04-21T08:00:00.000Z',
      },
      {
        createdAt: '2026-04-21T08:00:00.000Z',
        email: 'ops@miniticket.local',
        enabled: false,
        id: 'admin_002',
        name: '运营二号',
        role: 'OPERATIONS',
        updatedAt: '2026-04-22T08:00:00.000Z',
      },
    ]);

    render(<UsersPage />);

    expect(await screen.findByRole('heading', { name: '账号管理' })).toBeVisible();
    expect(screen.getByText('新增账号')).toBeVisible();
    expect(screen.getByText('超级管理员')).toBeVisible();
    expect(screen.getByText('运营二号')).toBeVisible();
    expect(screen.getByText('管理员')).toBeVisible();
    expect(screen.getByText('运营')).toBeVisible();
    expect(screen.getByText('已启用')).toBeVisible();
    expect(screen.getByText('已停用')).toBeVisible();
  });

  it('creates an account and refreshes the list', async () => {
    const user = userEvent.setup();
    vi.mocked(getAdminUsers).mockResolvedValue([
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
    vi.mocked(createAdminUser).mockResolvedValue({
      createdAt: '2026-04-22T08:00:00.000Z',
      email: 'ops3@miniticket.local',
      enabled: true,
      id: 'admin_003',
      name: '运营三号',
      role: 'OPERATIONS',
      updatedAt: '2026-04-22T08:00:00.000Z',
    });

    render(<UsersPage />);

    await screen.findByText('超级管理员');

    await user.type(screen.getByLabelText('邮箱'), 'ops3@miniticket.local');
    await user.type(screen.getByLabelText('姓名'), '运营三号');
    await user.type(screen.getByLabelText('初始密码'), 'OpsOps123!');
    await user.click(screen.getByRole('radio', { name: '运营账号' }));
    await user.click(screen.getByRole('button', { name: /创\s*建\s*账\s*号/ }));

    await waitFor(() => {
      expect(createAdminUser).toHaveBeenCalledWith({
        email: 'ops3@miniticket.local',
        name: '运营三号',
        password: 'OpsOps123!',
        role: 'OPERATIONS',
      });
    });

    expect(getAdminUsers).toHaveBeenCalledTimes(2);
  });

  it('toggles an account enabled state from the table', async () => {
    const user = userEvent.setup();
    vi.mocked(getAdminUsers).mockResolvedValue([
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
    vi.mocked(setAdminUserEnabled).mockResolvedValue({
      createdAt: '2026-04-20T08:00:00.000Z',
      email: 'admin@miniticket.local',
      enabled: false,
      id: 'admin_001',
      name: '超级管理员',
      role: 'ADMIN',
      updatedAt: '2026-04-22T08:00:00.000Z',
    });

    render(<UsersPage />);

    await screen.findByText('超级管理员');
    await user.click(screen.getByRole('button', { name: /停\s*用/ }));

    await waitFor(() => {
      expect(setAdminUserEnabled).toHaveBeenCalledWith('admin_001', false);
    });
  });
});
