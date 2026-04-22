import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminAuth } from '../../app/admin-auth-context';
import {
  createAdminUser,
  getAdminUsers,
  setAdminUserEnabled,
  updateAdminUserRole,
  type AdminUserListItem,
} from '../../services/admin-users';
import { UsersPage } from './index';

vi.mock('../../services/admin-users', () => ({
  createAdminUser: vi.fn(),
  getAdminUsers: vi.fn(),
  setAdminUserEnabled: vi.fn(),
  updateAdminUserRole: vi.fn(),
}));

vi.mock('../../app/admin-auth-context', () => ({
  useAdminAuth: vi.fn(),
}));

function buildUser(overrides: Partial<AdminUserListItem> = {}): AdminUserListItem {
  return {
    createdAt: '2026-04-20T08:00:00.000Z',
    email: 'admin@miniticket.local',
    enabled: true,
    id: 'admin_001',
    name: '超级管理员',
    role: 'ADMIN',
    updatedAt: '2026-04-21T08:00:00.000Z',
    ...overrides,
  };
}

function mockAdminAuth(
  userId = 'admin_current',
  role: 'ADMIN' | 'OPERATIONS' = 'ADMIN',
) {
  vi.mocked(useAdminAuth).mockReturnValue({
    authError: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    logoutError: null,
    session: {
      user: {
        email: 'current-admin@miniticket.local',
        id: userId,
        name: role === 'ADMIN' ? '当前管理员' : '当前运营',
        role,
      },
    },
  });
}

async function findRowByText(text: string) {
  const cell = await screen.findByText(text);
  const row = cell.closest('tr');

  if (!row) {
    throw new Error(`Could not find table row for ${text}`);
  }

  return row;
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('renders Chinese account management copy and user rows', async () => {
    vi.mocked(getAdminUsers).mockResolvedValue([
      buildUser(),
      buildUser({
        email: 'ops@miniticket.local',
        enabled: false,
        id: 'admin_002',
        name: '运营二号',
        role: 'OPERATIONS',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
    ]);

    render(<UsersPage />);

    expect(await screen.findByRole('heading', { name: '账号管理' })).toBeVisible();
    expect(screen.getByText('新增账号')).toBeVisible();
    expect(screen.getByText('账号列表')).toBeVisible();
    expect(screen.getByText('超级管理员')).toBeVisible();
    expect(screen.getByText('运营二号')).toBeVisible();
    expect(screen.getByText('已启用')).toBeVisible();
    expect(screen.getByText('已停用')).toBeVisible();
  });

  it(
    'creates an account and refreshes the list',
    async () => {
      const user = userEvent.setup();
      const createdUser = buildUser({
        email: 'ops3@miniticket.local',
        id: 'admin_003',
        name: '运营三号',
        role: 'OPERATIONS',
        updatedAt: '2026-04-22T08:00:00.000Z',
      });

      vi.mocked(getAdminUsers)
        .mockResolvedValueOnce([buildUser()])
        .mockResolvedValueOnce([buildUser(), createdUser]);
      vi.mocked(createAdminUser).mockResolvedValue(createdUser);

      render(<UsersPage />);

      await screen.findByText('超级管理员');

      await user.type(screen.getByLabelText('邮箱'), 'ops3@miniticket.local');
      await user.type(screen.getByLabelText('姓名'), '运营三号');
      await user.type(screen.getByLabelText('初始密码'), 'Ops12345');
      await user.click(screen.getByRole('radio', { name: '运营账号' }));
      await user.click(screen.getByRole('button', { name: '创建账号' }));

      await waitFor(() => {
        expect(createAdminUser).toHaveBeenCalledWith({
          email: 'ops3@miniticket.local',
          name: '运营三号',
          password: 'Ops12345',
          role: 'OPERATIONS',
        });
      });

      expect(await screen.findByText('运营三号')).toBeVisible();
      expect(getAdminUsers).toHaveBeenCalledTimes(2);
    },
    10000,
  );

  it('hides active account-management controls for non-admin users', async () => {
    mockAdminAuth('ops_current', 'OPERATIONS');
    vi.mocked(getAdminUsers).mockResolvedValue([
      buildUser(),
      buildUser({
        email: 'ops@miniticket.local',
        id: 'admin_002',
        name: '运营二号',
        role: 'OPERATIONS',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
    ]);

    render(<UsersPage />);

    expect(await screen.findByText('仅管理员可管理账号')).toBeVisible();
    expect(screen.getByRole('button', { name: '创建账号' })).toBeDisabled();

    const adminRow = await findRowByText('超级管理员');
    const operationsRow = await findRowByText('运营二号');

    expect(within(adminRow).getAllByRole('button', { name: '仅管理员可操作' })).toHaveLength(2);
    expect(within(operationsRow).getAllByRole('button', { name: '仅管理员可操作' })).toHaveLength(2);
    expect(createAdminUser).not.toHaveBeenCalled();
    expect(setAdminUserEnabled).not.toHaveBeenCalled();
    expect(updateAdminUserRole).not.toHaveBeenCalled();
  });

  it('toggles an account enabled state from the table', async () => {
    const user = userEvent.setup();
    const targetUser = buildUser({
      email: 'ops@miniticket.local',
      id: 'admin_002',
      name: '运营二号',
      role: 'OPERATIONS',
      updatedAt: '2026-04-22T08:00:00.000Z',
    });

    vi.mocked(getAdminUsers)
      .mockResolvedValueOnce([buildUser(), targetUser])
      .mockResolvedValueOnce([
        buildUser(),
        buildUser({
          email: 'ops@miniticket.local',
          enabled: false,
          id: 'admin_002',
          name: '运营二号',
          role: 'OPERATIONS',
          updatedAt: '2026-04-22T08:00:00.000Z',
        }),
      ]);
    vi.mocked(setAdminUserEnabled).mockResolvedValue(
      buildUser({
        email: 'ops@miniticket.local',
        enabled: false,
        id: 'admin_002',
        name: '运营二号',
        role: 'OPERATIONS',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
    );

    render(<UsersPage />);

    const rowBeforeUpdate = await findRowByText('运营二号');
    await user.click(within(rowBeforeUpdate).getByRole('button', { name: '停用' }));

    await waitFor(() => {
      expect(setAdminUserEnabled).toHaveBeenCalledWith('admin_002', false);
    });

    const rowAfterUpdate = await findRowByText('运营二号');
    expect(within(rowAfterUpdate).getByText('已停用')).toBeVisible();
    expect(within(rowAfterUpdate).getByRole('button', { name: '启用' })).toBeEnabled();
  });

  it('refreshes the table to reflect a role update', async () => {
    const user = userEvent.setup();

    vi.mocked(getAdminUsers)
      .mockResolvedValueOnce([
        buildUser(),
        buildUser({
          email: 'ops@miniticket.local',
          id: 'admin_002',
          name: '运营二号',
          role: 'OPERATIONS',
          updatedAt: '2026-04-22T08:00:00.000Z',
        }),
      ])
      .mockResolvedValueOnce([
        buildUser(),
        buildUser({
          email: 'ops@miniticket.local',
          id: 'admin_002',
          name: '运营二号',
          role: 'ADMIN',
          updatedAt: '2026-04-22T09:00:00.000Z',
        }),
      ]);
    vi.mocked(updateAdminUserRole).mockResolvedValue(
      buildUser({
        email: 'ops@miniticket.local',
        id: 'admin_002',
        name: '运营二号',
        role: 'ADMIN',
        updatedAt: '2026-04-22T09:00:00.000Z',
      }),
    );

    render(<UsersPage />);

    const rowBeforeUpdate = await findRowByText('运营二号');
    await user.click(within(rowBeforeUpdate).getByRole('button', { name: '改为管理员' }));

    await waitFor(() => {
      expect(updateAdminUserRole).toHaveBeenCalledWith('admin_002', 'ADMIN');
    });

    const rowAfterUpdate = await findRowByText('运营二号');
    expect(within(rowAfterUpdate).getByText('管理员')).toBeVisible();
    expect(within(rowAfterUpdate).getByRole('button', { name: '改为运营' })).toBeEnabled();
    expect(
      within(rowAfterUpdate).queryByRole('button', { name: '改为管理员' }),
    ).not.toBeInTheDocument();
    expect(getAdminUsers).toHaveBeenCalledTimes(2);
  });

  it('disables self-demotion for the signed-in admin', async () => {
    mockAdminAuth('admin_001');
    vi.mocked(getAdminUsers).mockResolvedValue([
      buildUser({
        id: 'admin_001',
        name: '当前管理员',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
      buildUser({
        email: 'ops@miniticket.local',
        id: 'admin_002',
        name: '运营二号',
        role: 'OPERATIONS',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
    ]);

    render(<UsersPage />);

    const row = await findRowByText('当前管理员');
    expect(within(row).getByRole('button', { name: '不能降级自己' })).toBeDisabled();
    expect(updateAdminUserRole).not.toHaveBeenCalled();
  });

  it('disables demoting the last remaining enabled admin', async () => {
    vi.mocked(getAdminUsers).mockResolvedValue([
      buildUser({
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
      buildUser({
        email: 'ops@miniticket.local',
        id: 'admin_002',
        name: '运营二号',
        role: 'OPERATIONS',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
    ]);

    render(<UsersPage />);

    const row = await findRowByText('超级管理员');
    const [roleButton] = within(row).getAllByRole('button', {
      name: '保留最后启用管理员',
    });
    expect(roleButton).toBeDisabled();
    expect(updateAdminUserRole).not.toHaveBeenCalled();
  });

  it('disables demoting the last enabled admin when another admin row is disabled', async () => {
    vi.mocked(getAdminUsers).mockResolvedValue([
      buildUser({
        id: 'admin_001',
        name: '管理员甲',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
      buildUser({
        email: 'admin-b@miniticket.local',
        enabled: false,
        id: 'admin_002',
        name: '管理员乙',
        updatedAt: '2026-04-22T08:30:00.000Z',
      }),
    ]);

    render(<UsersPage />);

    const row = await findRowByText('管理员甲');
    const [roleButton] = within(row).getAllByRole('button', {
      name: '保留最后启用管理员',
    });
    expect(roleButton).toBeDisabled();
    expect(updateAdminUserRole).not.toHaveBeenCalled();
  });

  it('disables stopping the signed-in admin', async () => {
    mockAdminAuth('admin_001');
    vi.mocked(getAdminUsers).mockResolvedValue([
      buildUser({
        id: 'admin_001',
        name: '当前管理员',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
      buildUser({
        email: 'ops@miniticket.local',
        id: 'admin_002',
        name: '运营二号',
        role: 'OPERATIONS',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
    ]);

    render(<UsersPage />);

    const row = await findRowByText('当前管理员');
    expect(within(row).getByRole('button', { name: '不能停用自己' })).toBeDisabled();
    expect(setAdminUserEnabled).not.toHaveBeenCalled();
  });

  it('disables stopping the last remaining enabled admin', async () => {
    vi.mocked(getAdminUsers).mockResolvedValue([
      buildUser({
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
      buildUser({
        email: 'ops@miniticket.local',
        id: 'admin_002',
        name: '运营二号',
        role: 'OPERATIONS',
        updatedAt: '2026-04-22T08:00:00.000Z',
      }),
    ]);

    render(<UsersPage />);

    const row = await findRowByText('超级管理员');
    const [, enabledButton] = within(row).getAllByRole('button', {
      name: '保留最后启用管理员',
    });
    expect(enabledButton).toBeDisabled();
    expect(setAdminUserEnabled).not.toHaveBeenCalled();
  });

  it('disables other account actions while a mutation is pending', async () => {
    const user = userEvent.setup();
    let resolveMutation: ((value: AdminUserListItem) => void) | undefined;

    mockAdminAuth('admin_999');
    vi.mocked(getAdminUsers)
      .mockResolvedValueOnce([
        buildUser({
          email: 'admin-a@miniticket.local',
          id: 'admin_001',
          name: '管理员甲',
          updatedAt: '2026-04-22T08:00:00.000Z',
        }),
        buildUser({
          email: 'admin-b@miniticket.local',
          id: 'admin_002',
          name: '管理员乙',
          updatedAt: '2026-04-22T08:00:00.000Z',
        }),
      ])
      .mockResolvedValueOnce([
        buildUser({
          email: 'admin-a@miniticket.local',
          id: 'admin_001',
          name: '管理员甲',
          updatedAt: '2026-04-22T08:00:00.000Z',
        }),
        buildUser({
          email: 'admin-b@miniticket.local',
          enabled: false,
          id: 'admin_002',
          name: '管理员乙',
          updatedAt: '2026-04-22T09:00:00.000Z',
        }),
      ]);

    vi.mocked(setAdminUserEnabled).mockImplementation(
      () =>
        new Promise<AdminUserListItem>((resolve) => {
          resolveMutation = resolve;
        }),
    );

    render(<UsersPage />);

    const targetRow = await findRowByText('管理员乙');
    const otherRow = await findRowByText('管理员甲');

    await user.click(within(targetRow).getByRole('button', { name: '停用' }));

    await waitFor(() => {
      expect(setAdminUserEnabled).toHaveBeenCalledWith('admin_002', false);
    });

    expect(within(otherRow).getByRole('button', { name: '改为运营' })).toBeDisabled();
    expect(within(otherRow).getByRole('button', { name: '停用' })).toBeDisabled();

    resolveMutation?.(
      buildUser({
        email: 'admin-b@miniticket.local',
        enabled: false,
        id: 'admin_002',
        name: '管理员乙',
        updatedAt: '2026-04-22T09:00:00.000Z',
      }),
    );

    await waitFor(() => {
      expect(getAdminUsers).toHaveBeenCalledTimes(2);
    });
  });
});
