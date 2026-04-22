import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { OrdersDetailPage } from './detail';

vi.mock('../../services/admin-orders', () => ({
  addAdminOrderFlag: vi.fn(),
  addAdminOrderNote: vi.fn(),
  getAdminOrderDetail: vi.fn(),
}));

describe('OrdersDetailPage', () => {
  it(
    'renders the order workbench and submits note and flag actions',
    async () => {
    const { addAdminOrderFlag, addAdminOrderNote, getAdminOrderDetail } =
      await import('../../services/admin-orders');

    vi.mocked(getAdminOrderDetail).mockResolvedValue({
      createdAt: '2026-04-21T08:00:00.000Z',
      currency: 'CNY',
      event: {
        city: '上海',
        id: 'event_1',
        minPrice: 128000,
        saleStatus: 'ON_SALE',
        title: 'Beta Concert',
        venueName: 'Expo Arena',
      },
      flags: [
        {
          createdAt: '2026-04-21T08:30:00.000Z',
          createdByName: '现场运营',
          id: 'flag_1',
          note: '出票链路超时',
          type: '异常单',
        },
      ],
      id: 'order_1',
      items: [
        {
          id: 'item_1',
          quantity: 2,
          sessionId: 'session_1',
          sessionName: '2026-05-01 19:30',
          tierName: '内场 A 区',
          totalAmount: 256000,
          unitPrice: 128000,
          viewer: {
            id: 'viewer_1',
            mobile: '13800138000',
            name: '张三',
          },
        },
      ],
      notes: [
        {
          content: '确认实名信息',
          createdAt: '2026-04-21T08:15:00.000Z',
          createdByName: '现场运营',
          id: 'note_1',
        },
      ],
      orderNumber: 'AT202604210001',
      payments: [
        {
          createdAt: '2026-04-21T08:05:00.000Z',
          paidAt: '2026-04-21T08:10:00.000Z',
          providerTxnId: 'pay_001',
          status: 'SUCCEEDED',
        },
      ],
      refundEntryEnabled: true,
      refundRequests: [
        {
          id: 'refund_1',
          refundAmount: 80000,
          lastHandledAt: '2026-04-21T09:00:00.000Z',
          processedByUserId: 'admin_1',
          processedAt: '2026-04-21T09:00:00.000Z',
          reason: 'USER_IDENTITY_ERROR',
          rejectionReason: undefined,
          refundNo: 'RFD-001',
          requestedAmount: 100000,
          requestedAt: '2026-04-21T08:40:00.000Z',
          reviewNote: '资料齐全',
          reviewedByUserId: 'admin_1',
          serviceFee: 20000,
          status: 'APPROVED',
        },
      ],
      status: 'PAID_PENDING_FULFILLMENT',
      ticketType: 'E_TICKET',
      timeline: {
        description: '电子票已进入履约队列，等待出票结果。',
        title: '待履约',
      },
      totalAmount: 256000,
      userId: 'cust_1',
    });
    vi.mocked(addAdminOrderNote).mockResolvedValue({
      content: '补充备注',
      createdAt: '2026-04-21T10:00:00.000Z',
      createdByName: '现场运营',
      id: 'note_2',
    });
    vi.mocked(addAdminOrderFlag).mockResolvedValue({
      createdAt: '2026-04-21T10:05:00.000Z',
      createdByName: '现场运营',
      id: 'flag_2',
      note: '已人工确认',
      type: '人工复核',
    });

    render(
      <MemoryRouter initialEntries={['/orders/order_1']}>
        <Routes>
          <Route element={<OrdersDetailPage />} path='/orders/:orderId' />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'AT202604210001' }),
    ).toBeVisible();
    expect(screen.getByText('履约信息')).toBeVisible();
    expect(screen.getByText('退款历史')).toBeVisible();
    expect(screen.getByText('异常标记')).toBeVisible();
    expect(screen.getByText('张三')).toBeVisible();
    expect(screen.getByText('RFD-001')).toBeVisible();

    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: '内部备注' }), '补充备注');
    await user.click(screen.getByRole('button', { name: '添加备注' }));

    await waitFor(() => {
      expect(addAdminOrderNote).toHaveBeenCalledWith(
        'order_1',
        { content: '补充备注' },
      );
    });

    await user.type(screen.getByLabelText('标记类型'), '人工复核');
    await user.type(screen.getByLabelText('标记说明'), '已人工确认');
    await user.click(screen.getByRole('button', { name: '新增标记' }));

    await waitFor(() => {
      expect(addAdminOrderFlag).toHaveBeenCalledWith(
        'order_1',
        {
          note: '已人工确认',
          type: '人工复核',
        },
      );
    });
    },
    10000,
  );
});
