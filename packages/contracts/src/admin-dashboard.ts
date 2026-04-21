import { z } from 'zod';

export const adminDashboardRecentActionSchema = z
  .object({
    id: z.string().min(1),
    action: z.string().min(1),
    targetType: z.string().min(1),
    targetId: z.string().min(1),
    actorName: z.string().min(1),
    createdAt: z.string().datetime(),
    description: z.string().min(1).optional(),
  })
  .strict();

export const adminDashboardSummarySchema = z
  .object({
    eventCount: z.number().int().nonnegative(),
    orderCount: z.number().int().nonnegative(),
    refundCount: z.number().int().nonnegative(),
    userCount: z.number().int().nonnegative(),
    recentActions: z.array(adminDashboardRecentActionSchema),
  })
  .strict();

export type AdminDashboardRecentAction = z.infer<
  typeof adminDashboardRecentActionSchema
>;
export type AdminDashboardSummary = z.infer<typeof adminDashboardSummarySchema>;
