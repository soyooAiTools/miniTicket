import { describe, expect, it } from 'vitest';

import {
  adminDashboardSummarySchema,
  adminEventDraftSchema,
  adminOrderDetailSchema,
  adminRefundApproveRequestSchema,
  adminRefundDetailSchema,
  adminRefundProcessRequestSchema,
  adminRefundQueueItemSchema,
  adminRefundRejectRequestSchema,
  adminRefundStatusSchema,
  adminSessionSchema,
  adminUserCreateRequestSchema,
  adminUserListItemSchema,
  adminUserUpdateRequestSchema,
  eventCatalogSummarySchema,
  eventDetailSchema,
  eventOperationsUpdateSchema,
  eventSummarySchema,
  miniappSessionSchema,
  orderDetailSchema,
  orderListItemSchema,
  orderTimelineItemSchema,
  ticketTierSummarySchema,
  wechatPaymentIntentSchema,
  viewerSchema,
} from './index';

describe('shared contracts', () => {
  it('validates an event summary payload', () => {
    expect(
      eventSummarySchema.parse({
        id: 'evt_20260417_001',
        title: 'Jay Chou Carnival World Tour',
        city: 'Shanghai',
        venueName: 'Shanghai Stadium',
        saleStatus: 'ON_SALE',
        minPrice: 499,
      }),
    ).toMatchObject({
      saleStatus: 'ON_SALE',
      minPrice: 499,
    });
  });

  it('rejects event summary payloads with session-only fields', () => {
    expect(() =>
      eventSummarySchema.parse({
        id: 'evt_20260417_001',
        title: 'Jay Chou Carnival World Tour',
        city: 'Shanghai',
        venueName: 'Shanghai Stadium',
        startsAt: '2026-05-01T19:30:00.000Z',
        saleStatus: 'ON_SALE',
        minPrice: 499,
      }),
    ).toThrow();
  });

  it('validates a catalog event payload with sale and refund switches', () => {
    expect(
      eventCatalogSummarySchema.parse({
        id: 'evt_20260417_001',
        title: 'Jay Chou Carnival World Tour',
        city: 'Shanghai',
        venueName: 'Shanghai Stadium',
        saleStatus: 'ON_SALE',
        minPrice: 499,
        published: true,
        refundEntryEnabled: false,
      }),
    ).toMatchObject({
      published: true,
      refundEntryEnabled: false,
      saleStatus: 'ON_SALE',
    });
  });

  it('validates an event detail payload with sessions and ticket tiers', () => {
    expect(
      eventDetailSchema.parse({
        id: 'evt_20260417_001',
        title: 'Jay Chou Carnival World Tour',
        city: 'Shanghai',
        venueName: 'Shanghai Stadium',
        description: 'A beta event detail payload.',
        saleStatus: 'ON_SALE',
        minPrice: 499,
        published: true,
        refundEntryEnabled: true,
        sessions: [
          {
            id: 'session_001',
            name: '2026-05-01 19:30',
            startsAt: '2026-05-01T11:30:00.000Z',
            saleStartsAt: '2026-04-20T12:00:00.000Z',
            saleEndsAt: '2026-04-30T12:00:00.000Z',
            ticketTiers: [
              {
                id: 'tier_001',
                name: 'Inner Field',
                price: 499,
                inventory: 200,
                ticketType: 'E_TICKET',
                purchaseLimit: 2,
                refundable: true,
                refundDeadlineAt: '2026-04-28T12:00:00.000Z',
                requiresRealName: true,
                sortOrder: 1,
              },
            ],
          },
        ],
      }),
    ).toMatchObject({
      published: true,
      refundEntryEnabled: true,
      sessions: [
        {
          name: '2026-05-01 19:30',
          ticketTiers: [
            {
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
    });
  });

  it('validates a ticket tier summary payload through the planned symbol', () => {
    expect(
      ticketTierSummarySchema.parse({
        id: 'tier_001',
        name: 'Inner Field',
        price: 499,
        inventory: 200,
        ticketType: 'E_TICKET',
        purchaseLimit: 2,
        refundable: true,
        refundDeadlineAt: '2026-04-28T12:00:00.000Z',
        requiresRealName: true,
        sortOrder: 1,
      }),
    ).toMatchObject({
      ticketType: 'E_TICKET',
      inventory: 200,
    });
  });

  it('rejects a ticket tier summary payload without regional rule fields', () => {
    expect(() =>
      ticketTierSummarySchema.parse({
        id: 'tier_001',
        name: 'Inner Field',
        price: 499,
        inventory: 200,
        ticketType: 'E_TICKET',
      }),
    ).toThrow();
  });

  it('validates an admin session payload', () => {
    expect(
      adminSessionSchema.parse({
        user: {
          email: 'ops@miniticket.local',
          id: 'user_ops_001',
          name: '鐜板満杩愯惀',
          role: 'OPERATIONS',
        },
      }),
    ).toMatchObject({
      user: {
        role: 'OPERATIONS',
      },
    });
  });

  it('validates an admin dashboard summary payload', () => {
    expect(
      adminDashboardSummarySchema.parse({
        activeEventCount: 3,
        upcomingEventCount: 2,
        pendingRefundCount: 5,
        flaggedOrderCount: 6,
        recentActions: [
          {
            action: 'EVENT_PUBLISHED',
            actorName: '超级管理员',
            createdAt: '2026-04-21T08:30:00.000Z',
            targetId: 'evt_shanghai_001',
            targetType: 'EVENT',
          },
        ],
      }),
    ).toMatchObject({
      pendingRefundCount: 5,
      recentActions: [
        {
          action: 'EVENT_PUBLISHED',
        },
      ],
    });
  });

  it('validates an admin event draft payload with regional tiers and child ids', () => {
    expect(
      adminEventDraftSchema.parse({
        city: 'Shanghai',
        venueName: 'Shanghai Stadium',
        venueAddress: 'Shanghai Stadium Road 1',
        title: 'Jay Chou Carnival World Tour',
        description: 'Admin draft payload for the MVP.',
        coverImageUrl: 'https://example.com/cover.jpg',
        published: false,
        sessions: [
          {
            id: 'session_001',
            name: '2026-05-01 19:30',
            startsAt: '2026-05-01T11:30:00.000Z',
            saleStartsAt: '2026-04-20T12:00:00.000Z',
            saleEndsAt: '2026-04-30T12:00:00.000Z',
            tiers: [
              {
                id: 'tier_001',
                name: 'Inner Field',
                price: 499,
                inventory: 200,
                ticketType: 'E_TICKET',
                purchaseLimit: 2,
                refundable: true,
                refundDeadlineAt: '2026-04-28T12:00:00.000Z',
                requiresRealName: true,
                sortOrder: 1,
              },
            ],
          },
        ],
      }),
    ).toMatchObject({
      published: false,
      sessions: [
        {
          id: 'session_001',
          tiers: [
            {
              id: 'tier_001',
              purchaseLimit: 2,
            },
          ],
        },
      ],
    });
  });

  it('validates an admin order detail payload with notes and flags', () => {
    expect(
      adminOrderDetailSchema.parse({
        id: 'ord_20260417_001',
        orderNumber: 'AT202604170001',
        status: 'PAID_PENDING_FULFILLMENT',
        ticketType: 'E_TICKET',
        totalAmount: 998,
        currency: 'CNY',
        createdAt: '2026-04-17T12:00:00.000Z',
        event: {
          id: 'evt_20260417_001',
          title: 'Jay Chou Carnival World Tour',
          city: 'Shanghai',
          venueName: 'Shanghai Stadium',
          saleStatus: 'ON_SALE',
          minPrice: 499,
        },
        timeline: {
          title: 'Pending Fulfillment',
          description:
            'E-ticket confirmation arrives no later than 3 days before the show.',
        },
        refundEntryEnabled: true,
        notes: [
          {
            id: 'note_001',
            content: 'Buyer requested a seat change.',
            createdAt: '2026-04-17T12:10:00.000Z',
            createdByName: '现场运营',
          },
        ],
        flags: [
          {
            id: 'flag_001',
            type: '异常单',
            note: '支付成功后长时间未出票',
            createdAt: '2026-04-17T12:11:00.000Z',
            createdByName: '现场运营',
          },
          {
            id: 'flag_002',
            type: '浜哄伐澶嶆牳',
            createdAt: '2026-04-17T12:12:00.000Z',
            createdByName: '现场运营',
          },
        ],
        items: [
          {
            id: 'item_001',
            sessionId: 'session_001',
            sessionName: '2026-05-01 19:30',
            tierName: 'Inner Field',
            quantity: 2,
            unitPrice: 499,
            totalAmount: 998,
            viewer: {
              id: 'viewer_001',
              name: '寮犱笁',
              mobile: '13800138000',
            },
          },
        ],
      }),
    ).toMatchObject({
      notes: [
        {
          createdByName: '现场运营',
        },
      ],
      flags: [
        {
          type: '异常单',
        },
        {
          type: '浜哄伐澶嶆牳',
        },
      ],
    });
  });

  it('validates an admin user create payload with password rules', () => {
    expect(
      adminUserCreateRequestSchema.parse({
        email: 'ops2@miniticket.local',
        name: '绁ㄥ姟杩愯惀 B',
        password: 'OpsOps123!',
        role: 'OPERATIONS',
      }),
    ).toMatchObject({
      role: 'OPERATIONS',
      email: 'ops2@miniticket.local',
    });
  });

  it('rejects an admin user create payload with a short password', () => {
    expect(() =>
      adminUserCreateRequestSchema.parse({
        email: 'ops2@miniticket.local',
        name: '绁ㄥ姟杩愯惀 B',
        password: 'short',
        role: 'OPERATIONS',
      }),
    ).toThrow();
  });

  it('validates an admin user update payload with password rules', () => {
    expect(
      adminUserUpdateRequestSchema.parse({
        id: 'admin_001',
        password: 'NewPass123!',
        enabled: true,
      }),
    ).toMatchObject({
      id: 'admin_001',
      enabled: true,
    });
  });

  it('validates an admin user list item payload', () => {
    expect(
      adminUserListItemSchema.parse({
        id: 'admin_001',
        name: '超级管理员',
        email: 'admin@miniticket.local',
        role: 'ADMIN',
        enabled: true,
        createdAt: '2026-04-01T12:00:00.000Z',
        updatedAt: '2026-04-20T12:00:00.000Z',
      }),
    ).toMatchObject({
      role: 'ADMIN',
      enabled: true,
    });
  });

  it('validates admin refund statuses and queue payloads', () => {
    expect(adminRefundStatusSchema.parse('REVIEWING')).toBe('REVIEWING');
    expect(
      adminRefundQueueItemSchema.parse({
        id: 'refund_001',
        refundNo: 'RFD-001',
        orderId: 'ord_001',
        orderNumber: 'AT202604210001',
        status: 'REVIEWING',
        amount: 80000,
        currency: 'CNY',
        reason: 'USER_IDENTITY_ERROR',
        requesterName: '张三',
        requestedAt: '2026-04-21T08:00:00.000Z',
      }),
    ).toMatchObject({
      status: 'REVIEWING',
      amount: 80000,
      refundNo: 'RFD-001',
    });
  });

  it('rejects a refund queue payload without refundNo', () => {
    expect(() =>
      adminRefundQueueItemSchema.parse({
        id: 'refund_001',
        orderId: 'ord_001',
        orderNumber: 'AT202604210001',
        status: 'REVIEWING',
        amount: 80000,
        currency: 'CNY',
        reason: 'USER_IDENTITY_ERROR',
        requesterName: '张三',
        requestedAt: '2026-04-21T08:00:00.000Z',
      }),
    ).toThrow();
  });

  it('rejects unsupported admin refund statuses', () => {
    expect(() => adminRefundStatusSchema.parse('PENDING_REVIEW')).toThrow();
    expect(() => adminRefundStatusSchema.parse('FAILED')).toThrow();
  });

  it('validates admin refund detail and request payloads', () => {
    expect(
      adminRefundDetailSchema.parse({
        id: 'refund_001',
        refundNo: 'RFD-001',
        orderId: 'ord_001',
        orderNumber: 'AT202604210001',
        status: 'APPROVED',
        amount: 80000,
        currency: 'CNY',
        reason: 'USER_IDENTITY_ERROR',
        requesterName: '张三',
        requestedAt: '2026-04-21T08:00:00.000Z',
        reviewedByUserId: 'user_ops_001',
        reviewNote: '实名问题已核验。',
        rejectionReason: '不符合退款条件',
        processedByUserId: 'user_ops_001',
        lastHandledAt: '2026-04-21T09:10:00.000Z',
      }),
    ).toMatchObject({
      status: 'APPROVED',
      refundNo: 'RFD-001',
      reviewedByUserId: 'user_ops_001',
      reviewNote: '实名问题已核验。',
    });

    expect(
      adminRefundApproveRequestSchema.parse({
        refundId: 'refund_001',
        note: '实名问题已核验。',
      }),
    ).toMatchObject({
      refundId: 'refund_001',
    });

    expect(
      adminRefundRejectRequestSchema.parse({
        refundId: 'refund_001',
        reason: '不符合退款条件',
      }),
    ).toMatchObject({
      reason: '不符合退款条件',
    });

    expect(
      adminRefundProcessRequestSchema.parse({
        refundId: 'refund_001',
      }),
    ).toMatchObject({
      refundId: 'refund_001',
    });
  });

  it('validates admin event updates with sale status and operation switches', () => {
    expect(
      eventOperationsUpdateSchema.parse({
        published: true,
        refundEntryEnabled: false,
        saleStatus: 'ON_SALE',
      }),
    ).toMatchObject({
      published: true,
      saleStatus: 'ON_SALE',
    });
  });

  it('rejects admin event updates without any operation fields', () => {
    expect(() => eventOperationsUpdateSchema.parse({})).toThrow();
  });

  it('validates a viewer payload with mainland mobile and 18-char id card', () => {
    expect(
      viewerSchema.parse({
        id: 'viewer_001',
        name: '寮犱笁',
        mobile: '13800138000',
        idCard: '110101199003071234',
      }),
    ).toMatchObject({
      mobile: '13800138000',
      idCard: '110101199003071234',
    });
  });

  it('rejects a viewer payload with an invalid mainland mobile', () => {
    expect(() =>
      viewerSchema.parse({
        id: 'viewer_001',
        name: '寮犱笁',
        mobile: '23800138000',
        idCard: '110101199003071234',
      }),
    ).toThrow();
  });

  it('validates an order detail payload', () => {
    expect(
      orderDetailSchema.parse({
        id: 'ord_20260417_001',
        orderNumber: 'AT202604170001',
        status: 'PAID_PENDING_FULFILLMENT',
        ticketType: 'E_TICKET',
        totalAmount: 998,
        currency: 'CNY',
        createdAt: '2026-04-17T12:00:00.000Z',
        event: {
          id: 'evt_20260417_001',
          title: 'Jay Chou Carnival World Tour',
          city: 'Shanghai',
          venueName: 'Shanghai Stadium',
          saleStatus: 'ON_SALE',
          minPrice: 499,
        },
        timeline: {
          title: 'Pending Fulfillment',
          description:
            'E-ticket confirmation arrives no later than 3 days before the show.',
        },
        refundEntryEnabled: true,
        items: [
          {
            id: 'item_001',
            sessionId: 'session_001',
            sessionName: '2026-05-01 19:30',
            tierName: 'Inner Field',
            quantity: 2,
            unitPrice: 499,
            totalAmount: 998,
            viewer: {
              id: 'viewer_001',
              name: '寮犱笁',
              mobile: '13800138000',
            },
          },
        ],
      }),
    ).toMatchObject({
      status: 'PAID_PENDING_FULFILLMENT',
      ticketType: 'E_TICKET',
      totalAmount: 998,
    });
  });

  it('rejects an order detail payload with a negative total amount', () => {
    expect(() =>
      orderDetailSchema.parse({
        id: 'ord_20260417_001',
        orderNumber: 'AT202604170001',
        status: 'PAID_PENDING_FULFILLMENT',
        ticketType: 'E_TICKET',
        totalAmount: -1,
        currency: 'CNY',
        viewer: {
          id: 'viewer_001',
          name: '寮犱笁',
          mobile: '13800138000',
          idCard: '110101199003071234',
        },
        event: {
          id: 'evt_20260417_001',
          title: 'Jay Chou Carnival World Tour',
          city: 'Shanghai',
          venueName: 'Shanghai Stadium',
          saleStatus: 'ON_SALE',
          minPrice: 499,
        },
        items: [
          {
            id: 'item_001',
            sessionId: 'session_001',
            sessionName: '2026-05-01 19:30',
            tierName: 'Inner Field',
            quantity: 2,
            unitPrice: 499,
            totalAmount: 998,
          },
        ],
      }),
    ).toThrow();
  });

  it('validates an order timeline payload', () => {
    expect(
      orderTimelineItemSchema.parse({
        title: 'Pending Fulfillment',
        description:
          'E-ticket confirmation arrives no later than 3 days before the show.',
      }),
    ).toMatchObject({
      title: 'Pending Fulfillment',
    });
  });

  it('validates a beta order list item payload', () => {
    expect(
      orderListItemSchema.parse({
        id: 'ord_20260417_001',
        orderNumber: 'AT202604170001',
        status: 'PAID_PENDING_FULFILLMENT',
        ticketType: 'E_TICKET',
        totalAmount: 998,
        currency: 'CNY',
        createdAt: '2026-04-17T12:00:00.000Z',
        refundEntryEnabled: true,
        timeline: {
          title: 'Pending Fulfillment',
          description:
            'E-ticket confirmation arrives no later than 3 days before the show.',
        },
        event: {
          id: 'evt_20260417_001',
          title: 'Jay Chou Carnival World Tour',
          city: 'Shanghai',
          venueName: 'Shanghai Stadium',
          saleStatus: 'ON_SALE',
          minPrice: 499,
        },
      }),
    ).toMatchObject({
      status: 'PAID_PENDING_FULFILLMENT',
      refundEntryEnabled: true,
    });
  });

  it('validates a miniapp session payload', () => {
    expect(
      miniappSessionSchema.parse({
        token: 'session-token-123',
        customer: {
          id: 'cust_001',
          openId: 'openid_abc123',
        },
        expiresAt: '2026-04-24T09:30:00.000Z',
      }),
    ).toMatchObject({
      customer: {
        openId: 'openid_abc123',
      },
      token: 'session-token-123',
    });
  });

  it('rejects a miniapp session payload with extra fields', () => {
    expect(() =>
      miniappSessionSchema.parse({
        token: 'session-token-123',
        customer: {
          id: 'cust_001',
          openId: 'openid_abc123',
          sessionKey: 'should-not-be-exposed',
        },
        expiresAt: '2026-04-24T09:30:00.000Z',
      }),
    ).toThrow();
  });

  it('validates the wechat payment intent contract', () => {
    expect(
      wechatPaymentIntentSchema.parse({
        appId: 'wx-app-id',
        nonceStr: 'nonce',
        packageValue: 'prepay_id=wx123',
        paySign: 'signature',
        signType: 'RSA',
        timeStamp: '1713355200',
      }),
    ).toMatchObject({
      packageValue: 'prepay_id=wx123',
      signType: 'RSA',
    });
  });
});



