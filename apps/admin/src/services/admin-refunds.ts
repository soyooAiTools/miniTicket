import {
  adminRefundApproveRequestSchema,
  adminRefundDetailSchema,
  adminRefundQueueItemSchema,
  adminRefundRejectRequestSchema,
  type AdminRefundApproveRequest,
  type AdminRefundDetail,
  type AdminRefundQueueItem,
  type AdminRefundRejectRequest,
} from '@ticketing/contracts';

import { jsonRequest, request } from './request';

export type {
  AdminRefundApproveRequest,
  AdminRefundDetail,
  AdminRefundQueueItem,
  AdminRefundRejectRequest,
} from '@ticketing/contracts';

export async function getAdminRefunds(): Promise<AdminRefundQueueItem[]> {
  const payload = await request<{ items?: unknown[] }>('/admin/refunds');
  return (payload.items ?? []).map((item) =>
    adminRefundQueueItemSchema.parse(item),
  );
}

export async function getAdminRefundDetail(
  refundId: string,
): Promise<AdminRefundDetail> {
  const payload = await request<unknown>(`/admin/refunds/${refundId}`);
  return adminRefundDetailSchema.parse(payload);
}

export async function approveAdminRefund(
  refundId: string,
  input: Omit<AdminRefundApproveRequest, 'refundId'>,
): Promise<AdminRefundDetail> {
  const payload = await jsonRequest<unknown>(
    `/admin/refunds/${refundId}/approve`,
    'POST',
    input,
  );
  return adminRefundDetailSchema.parse(payload);
}

export async function rejectAdminRefund(
  refundId: string,
  input: Omit<AdminRefundRejectRequest, 'refundId'>,
): Promise<AdminRefundDetail> {
  const payload = await jsonRequest<unknown>(
    `/admin/refunds/${refundId}/reject`,
    'POST',
    input,
  );
  return adminRefundDetailSchema.parse(payload);
}

export async function processAdminRefund(
  refundId: string,
): Promise<AdminRefundDetail> {
  const payload = await jsonRequest<unknown>(
    `/admin/refunds/${refundId}/process`,
    'POST',
    {},
  );
  return adminRefundDetailSchema.parse(payload);
}
