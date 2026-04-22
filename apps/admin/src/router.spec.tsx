import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { useAdminAuth } from './app/admin-auth-context';
import { AppRouter } from './router';

const loginModuleLoadSpy = vi.fn();

vi.mock('./app/admin-auth-context', () => ({
  useAdminAuth: vi.fn(),
}));

vi.mock('./pages/login', async () => {
  loginModuleLoadSpy();
  await new Promise((resolve) => {
    window.setTimeout(resolve, 100);
  });

  return {
    AdminLoginPage: () => <div>login page loaded</div>,
  };
});

vi.mock('./pages/dashboard', async () => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 100);
  });

  return {
    DashboardPage: () => <div>dashboard page loaded</div>,
  };
});

vi.mock('./pages/users', async () => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 100);
  });

  return {
    UsersPage: () => <div>users page loaded</div>,
  };
});

describe('AppRouter', () => {
  it('redirects authenticated users away from /login before loading the login page chunk', async () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      authError: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      logoutError: null,
      session: {
        user: {
          email: 'admin@example.com',
          id: 'admin_1',
          name: 'admin',
          role: 'ADMIN',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('status')).toBeVisible();
    expect(screen.getByRole('menu')).toBeVisible();
    expect(loginModuleLoadSpy).not.toHaveBeenCalled();
    expect(screen.queryByText('login page loaded')).not.toBeInTheDocument();
    expect(await screen.findByText('dashboard page loaded')).toBeVisible();
  });

  it('shows the shared loading fallback for the lazy login route', async () => {
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
        <AppRouter />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('status')).toBeVisible();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(await screen.findByText('login page loaded')).toBeVisible();
  });

  it('keeps the admin shell mounted while a lazy inner route is pending', async () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      authError: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      logoutError: null,
      session: {
        user: {
          email: 'admin@example.com',
          id: 'admin_1',
          name: 'admin',
          role: 'ADMIN',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/users']}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('status')).toBeVisible();
    expect(screen.getByRole('menu')).toBeVisible();
    expect(await screen.findByText('users page loaded')).toBeVisible();
  });
});
