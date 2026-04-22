import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../../common/prisma/prisma.service';
import { OrderTimelineService } from '../orders/order-timeline.service';
import { AdminOrdersService } from './admin-orders.service';

describe('AdminOrdersService', () => {
  const prismaMock = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    orderFlag: {
      create: jest.fn(),
    },
    orderNote: {
      create: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    (prismaMock.order.findMany as jest.Mock).mockReset();
    (prismaMock.order.findUnique as jest.Mock).mockReset();
    (prismaMock.orderNote.create as jest.Mock).mockReset();
    (prismaMock.orderFlag.create as jest.Mock).mockReset();
  });

  it('lists admin orders with timeline and latest refund context', async () => {
    (prismaMock.order.findMany as jest.Mock).mockResolvedValue([
      {
        createdAt: new Date('2026-04-21T08:00:00.000Z'),
        currency: 'CNY',
        id: 'order_1',
        items: [
          {
            quantity: 2,
            ticketTier: {
              name: 'Section A',
              session: {
                name: '2026-05-01 19:30',
                event: {
                  city: 'Shanghai',
                  id: 'event_1',
                  title: 'Beta Concert',
                  venueName: 'Expo Arena',
                },
              },
            },
          },
        ],
        orderNumber: 'AT202604210001',
        payments: [
          {
            paidAt: new Date('2026-04-21T08:10:00.000Z'),
            providerTxnId: 'pay_001',
            status: 'SUCCEEDED',
          },
        ],
        refundRequests: [
          {
            refundNo: 'RFD-001',
            status: 'REVIEWING',
          },
        ],
        status: 'REFUND_REVIEWING',
        ticketType: 'E_TICKET',
        totalAmount: 256000,
        userId: 'cust_1',
      },
    ]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        OrderTimelineService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminOrdersService);

    await expect(service.listOrders()).resolves.toEqual([
      {
        createdAt: '2026-04-21T08:00:00.000Z',
        currency: 'CNY',
        event: {
          city: 'Shanghai',
          id: 'event_1',
          title: 'Beta Concert',
          venueName: 'Expo Arena',
        },
        id: 'order_1',
        itemCount: 2,
        latestPayment: {
          paidAt: '2026-04-21T08:10:00.000Z',
          providerTxnId: 'pay_001',
          status: 'SUCCEEDED',
        },
        latestRefundRequest: {
          refundNo: 'RFD-001',
          status: 'REVIEWING',
        },
        orderNumber: 'AT202604210001',
        sessionName: '2026-05-01 19:30',
        status: 'REFUND_REVIEWING',
        ticketType: 'E_TICKET',
        timeline: {
          description: expect.any(String),
          title: expect.any(String),
        },
        totalAmount: 256000,
        userId: 'cust_1',
      },
    ]);

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          createdAt: 'desc',
        },
      }),
    );
  });

  it('returns order detail with notes and flags', async () => {
    (prismaMock.order.findUnique as jest.Mock).mockResolvedValue({
      createdAt: new Date('2026-04-21T08:00:00.000Z'),
      currency: 'CNY',
      flags: [
        {
          createdAt: new Date('2026-04-21T08:20:00.000Z'),
          createdBy: {
            name: 'Super Admin',
          },
          id: 'flag_1',
          note: 'Payment completed but fulfillment has not started after a long delay',
          type: 'Exception flag',
        },
      ],
      id: 'order_1',
      items: [
        {
          id: 'item_1',
          quantity: 2,
          ticketTier: {
            name: 'Section A',
            session: {
              id: 'session_1',
              name: '2026-05-01 19:30',
              event: {
                city: 'Shanghai',
                id: 'event_1',
                title: 'Beta Concert',
                venueName: 'Expo Arena',
              },
            },
          },
          totalAmount: 256000,
          unitPrice: 128000,
          viewer: {
            id: 'viewer_1',
            mobile: '13800138000',
            name: 'Zhang San',
          },
        },
      ],
      payments: [
        {
          createdAt: new Date('2026-04-21T08:05:00.000Z'),
          paidAt: new Date('2026-04-21T08:10:00.000Z'),
          providerTxnId: 'pay_001',
          status: 'SUCCEEDED',
        },
      ],
      notes: [
        {
          content: 'Contacted the customer to confirm identity details',
          createdAt: new Date('2026-04-21T08:15:00.000Z'),
          createdBy: {
            name: 'Super Admin',
          },
          id: 'note_1',
        },
      ],
      refundRequests: [
        {
          id: 'refund_1',
          lastHandledAt: new Date('2026-04-21T08:30:00.000Z'),
          processedAt: undefined,
          processedByUserId: undefined,
          reason: 'USER_IDENTITY_ERROR',
          rejectionReason: undefined,
          refundAmount: 80000,
          refundNo: 'RFD-001',
          requestedAt: new Date('2026-04-21T08:00:00.000Z'),
          requestedAmount: 100000,
          reviewNote: undefined,
          reviewedByUserId: undefined,
          serviceFee: 20000,
          status: 'REVIEWING',
        },
      ],
      orderNumber: 'AT202604210001',
      refundEntryEnabled: true,
      status: 'REFUND_REVIEWING',
      ticketType: 'E_TICKET',
      totalAmount: 256000,
      userId: 'cust_1',
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        OrderTimelineService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminOrdersService);

    const detail = await service.getOrderDetail('order_1');

    expect(detail).toEqual(
      expect.objectContaining({
        createdAt: '2026-04-21T08:00:00.000Z',
        currency: 'CNY',
        event: {
          city: 'Shanghai',
          id: 'event_1',
          title: 'Beta Concert',
          venueName: 'Expo Arena',
        },
        flags: [
          expect.objectContaining({
            createdAt: '2026-04-21T08:20:00.000Z',
            createdByName: 'Super Admin',
            id: 'flag_1',
            note: 'Payment completed but fulfillment has not started after a long delay',
            type: 'Exception flag',
          }),
        ],
        id: 'order_1',
        items: [
          expect.objectContaining({
            id: 'item_1',
            quantity: 2,
            sessionId: 'session_1',
            sessionName: '2026-05-01 19:30',
            tierName: 'Section A',
            totalAmount: 256000,
            unitPrice: 128000,
            viewer: expect.objectContaining({
              id: 'viewer_1',
              mobile: '13800138000',
              name: 'Zhang San',
            }),
          }),
        ],
        notes: [
          expect.objectContaining({
            content: 'Contacted the customer to confirm identity details',
            createdAt: '2026-04-21T08:15:00.000Z',
            createdByName: 'Super Admin',
            id: 'note_1',
          }),
        ],
        payments: [
          expect.objectContaining({
            createdAt: '2026-04-21T08:05:00.000Z',
            paidAt: '2026-04-21T08:10:00.000Z',
            providerTxnId: 'pay_001',
            status: 'SUCCEEDED',
          }),
        ],
        refundRequests: [
          expect.objectContaining({
            id: 'refund_1',
            reason: 'USER_IDENTITY_ERROR',
            refundAmount: 80000,
            refundNo: 'RFD-001',
            requestedAt: '2026-04-21T08:00:00.000Z',
            requestedAmount: 100000,
            serviceFee: 20000,
            status: 'REVIEWING',
          }),
        ],
        orderNumber: 'AT202604210001',
        refundEntryEnabled: true,
        status: 'REFUND_REVIEWING',
        ticketType: 'E_TICKET',
        timeline: expect.objectContaining({
          description: expect.any(String),
          title: expect.any(String),
        }),
        totalAmount: 256000,
        userId: 'cust_1',
      }),
    );

    expect(prismaMock.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'order_1',
        },
      }),
    );
  });

  it('adds an internal note with the admin author attached', async () => {
    (prismaMock.order.findUnique as jest.Mock).mockResolvedValue({
      id: 'order_1',
    });
    (prismaMock.orderNote.create as jest.Mock).mockResolvedValue({
      content: 'Contacted the customer to confirm identity details',
      createdAt: new Date('2026-04-21T08:30:00.000Z'),
      createdBy: {
        name: 'Super Admin',
      },
      id: 'note_1',
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        OrderTimelineService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminOrdersService);

    await expect(
      service.addNote(
        'order_1',
        {
          content: '  Contacted the customer to confirm identity details  ',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: 'Super Admin',
          role: 'ADMIN',
        },
      ),
    ).resolves.toEqual({
      content: 'Contacted the customer to confirm identity details',
      createdAt: '2026-04-21T08:30:00.000Z',
      createdByName: 'Super Admin',
      id: 'note_1',
    });

    expect(prismaMock.orderNote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          content: 'Contacted the customer to confirm identity details',
          createdByUserId: 'admin_1',
          orderId: 'order_1',
        },
      }),
    );
  });

  it('adds an exception flag with the admin author attached', async () => {
    (prismaMock.order.findUnique as jest.Mock).mockResolvedValue({
      id: 'order_1',
    });
    (prismaMock.orderFlag.create as jest.Mock).mockResolvedValue({
      createdAt: new Date('2026-04-21T08:40:00.000Z'),
      createdBy: {
        name: 'Super Admin',
      },
      id: 'flag_1',
      note: 'Payment completed but fulfillment has not started after a long delay',
      type: 'Exception flag',
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        OrderTimelineService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminOrdersService);

    await expect(
      service.addFlag(
        'order_1',
        {
          note: '  Payment completed but fulfillment has not started after a long delay ',
          type: '  Exception flag  ',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: 'Super Admin',
          role: 'OPERATIONS',
        },
      ),
    ).resolves.toEqual({
      createdAt: '2026-04-21T08:40:00.000Z',
      createdByName: 'Super Admin',
      id: 'flag_1',
      note: 'Payment completed but fulfillment has not started after a long delay',
      type: 'Exception flag',
    });

    expect(prismaMock.orderFlag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          createdByUserId: 'admin_1',
          note: 'Payment completed but fulfillment has not started after a long delay',
          orderId: 'order_1',
          type: 'Exception flag',
        },
      }),
    );
  });

  it('rejects note creation when the order does not exist', async () => {
    (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(null);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        OrderTimelineService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminOrdersService);

    await expect(
      service.addNote(
        'missing_order',
        {
          content: 'Need manual review',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: 'Super Admin',
          role: 'ADMIN',
        },
      ),
    ).rejects.toThrow(new NotFoundException('订单不存在。'));
  });
});
