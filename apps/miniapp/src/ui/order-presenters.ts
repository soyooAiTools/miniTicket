import type {
  OrderListItem,
  OrderStatus,
} from '../../../../../packages/contracts/src';

type RefundEntrySummary = {
  ctaLabel: string;
  description: string;
  eligible: boolean;
  title: string;
};

type PaymentResultMeta = {
  description: string;
  title: string;
  tone: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
};

type OrderTimelineMeta = {
  description: string;
  title: string;
};

type RefundEntryInput = {
  refundEntryEnabled: boolean;
  status: OrderStatus;
};

type TicketType = OrderListItem['ticketType'];

const REFUND_REQUESTABLE_STATUSES = new Set<OrderStatus>([
  'PAID_PENDING_FULFILLMENT',
  'SUBMITTED_TO_VENDOR',
  'TICKET_ISSUED',
  'TICKET_FAILED',
]);

const PENDING_ACTION_STATUSES = new Set<OrderStatus>([
  'PENDING_PAYMENT',
  'TICKET_FAILED',
  'REFUND_REVIEWING',
]);

export function buildOrderDashboard(orders: OrderListItem[]) {
  const latestOrder = [...orders].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )[0];

  return {
    latestOrderLabel: latestOrder?.event.title ?? '最近订单',
    openAfterSalesCount: orders.filter(
      (order) => order.refundEntryEnabled && REFUND_REQUESTABLE_STATUSES.has(order.status),
    ).length,
    pendingActionCount: orders.filter((order) => PENDING_ACTION_STATUSES.has(order.status))
      .length,
    totalOrders: orders.length,
  };
}

export function getRefundEntrySummary(
  input: RefundEntryInput,
): RefundEntrySummary {
  if (!input.refundEntryEnabled) {
    return {
      ctaLabel: '查看订单',
      description: '以当前订单状态和活动规则为准',
      eligible: false,
      title: '暂不可售后',
    };
  }

  if (input.status === 'REFUND_REVIEWING') {
    return {
      ctaLabel: '查看进度',
      description: '审核结果会同步到订单',
      eligible: false,
      title: '退款审核中',
    };
  }

  if (input.status === 'REFUND_PROCESSING') {
    return {
      ctaLabel: '查看进度',
      description: '退款将按原路退回',
      eligible: false,
      title: '退款处理中',
    };
  }

  if (input.status === 'REFUNDED') {
    return {
      ctaLabel: '查看详情',
      description: '退款金额已确认',
      eligible: false,
      title: '已退款',
    };
  }

  if (REFUND_REQUESTABLE_STATUSES.has(input.status)) {
    return {
      ctaLabel: '申请退款',
      description: '提交前请确认扣费规则',
      eligible: true,
      title: '可申请退款',
    };
  }

  return {
    ctaLabel: '查看订单',
    description: '请等待订单进入可售后状态',
    eligible: false,
    title: '暂不可售后',
  };
}

export function getPaymentResultMeta(status: OrderStatus): PaymentResultMeta {
  switch (status) {
    case 'PENDING_PAYMENT':
      return {
        description: '支付状态正在同步',
        title: '支付结果确认中',
        tone: 'warning',
      };
    case 'PAID_PENDING_FULFILLMENT':
    case 'SUBMITTED_TO_VENDOR':
      return {
        description: '票务处理中',
        title: '支付成功',
        tone: 'info',
      };
    case 'TICKET_ISSUED':
    case 'COMPLETED':
      return {
        description: '订单已进入可使用状态',
        title: '购票成功',
        tone: 'success',
      };
    case 'TICKET_FAILED':
      return {
        description: '订单已进入人工处理',
        title: '出票异常',
        tone: 'danger',
      };
    case 'REFUND_REVIEWING':
    case 'REFUND_PROCESSING':
    case 'REFUNDED':
      return {
        description: '订单已进入售后流程',
        title: '订单处理中',
        tone: 'neutral',
      };
    case 'CLOSED':
      return {
        description: '请查看订单记录',
        title: '订单已关闭',
        tone: 'neutral',
      };
    default:
      return {
        description: '请查看订单详情',
        title: '订单状态已更新',
        tone: 'neutral',
      };
  }
}

export function getOrderTimelineMeta(
  status: OrderStatus,
  ticketType: TicketType,
): OrderTimelineMeta {
  switch (status) {
    case 'PENDING_PAYMENT':
      return {
        title: '等待支付',
        description: '请在有效时间内完成支付',
      };
    case 'PAID_PENDING_FULFILLMENT':
      return {
        title: '已支付',
        description: '订单正在进入票务处理',
      };
    case 'SUBMITTED_TO_VENDOR':
      return {
        title: '出票中',
        description: '平台已提交票务系统',
      };
    case 'TICKET_ISSUED':
      return {
        title: '出票完成',
        description: ticketType === 'PAPER_TICKET' ? '纸质票信息已确认' : '电子票已可查看',
      };
    case 'TICKET_FAILED':
      return {
        title: '出票异常',
        description: '请联系平台处理',
      };
    case 'REFUND_REVIEWING':
      return {
        title: '退款审核中',
        description: '等待审核结果',
      };
    case 'REFUND_PROCESSING':
      return {
        title: '退款处理中',
        description: '退款将按原路退回',
      };
    case 'REFUNDED':
      return {
        title: '已退款',
        description: '退款已完成',
      };
    case 'COMPLETED':
      return {
        title: '订单完成',
        description: '订单已完成',
      };
    case 'CLOSED':
      return {
        title: '订单关闭',
        description: '当前订单已关闭',
      };
    default:
      return {
        title: '处理中',
        description: '请稍后查看最新状态',
      };
  }
}

export { REFUND_REQUESTABLE_STATUSES };
