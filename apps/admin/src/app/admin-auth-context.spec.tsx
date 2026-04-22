import { render, screen, waitFor } from '@testing-library/react';
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

describe('admin auth routing', () => {
  it('redirects anonymous users from /orders to /login', async () => {
    window.history.pushState({}, '', '/orders');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, 401)),
    );

    render(
      <AdminAuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AdminAuthProvider>,
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });

    expect(
      await screen.findByRole('heading', { name: '管理员登录' }),
    ).toBeVisible();
  });

  it('keeps the protected shell open when current session check fails with a transient error', async () => {
    window.history.pushState({}, '', '/orders');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'Server error' }, 500)),
    );

    render(
      <AdminAuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AdminAuthProvider>,
    );

    expect(await screen.findByText('管理员会话加载失败')).toBeVisible();
    expect(window.location.pathname).toBe('/orders');
  });

  it('returns authenticated users visiting /login back to the dashboard', async () => {
    window.history.pushState({}, '', '/login');
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

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });

    expect(
      await screen.findByRole('heading', { name: '运营概览' }),
    ).toBeVisible();
  });
});
