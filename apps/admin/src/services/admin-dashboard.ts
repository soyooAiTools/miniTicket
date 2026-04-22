import {
  adminDashboardSummarySchema,
  type AdminDashboardSummary,
} from '@ticketing/contracts';
export type {
  AdminDashboardRecentAction,
  AdminDashboardSummary,
} from '@ticketing/contracts';

import { request } from './request';

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const payload = await request<unknown>('/admin/dashboard/summary');
  return adminDashboardSummarySchema.parse(payload);
}
