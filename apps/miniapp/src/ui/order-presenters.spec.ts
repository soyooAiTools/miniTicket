import { describe, expect, it } from 'vitest';

import {
  buildOrderDashboard,
  getOrderTimelineMeta,
  getPaymentResultMeta,
  getRefundEntrySummary,
} from './order-presenters';

describe('buildOrderDashboard', () => {
  it('summarizes total orders and action-needed orders', () => {
    const dashboard = buildOrderDashboard([
      {
        createdAt: '2026-04-21T10:00:00.000Z',
        currency: 'CNY',
        event: {
          city: 'Shanghai',
          id: 'evt-1',
          minPrice: 399,
          published: true,
          refundEntryEnabled: true,
          saleStatus: 'ON_SALE',
          title: 'Live Tour',
          venueName: 'Arena',
        },
        id: 'ord-1',
        orderNumber: 'MT20260421001',
        refundEntryEnabled: true,
        status: 'PENDING_PAYMENT',
        ticketType: 'E_TICKET',
        timeline: {
          description: 'Awaiting payment confirmation.',
          title: 'Pending payment',
        },
        totalAmount: 399,
      },
      {
        createdAt: '2026-04-21T12:00:00.000Z',
        currency: 'CNY',
        event: {
          city: 'Shanghai',
          id: 'evt-2',
          minPrice: 599,
          published: true,
          refundEntryEnabled: true,
          saleStatus: 'ON_SALE',
          title: 'Arena Night',
          venueName: 'Stadium',
        },
        id: 'ord-2',
        orderNumber: 'MT20260421002',
        refundEntryEnabled: true,
        status: 'TICKET_ISSUED',
        ticketType: 'E_TICKET',
        timeline: {
          description: 'Ticket delivered.',
          title: 'Issued',
        },
        totalAmount: 599,
      },
    ]);

    expect(dashboard).toMatchObject({
      totalOrders: 2,
      openAfterSalesCount: 1,
      pendingActionCount: 1,
      latestOrderLabel: 'Arena Night',
    });
  });
});

describe('getRefundEntrySummary', () => {
  it('returns refund copy for eligible orders', () => {
    expect(
      getRefundEntrySummary({
        refundEntryEnabled: true,
        status: 'TICKET_ISSUED',
      }),
    ).toMatchObject({
      ctaLabel: '申请退款',
      eligible: true,
      title: '可申请退款',
    });
  });

  it('returns a waiting state when refund entry is closed', () => {
    expect(
      getRefundEntrySummary({
        refundEntryEnabled: false,
        status: 'PENDING_PAYMENT',
      }),
    ).toMatchObject({
      eligible: false,
      title: '暂不可售后',
    });
  });
});

describe('getPaymentResultMeta', () => {
  it('treats issued orders as a completed payment state', () => {
    expect(getPaymentResultMeta('TICKET_ISSUED')).toMatchObject({
      title: '购票成功',
      tone: 'success',
    });
  });

  it('keeps pending orders in a waiting state', () => {
    expect(getPaymentResultMeta('PENDING_PAYMENT')).toMatchObject({
      tone: 'warning',
      title: '支付结果确认中',
    });
  });
});

describe('getOrderTimelineMeta', () => {
  it('uses ticket type to describe issued orders', () => {
    expect(getOrderTimelineMeta('TICKET_ISSUED', 'PAPER_TICKET')).toMatchObject({
      title: '出票完成',
      description: '纸质票信息已确认',
    });
  });

  it('maps pending payment to concise Chinese status copy', () => {
    expect(getOrderTimelineMeta('PENDING_PAYMENT', 'E_TICKET')).toMatchObject({
      title: '等待支付',
      description: '请在有效时间内完成支付',
    });
  });
});
