import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

type AdminDashboardRecentAction = {
  action: string;
  actor: {
    email: string;
    id: string;
    name: string;
  };
  createdAt: string;
  id: string;
  payload: Prisma.JsonValue | null;
  targetId: string;
  targetType: string;
};

type AdminDashboardSummary = {
  activeEventCount: number;
  flaggedOrderCount: number;
  pendingRefundCount: number;
  recentActions: AdminDashboardRecentAction[];
  upcomingEventCount: number;
};

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<AdminDashboardSummary> {
    const [
      activeEventCount,
      upcomingEventCount,
      pendingRefundCount,
      flaggedOrders,
      recentActions,
    ] = await Promise.all([
      this.prisma.event.count({
        where: {
          published: true,
          saleStatus: 'ON_SALE',
        },
      }),
      this.prisma.event.count({
        where: {
          published: true,
          saleStatus: 'UPCOMING',
        },
      }),
      this.prisma.refundRequest.count({
        where: {
          status: {
            in: ['REVIEWING', 'PROCESSING'],
          },
        },
      }),
      this.prisma.orderFlag.findMany({
        distinct: ['orderId'],
        select: {
          orderId: true,
        },
      }),
      this.prisma.adminAuditLog.findMany({
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
      }),
    ]);

    return {
      activeEventCount,
      flaggedOrderCount: new Set(flaggedOrders.map((order) => order.orderId)).size,
      pendingRefundCount,
      recentActions: recentActions.slice(0, 10).map((action) => ({
        action: action.action,
        actor: action.user,
        createdAt: action.createdAt.toISOString(),
        id: action.id,
        payload: action.payload,
        targetId: action.targetId,
        targetType: action.targetType,
      })),
      upcomingEventCount,
    };
  }
}
