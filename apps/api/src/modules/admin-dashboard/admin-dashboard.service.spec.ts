import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  const prismaMock = {
    adminAuditLog: {
      findMany: jest.fn(),
    },
    event: {
      count: jest.fn(),
    },
    orderFlag: {
      findMany: jest.fn(),
    },
    refundRequest: {
      count: jest.fn(),
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns summary counts and at most 10 ISO recent actions', async () => {
    (prismaMock.event.count as jest.Mock)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(6);
    (prismaMock.refundRequest.count as jest.Mock).mockResolvedValue(3);
    (prismaMock.orderFlag.findMany as jest.Mock).mockResolvedValue([
      { orderId: 'order_001' },
      { orderId: 'order_002' },
      { orderId: 'order_001' },
    ]);
    (prismaMock.adminAuditLog.findMany as jest.Mock).mockResolvedValue(
      Array.from({ length: 12 }, (_value, index) => ({
        action: index === 0 ? 'ADMIN_LOGIN' : 'ADMIN_USER_CREATED',
        createdAt: new Date(`2026-04-21T0${index % 10}:00:00.000Z`),
        id: `audit_${index + 1}`,
        payload: {
          index,
        },
        targetId: `target_${index + 1}`,
        targetType: 'ADMIN_USER',
        user: {
          email: 'ops@miniticket.local',
          id: 'seed-admin-ops',
          name: 'Ops Lead',
        },
      })),
    );

    const service = new AdminDashboardService(prismaMock);
    const result = await service.getSummary();

    expect(result).toEqual({
      activeEventCount: 4,
      flaggedOrderCount: 2,
      pendingRefundCount: 3,
      recentActions: expect.arrayContaining([
        expect.objectContaining({
          action: 'ADMIN_LOGIN',
          createdAt: '2026-04-21T00:00:00.000Z',
          id: 'audit_1',
          targetId: 'target_1',
          targetType: 'ADMIN_USER',
        }),
      ]),
      upcomingEventCount: 6,
    });
    expect(result.recentActions).toHaveLength(10);
    expect(result.recentActions[0]).toMatchObject({
      action: 'ADMIN_LOGIN',
      createdAt: '2026-04-21T00:00:00.000Z',
      id: 'audit_1',
      targetId: 'target_1',
      targetType: 'ADMIN_USER',
    });
    expect(prismaMock.event.count).toHaveBeenNthCalledWith(1, {
      where: {
        published: true,
        saleStatus: 'ON_SALE',
      },
    });
    expect(prismaMock.event.count).toHaveBeenNthCalledWith(2, {
      where: {
        published: true,
        saleStatus: 'UPCOMING',
      },
    });
    expect(prismaMock.refundRequest.count).toHaveBeenCalledWith({
      where: {
        status: {
          in: ['REVIEWING', 'PROCESSING'],
        },
      },
    });
    expect(prismaMock.orderFlag.findMany).toHaveBeenCalledWith({
      distinct: ['orderId'],
      select: {
        orderId: true,
      },
    });
    expect(prismaMock.adminAuditLog.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        action: true,
        createdAt: true,
        id: true,
        payload: true,
        targetId: true,
        targetType: true,
        user: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
      },
      take: 10,
    });
  });
});
