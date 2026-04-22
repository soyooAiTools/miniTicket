import { z } from 'zod';

import { orderStatusSchema } from './order';

export const adminRefundEventSchema = z
  .object({
    city: z.string().min(1),
    id: z.string().min(1),
    title: z.string().min(1),
    venueName: z.string().min(1),
  })
  .strict();

export const adminRefundStatusSchema = z.enum([
  'REVIEWING',
  'APPROVED',
  'REJECTED',
  'PROCESSING',
  'COMPLETED',
]);

export const adminRefundQueueItemSchema = z
  .object({
    amount: z.number().int().nonnegative(),
    currency: z.string().min(1),
    id: z.string().min(1),
    orderId: z.string().min(1),
    orderNumber: z.string().min(1),
    orderStatus: orderStatusSchema,
    processedAt: z.string().datetime().optional(),
    reason: z.string().min(1),
    refundNo: z.string().min(1),
    requestedAmount: z.number().int().nonnegative(),
    requestedAt: z.string().datetime(),
    requesterName: z.string().min(1),
    serviceFee: z.number().int().nonnegative(),
    status: adminRefundStatusSchema,
    userId: z.string().min(1),
    event: adminRefundEventSchema.optional(),
    sessionName: z.string().min(1).optional(),
  })
  .strict();

export const adminRefundDetailSchema = adminRefundQueueItemSchema.extend({
  lastHandledAt: z.string().datetime().optional(),
  reviewedByUserId: z.string().min(1).optional(),
  reviewNote: z.string().min(1).optional(),
  rejectionReason: z.string().min(1).optional(),
  processedByUserId: z.string().min(1).optional(),
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
  })
  .strict();

export type AdminRefundStatus = z.infer<typeof adminRefundStatusSchema>;
export type AdminRefundEvent = z.infer<typeof adminRefundEventSchema>;
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
