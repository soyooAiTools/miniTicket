import { z } from 'zod';

export const adminRefundStatusSchema = z.enum([
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
]);

export const adminRefundQueueItemSchema = z
  .object({
    id: z.string().min(1),
    orderId: z.string().min(1),
    orderNumber: z.string().min(1),
    status: adminRefundStatusSchema,
    amount: z.number().int().nonnegative(),
    currency: z.string().min(1),
    reason: z.string().min(1),
    requesterName: z.string().min(1),
    createdAt: z.string().datetime(),
  })
  .strict();

export const adminRefundDetailSchema = adminRefundQueueItemSchema.extend({
  processedAt: z.string().datetime().optional(),
  processedBy: z.string().min(1).optional(),
  decisionNote: z.string().min(1).optional(),
});

export const adminRefundApproveRequestSchema = z
  .object({
    refundId: z.string().min(1),
    note: z.string().min(1).optional(),
  })
  .strict();

export const adminRefundRejectRequestSchema = z
  .object({
    refundId: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

export const adminRefundProcessRequestSchema = z
  .object({
    refundId: z.string().min(1),
    note: z.string().min(1).optional(),
  })
  .strict();

export type AdminRefundStatus = z.infer<typeof adminRefundStatusSchema>;
export type AdminRefundQueueItem = z.infer<typeof adminRefundQueueItemSchema>;
export type AdminRefundDetail = z.infer<typeof adminRefundDetailSchema>;
export type AdminRefundApproveRequest = z.infer<
  typeof adminRefundApproveRequestSchema
>;
export type AdminRefundRejectRequest = z.infer<
  typeof adminRefundRejectRequestSchema
>;
export type AdminRefundProcessRequest = z.infer<
  typeof adminRefundProcessRequestSchema
>;
