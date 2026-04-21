import { z } from 'zod';

export const adminRefundStatusSchema = z.enum([
  'REVIEWING',
  'APPROVED',
  'REJECTED',
  'PROCESSING',
  'COMPLETED',
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
  approvedAt: z.string().datetime().optional(),
  approvedBy: z.string().min(1).optional(),
  approvalNote: z.string().min(1).optional(),
  rejectedAt: z.string().datetime().optional(),
  rejectedBy: z.string().min(1).optional(),
  rejectionReason: z.string().min(1).optional(),
  processedAt: z.string().datetime().optional(),
  processedBy: z.string().min(1).optional(),
  handlingNote: z.string().min(1).optional(),
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
