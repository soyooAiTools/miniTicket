import { describe, expect, it } from 'vitest';

import {
  adminDashboardSummarySchema,
  adminEventDraftSchema,
  adminOrderDetailSchema,
  adminSessionSchema,
  adminUserListItemSchema,
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

  it('validates an admin session payload', () => {
    expect(
      adminSessionSchema.parse({
        token: 'admin-session-token-123',
        user: {
          id: 'admin_001',
          name: 'Zhao Ling',
          role: 'EVENT_ADMIN',
        },
        expiresAt: '2026-04-24T09:30:00.000Z',
      }),
    ).toMatchObject({
      token: 'admin-session-token-123',
      user: {
        role: 'EVENT_ADMIN',
      },
    });
  });

  it('validates an admin dashboard summary payload', () => {
    expect(
      adminDashboardSummarySchema.parse({
        eventCount: 12,
        orderCount: 84,
        refundCount: 5,
        userCount: 1024,
        recentActions: [
          {
            id: 'action_001',
            action: 'APPROVED_REFUND',
            targetType: 'order',
            targetId: 'ord_20260417_001',
            actorName: 'Zhao Ling',
            createdAt: '2026-04-17T12:05:00.000Z',
          },
        ],
      }),
    ).toMatchObject({
      eventCount: 12,
      recentActions: [
        {
          action: 'APPROVED_REFUND',
        },
      ],
    });
  });

  it('validates an admin event draft payload with regional tiers', () => {
    expect(
      adminEventDraftSchema.parse({
        title: 'Jay Chou Carnival World Tour',
        city: 'Shanghai',
        venueName: 'Shanghai Stadium',
        description: 'Admin draft payload for the MVP.',
        coverImageUrl: 'https://example.com/cover.jpg',
        published: false,
        refundEntryEnabled: true,
        sessions: [
          {
            id: 'session_001',
            name: '2026-05-01 19:30',
            startsAt: '2026-05-01T11:30:00.000Z',
            saleStartsAt: '2026-04-20T12:00:00.000Z',
            saleEndsAt: '2026-04-30T12:00:00.000Z',
            regionalTiers: [
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
          regionalTiers: [
            {
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
            authorName: 'Zhao Ling',
          },
        ],
        flags: [
          {
            code: 'NEEDS_REVIEW',
            label: 'Needs review',
            active: true,
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
              name: 'Zhang San',
              mobile: '13800138000',
            },
          },
        ],
      }),
    ).toMatchObject({
      notes: [
        {
          content: 'Buyer requested a seat change.',
        },
      ],
      flags: [
        {
          code: 'NEEDS_REVIEW',
        },
      ],
    });
  });

  it('validates an admin user list item payload', () => {
    expect(
      adminUserListItemSchema.parse({
        id: 'admin_001',
        name: 'Zhao Ling',
        mobile: '13800138000',
        role: 'EVENT_ADMIN',
        active: true,
        createdAt: '2026-04-01T12:00:00.000Z',
        lastLoginAt: '2026-04-20T12:00:00.000Z',
      }),
    ).toMatchObject({
      role: 'EVENT_ADMIN',
      active: true,
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
        name: 'Zhang San',
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
        name: 'Zhang San',
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
              name: 'Zhang San',
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
          name: 'Zhang San',
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
