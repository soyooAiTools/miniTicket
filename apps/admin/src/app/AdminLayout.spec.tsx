import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AdminAuthProvider } from './admin-auth-context';
import { AppRouter } from '../router';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json',
    },
    status,
  });
}

describe('AdminLayout', () => {
  it('shows the Chinese navigation labels', async () => {
    window.history.pushState({}, '', '/dashboard');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          user: {
            email: 'ops@example.com',
            id: 'admin_1',
            name: '运营管理员',
            role: 'ADMIN',
          },
        }),
      ),
    );

    render(
      <AdminAuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AdminAuthProvider>,
    );

    expect(await screen.findByRole('link', { name: '概览' })).toBeVisible();
    expect(screen.getByRole('link', { name: '活动' })).toBeVisible();
    expect(screen.getByRole('link', { name: '订单' })).toBeVisible();
    expect(screen.getByRole('link', { name: '退款' })).toBeVisible();
    expect(screen.getByRole('link', { name: '账号' })).toBeVisible();
  });

  it('clears the local session even when logout fails on the server', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/dashboard');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          user: {
            email: 'ops@example.com',
            id: 'admin_1',
            name: '运营管理员',
            role: 'ADMIN',
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ message: 'boom' }, 500));

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AdminAuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AdminAuthProvider>,
    );

    await screen.findByRole('button', { name: '退出登录' });
    await user.click(screen.getByRole('button', { name: '退出登录' }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });

    expect(
      await screen.findByText('退出请求未完成，但本地会话已清理。'),
    ).toBeVisible();
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          typeof url === 'string' &&
          url.includes('/admin/auth/logout') &&
          !!init &&
          typeof init === 'object' &&
          'method' in init &&
          init.method === 'POST' &&
          'credentials' in init &&
          init.credentials === 'include',
      ),
    ).toBe(true);
  });
});
