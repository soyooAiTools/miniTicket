import { z } from 'zod';

export const adminDashboardRecentActionSchema = z
  .object({
    action: z.string().min(1),
    actorName: z.string().min(1),
    createdAt: z.string().datetime(),
    targetId: z.string().min(1),
    targetType: z.string().min(1),
  })
  .strict();

export const adminDashboardSummarySchema = z
  .object({
    activeEventCount: z.number().int().nonnegative(),
    upcomingEventCount: z.number().int().nonnegative(),
    pendingRefundCount: z.number().int().nonnegative(),
    flaggedOrderCount: z.number().int().nonnegative(),
    recentActions: z.array(adminDashboardRecentActionSchema),
  })
  .strict();

export type AdminDashboardRecentAction = z.infer<
  typeof adminDashboardRecentActionSchema
>;
export type AdminDashboardSummary = z.infer<typeof adminDashboardSummarySchema>;
