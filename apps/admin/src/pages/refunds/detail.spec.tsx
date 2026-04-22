import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { RefundDetailPage } from './detail';
import type { AdminRefundDetail } from '../../services/admin-refunds';

vi.mock('../../services/admin-refunds', () => ({
  approveAdminRefund: vi.fn(),
  getAdminRefundDetail: vi.fn(),
  processAdminRefund: vi.fn(),
  rejectAdminRefund: vi.fn(),
}));

function buildReviewingRefund(): AdminRefundDetail {
  return {
    amount: 80000,
    currency: 'CNY',
    event: {
      city: '上海',
      id: 'event_1',
      title: 'Beta Concert',
      venueName: 'Expo Arena',
    },
    id: 'refund_1',
    lastHandledAt: undefined,
    orderId: 'order_1',
    orderNumber: 'AT202604210001',
    orderStatus: 'REFUND_REVIEWING',
    processedByUserId: undefined,
    reason: 'USER_IDENTITY_ERROR',
    rejectionReason: undefined,
    refundNo: 'RFD-001',
    requestedAt: '2026-04-21T08:40:00.000Z',
    requestedAmount: 100000,
    requesterName: '张三',
    reviewNote: undefined,
    reviewedByUserId: undefined,
    serviceFee: 20000,
    sessionName: '2026-05-01 19:30',
    status: 'REVIEWING',
    userId: 'cust_1',
  };
}

describe('RefundDetailPage', () => {
  it('approves and processes a refund request through the admin workbench', async () => {
    const {
      approveAdminRefund,
      getAdminRefundDetail,
      processAdminRefund,
    } = await import('../../services/admin-refunds');

    vi.mocked(getAdminRefundDetail)
      .mockResolvedValueOnce(buildReviewingRefund())
      .mockResolvedValueOnce({
        ...buildReviewingRefund(),
        reviewedByUserId: 'admin_1',
        reviewNote: '资料齐全',
        status: 'APPROVED',
      })
      .mockResolvedValueOnce({
        ...buildReviewingRefund(),
        processedByUserId: 'admin_1',
        status: 'PROCESSING',
      });

    vi.mocked(approveAdminRefund).mockResolvedValue({
      ...buildReviewingRefund(),
      reviewedByUserId: 'admin_1',
      reviewNote: '资料齐全',
      status: 'APPROVED',
    });
    vi.mocked(processAdminRefund).mockResolvedValue({
      ...buildReviewingRefund(),
      processedByUserId: 'admin_1',
      status: 'PROCESSING',
    });

    render(
      <MemoryRouter initialEntries={['/refunds/refund_1']}>
        <Routes>
          <Route element={<RefundDetailPage />} path='/refunds/:refundId' />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'RFD-001' }),
    ).toBeVisible();
    expect(screen.getByText('退款审核')).toBeVisible();
    expect(screen.getByText('审批处理')).toBeVisible();
    expect(screen.getByText('订单信息')).toBeVisible();
    expect(screen.getByText('张三')).toBeVisible();

    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: '审核备注' }), '资料齐全');
    await user.click(screen.getByRole('button', { name: '批准退款' }));

    await waitFor(() => {
      expect(approveAdminRefund).toHaveBeenCalledWith('refund_1', {
        note: '资料齐全',
      });
    });

    await user.type(screen.getByRole('textbox', { name: '审核备注' }), '准备提交渠道处理');
    await user.click(screen.getByRole('button', { name: '发起处理' }));

    await waitFor(() => {
      expect(processAdminRefund).toHaveBeenCalledWith('refund_1', {
        note: '准备提交渠道处理',
      });
    });
  });

  it('rejects a refund request with a required reason', async () => {
    const { getAdminRefundDetail, rejectAdminRefund } = await import(
      '../../services/admin-refunds'
    );

    vi.mocked(getAdminRefundDetail).mockResolvedValue(buildReviewingRefund());
    vi.mocked(rejectAdminRefund).mockResolvedValue({
      ...buildReviewingRefund(),
      rejectionReason: '实名信息不一致',
      reviewedByUserId: 'admin_1',
      status: 'REJECTED',
    });

    render(
      <MemoryRouter initialEntries={['/refunds/refund_1']}>
        <Routes>
          <Route element={<RefundDetailPage />} path='/refunds/:refundId' />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: 'RFD-001' });

    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: '驳回原因' }), '实名信息不一致');
    await user.click(screen.getByRole('button', { name: '驳回退款' }));

    await waitFor(() => {
      expect(rejectAdminRefund).toHaveBeenCalledWith('refund_1', {
        reason: '实名信息不一致',
      });
    });
  });
});
