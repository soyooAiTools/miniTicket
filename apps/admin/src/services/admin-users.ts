import {
  adminUserListItemSchema,
  adminUserRoleUpdateRequestSchema,
  type AdminUserCreateRequest,
  type AdminUserListItem,
} from '@ticketing/contracts';

import { jsonRequest, request } from './request';

export type { AdminUserCreateRequest, AdminUserListItem } from '@ticketing/contracts';

export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  const payload = await request<unknown[]>('/admin/users');
  return (payload ?? []).map((item) => adminUserListItemSchema.parse(item));
}

export async function createAdminUser(
  input: AdminUserCreateRequest,
): Promise<AdminUserListItem> {
  const payload = await jsonRequest<unknown>('/admin/users', 'POST', input);
  return adminUserListItemSchema.parse(payload);
}

export async function setAdminUserEnabled(
  userId: string,
  enabled: boolean,
): Promise<AdminUserListItem> {
  const payload = await jsonRequest<unknown>(
    `/admin/users/${userId}/enabled`,
    'PATCH',
    { enabled },
  );
  return adminUserListItemSchema.parse(payload);
}

export async function updateAdminUserRole(
  userId: string,
  role: AdminUserListItem['role'],
): Promise<AdminUserListItem> {
  const payload = await jsonRequest<unknown>(
    `/admin/users/${userId}`,
    'PATCH',
    adminUserRoleUpdateRequestSchema.parse({ role }),
  );
  return adminUserListItemSchema.parse(payload);
}
