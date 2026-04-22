import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../../common/prisma/prisma.service';
import { UpstreamTicketingGateway } from '../../common/vendors/upstream-ticketing.gateway';
import { AdminRefundsService } from './admin-refunds.service';

describe('AdminRefundsService', () => {
  const prismaMock = {
    order: {
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    refundRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  } as unknown as PrismaService;

  const upstreamGatewayMock = {
    submitRefund: jest.fn(),
  } as unknown as UpstreamTicketingGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    (prismaMock.order.update as jest.Mock).mockReset();
    (prismaMock.user.findUnique as jest.Mock).mockReset();
    (prismaMock.refundRequest.findUnique as jest.Mock).mockReset();
    (prismaMock.refundRequest.update as jest.Mock).mockReset();
    (prismaMock.refundRequest.updateMany as jest.Mock).mockReset();
    (upstreamGatewayMock.submitRefund as jest.Mock).mockReset();
  });

  function buildReviewingRefund() {
    return {
      currency: 'CNY',
      id: 'refund_1',
      lastHandledAt: null,
      order: {
        currency: 'CNY',
        id: 'order_1',
        items: [
          {
            quantity: 2,
            ticketTier: {
              name: '鍐呭満 A 鍖?',
              session: {
                name: '2026-05-01 19:30',
                event: {
                  city: '涓婃捣',
                  id: 'event_1',
                  title: 'Beta Concert',
                  venueName: 'Expo Arena',
                },
              },
            },
          },
        ],
        orderNumber: 'AT202604210001',
        status: 'REFUND_REVIEWING',
        userId: 'cust_1',
      },
      orderId: 'order_1',
      processedByUserId: null,
      reason: 'USER_IDENTITY_ERROR',
      processedAt: null,
      refundAmount: 80000,
      refundNo: 'RFD-001',
      requestedAt: new Date('2026-04-21T08:00:00.000Z'),
      requestedAmount: 100000,
      rejectionReason: null,
      reviewNote: null,
      reviewedByUserId: null,
      serviceFee: 20000,
      status: 'REVIEWING',
    };
  }

  it('approves a reviewing refund request', async () => {
    (prismaMock.refundRequest.findUnique as jest.Mock).mockResolvedValue(
      buildReviewingRefund(),
    );
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      name: '张三',
    });
    (prismaMock.refundRequest.findUnique as jest.Mock)
      .mockResolvedValueOnce(buildReviewingRefund())
      .mockResolvedValueOnce({
        ...buildReviewingRefund(),
        lastHandledAt: new Date('2026-04-21T08:10:00.000Z'),
        reviewNote: '资料齐全',
        reviewedByUserId: 'admin_1',
        status: 'APPROVED',
      });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminRefundsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UpstreamTicketingGateway, useValue: upstreamGatewayMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminRefundsService);

    await expect(
      service.approveRefund(
        'refund_1',
        {
          note: '  资料齐全  ',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: '超级管理员',
          role: 'ADMIN',
        },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'refund_1',
        requesterName: '张三',
        reviewNote: '资料齐全',
        reviewedByUserId: 'admin_1',
        status: 'APPROVED',
      }),
    );

    expect(prismaMock.refundRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          lastHandledAt: expect.any(Date),
          reviewNote: '资料齐全',
          reviewedByUserId: 'admin_1',
          status: 'APPROVED',
        },
        where: {
          id: 'refund_1',
        },
      }),
    );
  });

  it('rejects approving a refund that is no longer reviewing', async () => {
    (prismaMock.refundRequest.findUnique as jest.Mock).mockResolvedValue({
      ...buildReviewingRefund(),
      status: 'APPROVED',
    });
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      name: '张三',
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminRefundsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UpstreamTicketingGateway, useValue: upstreamGatewayMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminRefundsService);

    await expect(
      service.approveRefund(
        'refund_1',
        {
          note: '资料齐全',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: '超级管理员',
          role: 'ADMIN',
        },
      ),
    ).rejects.toThrow(
      new BadRequestException('当前退款状态不允许审核通过。'),
    );
    expect(prismaMock.refundRequest.update).not.toHaveBeenCalled();
  });

  it('rejects a reviewing refund request', async () => {
    (prismaMock.refundRequest.findUnique as jest.Mock).mockResolvedValue(
      buildReviewingRefund(),
    );
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      name: '张三',
    });
    (prismaMock.refundRequest.findUnique as jest.Mock)
      .mockResolvedValueOnce(buildReviewingRefund())
      .mockResolvedValueOnce({
        ...buildReviewingRefund(),
        lastHandledAt: new Date('2026-04-21T08:12:00.000Z'),
        rejectionReason: '实名信息不一致',
        reviewedByUserId: 'admin_1',
        status: 'REJECTED',
      });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminRefundsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UpstreamTicketingGateway, useValue: upstreamGatewayMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminRefundsService);

    await expect(
      service.rejectRefund(
        'refund_1',
        {
          reason: '实名信息不一致',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: '超级管理员',
          role: 'OPERATIONS',
        },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'refund_1',
        requesterName: '张三',
        rejectionReason: '实名信息不一致',
        reviewedByUserId: 'admin_1',
        status: 'REJECTED',
      }),
    );

    expect(prismaMock.refundRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          lastHandledAt: expect.any(Date),
          rejectionReason: '实名信息不一致',
          reviewedByUserId: 'admin_1',
          status: 'REJECTED',
        },
        where: {
          id: 'refund_1',
        },
      }),
    );
  });

  it('processes an approved refund request and submits it upstream', async () => {
    (prismaMock.refundRequest.findUnique as jest.Mock).mockResolvedValue({
      ...buildReviewingRefund(),
      status: 'APPROVED',
    });
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      name: '张三',
    });
    (upstreamGatewayMock.submitRefund as jest.Mock).mockResolvedValue({
      externalRef: 'vendor_refund_1',
    });
    (prismaMock.order.update as jest.Mock).mockResolvedValue({
      id: 'order_1',
      status: 'REFUND_PROCESSING',
    });
    (prismaMock.refundRequest.findUnique as jest.Mock)
      .mockResolvedValueOnce({
        ...buildReviewingRefund(),
        status: 'APPROVED',
      })
      .mockResolvedValueOnce({
        ...buildReviewingRefund(),
        lastHandledAt: new Date('2026-04-21T08:20:00.000Z'),
        processedByUserId: 'admin_1',
        status: 'PROCESSING',
      });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminRefundsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UpstreamTicketingGateway, useValue: upstreamGatewayMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminRefundsService);

    await expect(
      service.processRefund(
        'refund_1',
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: '超级管理员',
          role: 'ADMIN',
        },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'refund_1',
        requesterName: '张三',
        processedByUserId: 'admin_1',
        status: 'PROCESSING',
      }),
    );

    expect(upstreamGatewayMock.submitRefund).toHaveBeenCalledWith({
      amount: 80000,
      orderId: 'order_1',
      refundNo: 'RFD-001',
    });
    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          status: 'REFUND_PROCESSING',
        },
        where: {
          id: 'order_1',
        },
      }),
    );
    expect(prismaMock.refundRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          lastHandledAt: expect.any(Date),
          processedByUserId: 'admin_1',
          status: 'PROCESSING',
        },
        where: {
          id: 'refund_1',
        },
      }),
    );
  });

  it('rejects processing a refund that has not been approved', async () => {
    (prismaMock.refundRequest.findUnique as jest.Mock).mockResolvedValue(
      buildReviewingRefund(),
    );
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      name: '张三',
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminRefundsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UpstreamTicketingGateway, useValue: upstreamGatewayMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminRefundsService);

    await expect(
      service.processRefund(
        'refund_1',
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: '超级管理员',
          role: 'ADMIN',
        },
      ),
    ).rejects.toThrow(
      new BadRequestException('当前退款状态不允许发起退款处理。'),
    );
    expect(upstreamGatewayMock.submitRefund).not.toHaveBeenCalled();
    expect(prismaMock.order.update).not.toHaveBeenCalled();
    expect(prismaMock.refundRequest.update).not.toHaveBeenCalled();
  });

  it('rejects a missing refund request', async () => {
    (prismaMock.refundRequest.findUnique as jest.Mock).mockResolvedValue(null);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminRefundsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UpstreamTicketingGateway, useValue: upstreamGatewayMock },
      ],
    }).compile();

    const service = moduleRef.get(AdminRefundsService);

    await expect(
      service.approveRefund(
        'missing_refund',
        {
          note: '资料齐全',
        },
        {
          email: 'ops@miniticket.local',
          id: 'admin_1',
          name: '超级管理员',
          role: 'ADMIN',
        },
      ),
    ).rejects.toThrow(new NotFoundException('退款申请不存在。'));
  });
});
