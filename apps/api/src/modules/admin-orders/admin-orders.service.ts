import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { OrderTimelineService } from '../orders/order-timeline.service';

type AdminActor = {
  id: string;
  name: string;
};

type AdminOrderEventSummary = {
  city: string;
  id: string;
  title: string;
  venueName: string;
};

type AdminOrderListItemRecord = {
  createdAt: Date;
  currency: string;
  id: string;
  items: Array<{
    quantity: number;
    ticketTier: {
      name: string;
      session: {
        id: string;
        name: string;
        event: AdminOrderEventSummary;
      };
    };
  }>;
  orderNumber: string;
  payments: Array<{
    paidAt: Date | null;
    providerTxnId: string | null;
    status: string;
  }>;
  refundRequests: Array<{
    refundNo: string;
    status: string;
  }>;
  status: 'PENDING_PAYMENT' | 'PAID_PENDING_FULFILLMENT' | 'SUBMITTED_TO_VENDOR' | 'TICKET_ISSUED' | 'TICKET_FAILED' | 'REFUND_REVIEWING' | 'REFUND_PROCESSING' | 'REFUNDED' | 'COMPLETED' | 'CLOSED';
  ticketType: 'E_TICKET' | 'PAPER_TICKET';
  totalAmount: number;
  userId: string;
};

type AdminOrderDetailItemRecord = AdminOrderListItemRecord['items'][number] & {
  id: string;
  totalAmount: number;
  unitPrice: number;
  viewer: {
    id: string;
    mobile: string;
    name: string;
  };
};

type AdminOrderNoteRecord = {
  content: string;
  createdAt: Date;
  createdBy: {
    name: string;
  };
  id: string;
};

type AdminOrderFlagRecord = {
  createdAt: Date;
  createdBy: {
    name: string;
  };
  id: string;
  note: string | null;
  type: string;
};

type AdminOrderDetailRecord = {
  createdAt: Date;
  currency: string;
  flags: AdminOrderFlagRecord[];
  id: string;
  items: AdminOrderDetailItemRecord[];
  notes: AdminOrderNoteRecord[];
  orderNumber: string;
  payments: Array<{
    createdAt: Date;
    paidAt: Date | null;
    providerTxnId: string | null;
    status: string;
  }>;
  refundRequests: Array<{
    id: string;
    lastHandledAt: Date | null;
    processedAt: Date | null;
    processedByUserId: string | null;
    reason: string;
    rejectionReason: string | null;
    refundAmount: number;
    refundNo: string;
    requestedAmount: number;
    requestedAt: Date;
    reviewNote: string | null;
    reviewedByUserId: string | null;
    serviceFee: number;
    status: string;
  }>;
  status: AdminOrderListItemRecord['status'];
  ticketType: AdminOrderListItemRecord['ticketType'];
  totalAmount: number;
  userId: string;
};

type AdminOrderDetailEventSummary = AdminOrderEventSummary & {
  refundEntryEnabled: boolean;
};

type AdminOrderListItem = {
  createdAt: string;
  currency: string;
  event?: AdminOrderEventSummary;
  id: string;
  itemCount: number;
  latestPayment?: {
    paidAt?: string;
    providerTxnId?: string;
    status: string;
  };
  latestRefundRequest?: {
    refundNo: string;
    status: string;
  };
  orderNumber: string;
  sessionName?: string;
  status: AdminOrderListItemRecord['status'];
  ticketType: AdminOrderListItemRecord['ticketType'];
  timeline: {
    description: string;
    title: string;
  };
  totalAmount: number;
  userId: string;
};

type AdminOrderDetail = {
  createdAt: string;
  currency: string;
  event?: AdminOrderEventSummary;
  flags: Array<{
    createdAt: string;
    createdByName: string;
    id: string;
    note?: string;
    type: string;
  }>;
  id: string;
  items: Array<{
    id: string;
    quantity: number;
    sessionId: string;
    sessionName: string;
    tierName: string;
    totalAmount: number;
    unitPrice: number;
    viewer: {
      id: string;
      mobile: string;
      name: string;
    };
  }>;
  payments: Array<{
    createdAt: string;
    paidAt?: string;
    providerTxnId?: string;
    status: string;
  }>;
  refundRequests: Array<{
    id: string;
    lastHandledAt?: string;
    processedAt?: string;
    processedByUserId?: string;
    reason: string;
    rejectionReason?: string;
    refundAmount: number;
    refundNo: string;
    requestedAmount: number;
    requestedAt: string;
    reviewNote?: string;
    reviewedByUserId?: string;
    serviceFee: number;
    status: string;
  }>;
  notes: Array<{
    content: string;
    createdAt: string;
    createdByName: string;
    id: string;
  }>;
  orderNumber: string;
  refundEntryEnabled: boolean;
  status: AdminOrderDetailRecord['status'];
  ticketType: AdminOrderDetailRecord['ticketType'];
  timeline: {
    description: string;
    title: string;
  };
  totalAmount: number;
  userId: string;
};

type AdminOrderNote = {
  content: string;
  createdAt: string;
  createdByName: string;
  id: string;
};

type AdminOrderFlag = {
  createdAt: string;
  createdByName: string;
  id: string;
  note?: string;
  type: string;
};

function normalizeOptionalText(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalDate(value: Date | null | undefined) {
  if (!value) {
    return undefined;
  }

  return value.toISOString();
}

function normalizeEvent(event: AdminOrderEventSummary): AdminOrderEventSummary {
  return {
    city: event.city,
    id: event.id,
    title: event.title,
    venueName: event.venueName,
  };
}

function normalizeListEvent(event: AdminOrderEventSummary | undefined) {
  if (!event) {
    return undefined;
  }

  return normalizeEvent(event);
}

function normalizeListItem(
  order: AdminOrderListItemRecord,
  orderTimelineService: OrderTimelineService,
): AdminOrderListItem {
  const firstItem = order.items[0];
  const latestPayment = order.payments[0];
  const latestRefundRequest = order.refundRequests[0];

  return {
    createdAt: order.createdAt.toISOString(),
    currency: order.currency,
    event: normalizeListEvent(firstItem?.ticketTier.session.event),
    id: order.id,
    itemCount: order.items.reduce((count, item) => count + item.quantity, 0),
    latestPayment: latestPayment
      ? {
          paidAt: normalizeOptionalDate(latestPayment.paidAt),
          providerTxnId: normalizeOptionalText(latestPayment.providerTxnId),
          status: latestPayment.status,
        }
      : undefined,
    latestRefundRequest: latestRefundRequest
      ? {
          refundNo: latestRefundRequest.refundNo,
          status: latestRefundRequest.status,
        }
      : undefined,
    orderNumber: order.orderNumber,
    sessionName: firstItem?.ticketTier.session.name,
    status: order.status,
    ticketType: order.ticketType,
    timeline: orderTimelineService.toTimelineItem(order.status, order.ticketType),
    totalAmount: order.totalAmount,
    userId: order.userId,
  };
}

function normalizeOrderItem(item: AdminOrderDetailItemRecord) {
  return {
    id: item.id,
    quantity: item.quantity,
    sessionId: item.ticketTier.session.id,
    sessionName: item.ticketTier.session.name,
    tierName: item.ticketTier.name,
    totalAmount: item.totalAmount,
    unitPrice: item.unitPrice,
    viewer: {
      id: item.viewer.id,
      mobile: item.viewer.mobile,
      name: item.viewer.name,
    },
  };
}

function normalizeOrderNote(note: AdminOrderNoteRecord): AdminOrderNote {
  return {
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    createdByName: note.createdBy.name,
    id: note.id,
  };
}

function normalizeOrderFlag(flag: AdminOrderFlagRecord): AdminOrderFlag {
  return {
    createdAt: flag.createdAt.toISOString(),
    createdByName: flag.createdBy.name,
    id: flag.id,
    note: normalizeOptionalText(flag.note),
    type: flag.type,
  };
}

function normalizeOrderPayment(
  payment: AdminOrderDetailRecord['payments'][number],
) {
  return {
    createdAt: payment.createdAt.toISOString(),
    paidAt: normalizeOptionalDate(payment.paidAt),
    providerTxnId: normalizeOptionalText(payment.providerTxnId),
    status: payment.status,
  };
}

function normalizeOrderRefundRequest(
  refundRequest: AdminOrderDetailRecord['refundRequests'][number],
) {
  return {
    id: refundRequest.id,
    lastHandledAt: normalizeOptionalDate(refundRequest.lastHandledAt),
    processedAt: normalizeOptionalDate(refundRequest.processedAt),
    processedByUserId: normalizeOptionalText(refundRequest.processedByUserId),
    reason: refundRequest.reason,
    rejectionReason: normalizeOptionalText(refundRequest.rejectionReason),
    refundAmount: refundRequest.refundAmount,
    refundNo: refundRequest.refundNo,
    requestedAmount: refundRequest.requestedAmount,
    requestedAt: refundRequest.requestedAt.toISOString(),
    reviewNote: normalizeOptionalText(refundRequest.reviewNote),
    reviewedByUserId: normalizeOptionalText(refundRequest.reviewedByUserId),
    serviceFee: refundRequest.serviceFee,
    status: refundRequest.status,
  };
}

function normalizeDetail(
  order: AdminOrderDetailRecord,
  orderTimelineService: OrderTimelineService,
): AdminOrderDetail {
  const firstItem = order.items[0];

  if (!firstItem) {
    throw new NotFoundException('订单不存在。');
  }

  const event = firstItem.ticketTier.session.event as AdminOrderDetailEventSummary;
  const refundEntryEnabled =
    event.refundEntryEnabled ??
    (order as { refundEntryEnabled?: boolean }).refundEntryEnabled ??
    false;

  return {
    createdAt: order.createdAt.toISOString(),
    currency: order.currency,
    event: normalizeEvent(event),
    flags: order.flags.map(normalizeOrderFlag),
    id: order.id,
    items: order.items.map(normalizeOrderItem),
    payments: order.payments.map(normalizeOrderPayment),
    refundRequests: order.refundRequests.map(normalizeOrderRefundRequest),
    notes: order.notes.map(normalizeOrderNote),
    orderNumber: order.orderNumber,
    refundEntryEnabled,
    status: order.status,
    ticketType: order.ticketType,
    timeline: orderTimelineService.toTimelineItem(order.status, order.ticketType),
    totalAmount: order.totalAmount,
    userId: order.userId,
  };
}

function trimRequiredText(value: string, message: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new BadRequestException(message);
  }

  return trimmed;
}

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderTimelineService: OrderTimelineService,
  ) {}

  async listOrders(): Promise<AdminOrderListItem[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            ticketTier: {
              include: {
                session: {
                  include: {
                    event: {
                      select: {
                        city: true,
                        id: true,
                        refundEntryEnabled: true,
                        title: true,
                        venueName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            paidAt: true,
            providerTxnId: true,
            status: true,
          },
        },
        refundRequests: {
          orderBy: {
            requestedAt: 'desc',
          },
          select: {
            refundNo: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) =>
      normalizeListItem(order as AdminOrderListItemRecord, this.orderTimelineService),
    );
  }

  async getOrderDetail(orderId: string): Promise<AdminOrderDetail> {
    const order = await this.prisma.order.findUnique({
      include: {
        flags: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
          },
        },
        items: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            ticketTier: {
              include: {
                session: {
                  include: {
                    event: {
                      select: {
                        city: true,
                        id: true,
                        title: true,
                        venueName: true,
                      },
                    },
                  },
                },
              },
            },
            viewer: {
              select: {
                id: true,
                mobile: true,
                name: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            createdAt: true,
            paidAt: true,
            providerTxnId: true,
            status: true,
          },
        },
        refundRequests: {
          orderBy: {
            requestedAt: 'desc',
          },
          select: {
            id: true,
            lastHandledAt: true,
            processedAt: true,
            processedByUserId: true,
            reason: true,
            rejectionReason: true,
            refundAmount: true,
            refundNo: true,
            requestedAmount: true,
            requestedAt: true,
            reviewNote: true,
            reviewedByUserId: true,
            serviceFee: true,
            status: true,
          },
        },
        notes: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        id: orderId,
      },
    });

    if (!order || order.items.length === 0) {
      throw new NotFoundException('订单不存在。');
    }

    return normalizeDetail(order as AdminOrderDetailRecord, this.orderTimelineService);
  }

  async addNote(
    orderId: string,
    input: {
      content: string;
    },
    admin: AdminActor,
  ): Promise<AdminOrderNote> {
    const order = await this.prisma.order.findUnique({
      select: {
        id: true,
      },
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在。');
    }

    const content = trimRequiredText(input.content, '备注内容不能为空。');

    const note = await this.prisma.orderNote.create({
      data: {
        content,
        createdByUserId: admin.id,
        orderId,
      },
      select: {
        content: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        id: true,
      },
    });

    return normalizeOrderNote(note as AdminOrderNoteRecord);
  }

  async addFlag(
    orderId: string,
    input: {
      note?: string;
      type: string;
    },
    admin: AdminActor,
  ): Promise<AdminOrderFlag> {
    const order = await this.prisma.order.findUnique({
      select: {
        id: true,
      },
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在。');
    }

    const type = trimRequiredText(input.type, '异常标记类型不能为空。');
    const note = normalizeOptionalText(input.note);

    const flag = await this.prisma.orderFlag.create({
      data: {
        createdByUserId: admin.id,
        ...(note ? { note } : {}),
        orderId,
        type,
      },
      select: {
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        id: true,
        note: true,
        type: true,
      },
    });

    return normalizeOrderFlag(flag as AdminOrderFlagRecord);
  }
}
