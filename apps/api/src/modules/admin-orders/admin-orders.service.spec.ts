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
              name: '内场 A 区',
              session: {
                name: '2026-05-01 19:30',
                event: {
                  city: '上海',
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
          city: '上海',
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
            name: '超级管理员',
          },
          id: 'flag_1',
          note: '支付成功后长时间未出票',
          type: '异常票务',
        },
      ],
      id: 'order_1',
      items: [
        {
          id: 'item_1',
          quantity: 2,
          ticketTier: {
            name: '内场 A 区',
            session: {
              id: 'session_1',
              name: '2026-05-01 19:30',
              event: {
                city: '上海',
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
            name: '张三',
          },
        },
      ],
      notes: [
        {
          content: '联系用户确认实名信息',
          createdAt: new Date('2026-04-21T08:15:00.000Z'),
          createdBy: {
            name: '超级管理员',
          },
          id: 'note_1',
        },
      ],
      orderNumber: 'AT202604210001',
      refundEntryEnabled: true,
      status: 'REFUND_REVIEWING',
      ticketType: 'E_TICKET',
      totalAmount: 256000,
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        OrderTimelineService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminOrdersService);

    await expect(service.getOrderDetail('order_1')).resolves.toEqual({
      createdAt: '2026-04-21T08:00:00.000Z',
      currency: 'CNY',
      event: {
        city: '上海',
        id: 'event_1',
        title: 'Beta Concert',
        venueName: 'Expo Arena',
      },
      flags: [
        {
          createdAt: '2026-04-21T08:20:00.000Z',
          createdByName: '超级管理员',
          id: 'flag_1',
          note: '支付成功后长时间未出票',
          type: '异常票务',
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
          content: '联系用户确认实名信息',
          createdAt: '2026-04-21T08:15:00.000Z',
          createdByName: '超级管理员',
          id: 'note_1',
        },
      ],
      orderNumber: 'AT202604210001',
      refundEntryEnabled: true,
      status: 'REFUND_REVIEWING',
      ticketType: 'E_TICKET',
      timeline: {
        description: expect.any(String),
        title: expect.any(String),
      },
      totalAmount: 256000,
    });

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
      content: '联系用户确认实名信息',
      createdAt: new Date('2026-04-21T08:30:00.000Z'),
      createdBy: {
        name: '超级管理员',
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
          content: '  联系用户确认实名信息  ',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: '超级管理员',
          role: 'ADMIN',
        },
      ),
    ).resolves.toEqual({
      content: '联系用户确认实名信息',
      createdAt: '2026-04-21T08:30:00.000Z',
      createdByName: '超级管理员',
      id: 'note_1',
    });

    expect(prismaMock.orderNote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          content: '联系用户确认实名信息',
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
        name: '超级管理员',
      },
      id: 'flag_1',
      note: '支付成功后长时间未出票',
      type: '异常票务',
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
          note: '  支付成功后长时间未出票  ',
          type: '  异常票务  ',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: '超级管理员',
          role: 'OPERATIONS',
        },
      ),
    ).resolves.toEqual({
      createdAt: '2026-04-21T08:40:00.000Z',
      createdByName: '超级管理员',
      id: 'flag_1',
      note: '支付成功后长时间未出票',
      type: '异常票务',
    });

    expect(prismaMock.orderFlag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          createdByUserId: 'admin_1',
          note: '支付成功后长时间未出票',
          orderId: 'order_1',
          type: '异常票务',
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
          content: '需要人工核实',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: '超级管理员',
          role: 'ADMIN',
        },
      ),
    ).rejects.toThrow(new NotFoundException('订单不存在。'));
  });
});
