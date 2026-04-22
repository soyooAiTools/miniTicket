import {
  adminOrderDetailSchema,
  adminOrderFlagSchema,
  adminOrderListItemSchema,
  adminOrderNoteSchema,
  type AdminOrderDetail,
  type AdminOrderFlag,
  type AdminOrderListItem,
  type AdminOrderNote,
} from '@ticketing/contracts';

import { jsonRequest, request } from './request';

export type {
  AdminOrderDetail,
  AdminOrderFlag,
  AdminOrderListItem,
  AdminOrderNote,
} from '@ticketing/contracts';

export async function getAdminOrders(): Promise<AdminOrderListItem[]> {
  const payload = await request<{ items?: unknown[] }>('/admin/orders');
  return (payload.items ?? []).map((item) => adminOrderListItemSchema.parse(item));
}

export async function getAdminOrderDetail(
  orderId: string,
): Promise<AdminOrderDetail> {
  const payload = await request<unknown>(`/admin/orders/${orderId}`);
  return adminOrderDetailSchema.parse(payload);
}

export async function addAdminOrderNote(
  orderId: string,
  input: {
    content: string;
  },
): Promise<AdminOrderNote> {
  const payload = await jsonRequest<unknown>(
    `/admin/orders/${orderId}/notes`,
    'POST',
    input,
  );
  return adminOrderNoteSchema.parse(payload);
}

export async function addAdminOrderFlag(
  orderId: string,
  input: {
    note?: string;
    type: string;
  },
): Promise<AdminOrderFlag> {
  const payload = await jsonRequest<unknown>(
    `/admin/orders/${orderId}/flags`,
    'POST',
    input,
  );
  return adminOrderFlagSchema.parse(payload);
}
