import {
  adminEventDraftSchema,
  adminEventEditorSchema,
  adminEventListItemSchema,
  eventDetailSchema,
  type AdminEventDraft,
  type AdminEventEditor,
  type AdminEventListItem,
  type EventDetail,
} from '@ticketing/contracts';

import { jsonRequest, request } from './request';

export type {
  AdminEventDraft,
  AdminEventEditor,
  AdminEventListItem,
  EventDetail,
} from '@ticketing/contracts';

export async function getAdminEvents(): Promise<AdminEventListItem[]> {
  const payload = await request<{ items?: unknown[] }>('/admin/events');
  return (payload.items ?? []).map((item) => adminEventListItemSchema.parse(item));
}

export async function getAdminEventDetail(eventId: string): Promise<EventDetail> {
  const payload = await request<unknown>(`/catalog/events/${eventId}`);
  return eventDetailSchema.parse(payload);
}

export async function createAdminEvent(
  input: AdminEventDraft,
): Promise<AdminEventEditor> {
  const payload = await jsonRequest<unknown>('/admin/events', 'POST', input);
  return adminEventEditorSchema.parse(payload);
}

export async function updateAdminEvent(
  eventId: string,
  input: AdminEventEditor,
): Promise<AdminEventEditor> {
  const payload = await jsonRequest<unknown>(
    `/admin/events/${eventId}`,
    'PATCH',
    input,
  );
  return adminEventEditorSchema.parse(payload);
}

export async function publishAdminEvent(
  eventId: string,
): Promise<AdminEventEditor> {
  const payload = await jsonRequest<unknown>(
    `/admin/events/${eventId}/publish`,
    'PATCH',
    {},
  );
  return adminEventEditorSchema.parse(payload);
}

export async function unpublishAdminEvent(
  eventId: string,
): Promise<AdminEventEditor> {
  const payload = await jsonRequest<unknown>(
    `/admin/events/${eventId}/unpublish`,
    'PATCH',
    {},
  );
  return adminEventEditorSchema.parse(payload);
}

export { adminEventDraftSchema, adminEventEditorSchema };
