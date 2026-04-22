import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { UpstreamTicketingGateway } from '../../common/vendors/upstream-ticketing.gateway';
import { ORDER_STATUS } from '../orders/order-status';

type AdminActor = {
  id: string;
  name: string;
};

type RefundRequestRecord = {
  id: string;
  lastHandledAt: Date | null;
  order: {
    currency: string;
    id: string;
    orderNumber: string;
    status: string;
    userId: string;
  };
  orderId: string;
  processedByUserId: string | null;
  reason: string;
  processedAt: Date | null;
  refundAmount: number;
  refundNo: string;
  requestedAt: Date;
  requestedAmount: number;
  rejectionReason: string | null;
  reviewNote: string | null;
  reviewedByUserId: string | null;
  serviceFee: number;
  status: 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
  requesterName: string;
};

type RefundRequestUpdateRecord = Omit<RefundRequestRecord, 'requesterName'>;

type AdminRefundDetail = {
  amount: number;
  currency: string;
  id: string;
  lastHandledAt?: string;
  orderId: string;
  orderNumber: string;
  processedByUserId?: string;
  reason: string;
  rejectionReason?: string;
  refundNo: string;
  requestedAt: string;
  requesterName: string;
  reviewNote?: string;
  reviewedByUserId?: string;
  serviceFee: number;
  status: RefundRequestRecord['status'];
};

type AdminRefundActionNote = {
  note?: string;
};

type AdminRefundRejectInput = {
  reason: string;
};

function normalizeOptionalText(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeDetail(record: RefundRequestRecord): AdminRefundDetail {
  return {
    amount: record.refundAmount,
    currency: record.order.currency,
    id: record.id,
    lastHandledAt: record.lastHandledAt?.toISOString(),
    orderId: record.order.id,
    orderNumber: record.order.orderNumber,
    processedByUserId: record.processedByUserId ?? undefined,
    reason: record.reason,
    rejectionReason: record.rejectionReason ?? undefined,
    refundNo: record.refundNo,
    requestedAt: record.requestedAt.toISOString(),
    requesterName: record.requesterName,
    reviewNote: record.reviewNote ?? undefined,
    reviewedByUserId: record.reviewedByUserId ?? undefined,
    serviceFee: record.serviceFee,
    status: record.status,
  };
}

@Injectable()
export class AdminRefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upstreamTicketingGateway: UpstreamTicketingGateway,
  ) {}

  private async loadRequesterName(userId: string) {
    const user = await this.prisma.user.findUnique({
      select: {
        name: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('退款申请不存在。');
    }

    return user.name;
  }

  private async loadRefundRequest(refundId: string) {
    const refundRequest = await this.prisma.refundRequest.findUnique({
      select: {
        id: true,
        lastHandledAt: true,
        order: {
          select: {
            currency: true,
            id: true,
            orderNumber: true,
            status: true,
            userId: true,
          },
        },
        orderId: true,
        processedByUserId: true,
        reason: true,
        processedAt: true,
        refundAmount: true,
        refundNo: true,
        requestedAt: true,
        requestedAmount: true,
        rejectionReason: true,
        reviewNote: true,
        reviewedByUserId: true,
        serviceFee: true,
        status: true,
      },
      where: {
        id: refundId,
      },
    });

    if (!refundRequest) {
      throw new NotFoundException('退款申请不存在。');
    }

    return {
      ...(refundRequest as RefundRequestUpdateRecord),
      requesterName: await this.loadRequesterName(refundRequest.order.userId),
    } as RefundRequestRecord;
  }

  private assertReviewing(refundRequest: RefundRequestRecord, message: string) {
    if (refundRequest.status !== 'REVIEWING') {
      throw new BadRequestException(message);
    }
  }

  private assertApproved(refundRequest: RefundRequestRecord, message: string) {
    if (refundRequest.status !== 'APPROVED') {
      throw new BadRequestException(message);
    }
  }

  async approveRefund(
    refundId: string,
    input: AdminRefundActionNote,
    admin: AdminActor,
  ): Promise<AdminRefundDetail> {
    const refundRequest = await this.loadRefundRequest(refundId);
    this.assertReviewing(refundRequest, '当前退款状态不允许审核通过。');

    await this.prisma.refundRequest.update({
      data: {
        lastHandledAt: new Date(),
        reviewNote: normalizeOptionalText(input.note),
        reviewedByUserId: admin.id,
        status: 'APPROVED',
      },
      where: {
        id: refundId,
      },
    });

    return normalizeDetail(await this.loadRefundRequest(refundId));
  }

  async rejectRefund(
    refundId: string,
    input: AdminRefundRejectInput,
    admin: AdminActor,
  ): Promise<AdminRefundDetail> {
    const refundRequest = await this.loadRefundRequest(refundId);
    this.assertReviewing(refundRequest, '当前退款状态不允许驳回。');

    const rejectionReason = input.reason.trim();

    if (!rejectionReason) {
      throw new BadRequestException('驳回原因不能为空。');
    }

    await this.prisma.refundRequest.update({
      data: {
        lastHandledAt: new Date(),
        rejectionReason,
        reviewedByUserId: admin.id,
        status: 'REJECTED',
      },
      where: {
        id: refundId,
      },
    });

    return normalizeDetail(await this.loadRefundRequest(refundId));
  }

  async processRefund(
    refundId: string,
    input: AdminRefundActionNote,
    admin: AdminActor,
  ): Promise<AdminRefundDetail> {
    const refundRequest = await this.loadRefundRequest(refundId);
    this.assertApproved(refundRequest, '当前退款状态不允许发起退款处理。');
    void input.note;

    await this.upstreamTicketingGateway.submitRefund({
      amount: refundRequest.refundAmount,
      orderId: refundRequest.order.id,
      refundNo: refundRequest.refundNo,
    });

    await this.prisma.order.update({
      data: {
        status: ORDER_STATUS.REFUND_PROCESSING,
      },
      where: {
        id: refundRequest.order.id,
      },
    });

    await this.prisma.refundRequest.update({
      data: {
        lastHandledAt: new Date(),
        processedByUserId: admin.id,
        status: 'PROCESSING',
      },
      where: {
        id: refundId,
      },
    });

    return normalizeDetail(await this.loadRefundRequest(refundId));
  }
}
