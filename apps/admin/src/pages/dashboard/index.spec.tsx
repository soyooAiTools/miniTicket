import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { DashboardPage } from './index';

vi.mock('../../services/admin-dashboard', () => ({
  getAdminDashboardSummary: vi.fn(),
}));

describe('DashboardPage', () => {
  it('renders Chinese summary cards and key operational sections', async () => {
    const { getAdminDashboardSummary } = await import(
      '../../services/admin-dashboard'
    );

    vi.mocked(getAdminDashboardSummary).mockResolvedValue({
      activeEventCount: 58,
      flaggedOrderCount: 33,
      pendingRefundCount: 27,
      recentActions: [
        {
          action: 'EVENT_PUBLISHED',
          actorName: '现场运营',
          createdAt: '2026-04-22T08:10:00.000Z',
          targetId: 'evt_001',
          targetType: 'EVENT',
        },
      ],
      upcomingEventCount: 41,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: '运营概览' }),
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.getAllByText('27').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('33').length).toBeGreaterThan(0);
    expect(screen.getAllByText('41').length).toBeGreaterThan(0);
    expect(screen.getAllByText('58').length).toBeGreaterThan(0);
    expect(screen.getAllByText('待审核退款').length).toBeGreaterThan(0);
    expect(screen.getAllByText('异常订单').length).toBeGreaterThan(0);
    expect(screen.getAllByText('今日开售活动').length).toBeGreaterThan(0);
    expect(screen.getAllByText('售卖中活动').length).toBeGreaterThan(0);
    expect(screen.getByText('重点处理')).toBeVisible();
    expect(screen.getByText('运营概况')).toBeVisible();
    expect(screen.getByText('最近操作')).toBeVisible();
    expect(screen.getByText('风险提醒')).toBeVisible();
  });
});
