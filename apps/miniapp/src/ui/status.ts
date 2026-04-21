import type {
  OrderStatus,
  SaleStatus,
  TicketType,
} from '../../../../../packages/contracts/src';

export type StatusMeta = {
  label: string;
  tone: 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger';
};

export function getSaleStatusMeta(status: SaleStatus): StatusMeta {
  if (status === 'ON_SALE') {
    return {
      label: 'On sale',
      tone: 'accent',
    };
  }

  if (status === 'UPCOMING') {
    return {
      label: 'Coming soon',
      tone: 'info',
    };
  }

  return {
    label: 'Sold out',
    tone: 'neutral',
  };
}

export function getOrderStatusMeta(status: OrderStatus): StatusMeta {
  switch (status) {
    case 'PENDING_PAYMENT':
      return { label: 'Pending payment', tone: 'warning' };
    case 'PAID_PENDING_FULFILLMENT':
      return { label: 'Pending fulfillment', tone: 'info' };
    case 'SUBMITTED_TO_VENDOR':
      return { label: 'Vendor processing', tone: 'info' };
    case 'TICKET_ISSUED':
      return { label: 'Issued', tone: 'success' };
    case 'TICKET_FAILED':
      return { label: 'Issue failed', tone: 'danger' };
    case 'REFUND_REVIEWING':
      return { label: 'Refund reviewing', tone: 'warning' };
    case 'REFUND_PROCESSING':
      return { label: 'Refund processing', tone: 'info' };
    case 'REFUNDED':
      return { label: 'Refunded', tone: 'neutral' };
    case 'COMPLETED':
      return { label: 'Completed', tone: 'success' };
    case 'CLOSED':
      return { label: 'Closed', tone: 'neutral' };
    default:
      return { label: status, tone: 'neutral' };
  }
}

export function getTicketTypeLabel(ticketType: TicketType) {
  return ticketType === 'PAPER_TICKET' ? 'Paper ticket' : 'E-ticket';
}
