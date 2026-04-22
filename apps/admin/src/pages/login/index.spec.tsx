import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AdminLoginPage } from './index';
import { useAdminAuth } from '../../app/admin-auth-context';

vi.mock('../../app/admin-auth-context', () => ({
  useAdminAuth: vi.fn(),
}));

describe('AdminLoginPage', () => {
  it('renders the Chinese login experience', () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      authError: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      logoutError: null,
      session: null,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '管理员登录' })).toBeVisible();
    expect(screen.getByText('管理员入口')).toBeVisible();
    expect(screen.getByLabelText('管理员邮箱')).toBeVisible();
    expect(screen.getByLabelText('密码')).toBeVisible();
    expect(screen.getByRole('button', { name: /登\s*录/ })).toBeVisible();
  });

  it('shows the submit error when login fails', async () => {
    const user = userEvent.setup();
    vi.mocked(useAdminAuth).mockReturnValue({
      authError: null,
      isLoading: false,
      login: vi.fn().mockRejectedValue(new Error('账号或密码不正确')),
      logout: vi.fn(),
      logoutError: null,
      session: null,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('管理员邮箱'), 'ops@example.com');
    await user.type(screen.getByLabelText('密码'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /登\s*录/ }));

    expect(await screen.findByText('账号或密码不正确')).toBeVisible();
  });
});
