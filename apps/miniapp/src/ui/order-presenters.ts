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

type RefundEntryInput = {
  refundEntryEnabled: boolean;
  status: OrderStatus;
};

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
    latestOrderLabel: latestOrder?.event.title ?? 'No recent order',
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
      ctaLabel: 'View policy',
      description:
        'Refund entry follows the event rule set and will only open when this order becomes eligible.',
      eligible: false,
      title: 'Refund entry is not available yet',
    };
  }

  if (input.status === 'REFUND_REVIEWING') {
    return {
      ctaLabel: 'View refund progress',
      description:
        'Your request is already in review. Keep an eye on the order timeline for the final decision.',
      eligible: false,
      title: 'Refund review is in progress',
    };
  }

  if (input.status === 'REFUND_PROCESSING') {
    return {
      ctaLabel: 'View refund progress',
      description:
        'The refund request has been submitted upstream and is now being processed.',
      eligible: false,
      title: 'Refund is processing',
    };
  }

  if (input.status === 'REFUNDED') {
    return {
      ctaLabel: 'View refund details',
      description:
        'This order has already completed the refund flow. The final amount will stay on the order record.',
      eligible: false,
      title: 'Refund completed',
    };
  }

  if (REFUND_REQUESTABLE_STATUSES.has(input.status)) {
    return {
      ctaLabel: 'Request refund',
      description:
        'Refund entry is now open. Review the fee deduction rule before you submit the request.',
      eligible: true,
      title: 'Refund entry is open',
    };
  }

  return {
    ctaLabel: 'View order timeline',
    description:
      'The order still needs to reach a post-payment state before after-sales actions can open.',
    eligible: false,
    title: 'Wait for order progress',
  };
}

export function getPaymentResultMeta(status: OrderStatus): PaymentResultMeta {
  switch (status) {
    case 'PENDING_PAYMENT':
      return {
        description:
          'The platform is still confirming the order state after payment initiation. We will keep syncing the latest result.',
        title: 'Confirming payment result',
        tone: 'warning',
      };
    case 'PAID_PENDING_FULFILLMENT':
    case 'SUBMITTED_TO_VENDOR':
      return {
        description:
          'Payment has been accepted and the order is moving through the fulfillment pipeline.',
        title: 'Payment confirmed',
        tone: 'info',
      };
    case 'TICKET_ISSUED':
    case 'COMPLETED':
      return {
        description:
          'Payment is complete and the order is already in a successful delivery state.',
        title: 'Payment confirmed',
        tone: 'success',
      };
    case 'TICKET_FAILED':
      return {
        description:
          'Payment succeeded, but ticket fulfillment needs manual follow-up. Please review the order timeline.',
        title: 'Manual follow-up needed',
        tone: 'danger',
      };
    case 'REFUND_REVIEWING':
    case 'REFUND_PROCESSING':
    case 'REFUNDED':
      return {
        description:
          'Payment completed earlier, and this order is now in an after-sales flow.',
        title: 'Order moved to after-sales',
        tone: 'neutral',
      };
    case 'CLOSED':
      return {
        description:
          'This order has been closed. Review the full order record for the latest platform action.',
        title: 'Order closed',
        tone: 'neutral',
      };
    default:
      return {
        description: 'Review the latest timeline update on the order detail page.',
        title: 'Order updated',
        tone: 'neutral',
      };
  }
}

export { REFUND_REQUESTABLE_STATUSES };
