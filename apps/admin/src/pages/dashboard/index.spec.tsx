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

    expect(screen.getByText('待审核退款')).toBeVisible();
    expect(screen.getByText('异常订单')).toBeVisible();
    expect(screen.getByText('今日开售活动')).toBeVisible();
    expect(screen.getByText('售卖中活动')).toBeVisible();

    await screen.findByText('活动已发布');

    expect(screen.getAllByText('27').length).toBeGreaterThan(0);
    expect(screen.getAllByText('33').length).toBeGreaterThan(0);
    expect(screen.getAllByText('41').length).toBeGreaterThan(0);
    expect(screen.getAllByText('58').length).toBeGreaterThan(0);
    expect(screen.getByText('重点处理')).toBeVisible();
    expect(screen.getByText('运营概况')).toBeVisible();
    expect(screen.getByText('最近操作')).toBeVisible();
    expect(screen.getByText('风险提醒')).toBeVisible();
    expect(screen.getByText('活动 · evt_001')).toBeVisible();
    expect(
      screen
        .getAllByRole('link', { name: '进入处理' })
        .some((link) => link.getAttribute('href') === '/refunds'),
    ).toBe(true);
  });

  it('renders resilient empty states when recent actions and risks are empty', async () => {
    const { getAdminDashboardSummary } = await import(
      '../../services/admin-dashboard'
    );

    vi.mocked(getAdminDashboardSummary).mockResolvedValue({
      activeEventCount: 0,
      flaggedOrderCount: 0,
      pendingRefundCount: 0,
      recentActions: [],
      upcomingEventCount: 0,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('暂无最近操作，页面会在有新动作后自动补充记录。'),
    ).toBeVisible();
    expect(screen.getByText('当前没有需要立刻处理的高风险项。')).toBeVisible();
  });

  it('renders an error state when the dashboard summary request fails', async () => {
    const { getAdminDashboardSummary } = await import(
      '../../services/admin-dashboard'
    );

    vi.mocked(getAdminDashboardSummary).mockRejectedValue(
      new Error('dashboard failed'),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('运营概览加载失败')).toBeVisible();
    expect(screen.getByText('dashboard failed')).toBeVisible();
  });
});
