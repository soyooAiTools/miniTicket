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
      label: '热卖中',
      tone: 'accent',
    };
  }

  if (status === 'UPCOMING') {
    return {
      label: '待开售',
      tone: 'info',
    };
  }

  return {
    label: '已售罄',
    tone: 'neutral',
  };
}

export function getOrderStatusMeta(status: OrderStatus): StatusMeta {
  switch (status) {
    case 'PENDING_PAYMENT':
      return { label: '待支付', tone: 'warning' };
    case 'PAID_PENDING_FULFILLMENT':
      return { label: '待出票', tone: 'info' };
    case 'SUBMITTED_TO_VENDOR':
      return { label: '出票中', tone: 'info' };
    case 'TICKET_ISSUED':
      return { label: '已出票', tone: 'success' };
    case 'TICKET_FAILED':
      return { label: '出票失败', tone: 'danger' };
    case 'REFUND_REVIEWING':
      return { label: '退款审核中', tone: 'warning' };
    case 'REFUND_PROCESSING':
      return { label: '退款处理中', tone: 'info' };
    case 'REFUNDED':
      return { label: '已退款', tone: 'neutral' };
    case 'COMPLETED':
      return { label: '已完成', tone: 'success' };
    case 'CLOSED':
      return { label: '已关闭', tone: 'neutral' };
    default:
      return { label: status, tone: 'neutral' };
  }
}

export function getTicketTypeLabel(ticketType: TicketType) {
  return ticketType === 'PAPER_TICKET' ? '纸质票' : '电子票';
}
