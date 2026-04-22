import { render, screen } from '@testing-library/react';
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
});
