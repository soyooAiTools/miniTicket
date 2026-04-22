import { z } from 'zod';

import {
  orderDetailSchema,
  orderListItemSchema,
} from './order';

export const adminOrderPaymentSchema = z
  .object({
    createdAt: z.string().datetime(),
    paidAt: z.string().datetime().optional(),
    providerTxnId: z.string().min(1).optional(),
    status: z.string().min(1),
  })
  .strict();

export const adminOrderLatestPaymentSchema = z
  .object({
    paidAt: z.string().datetime().optional(),
    providerTxnId: z.string().min(1).optional(),
    status: z.string().min(1),
  })
  .strict();

export const adminOrderLatestRefundRequestSchema = z
  .object({
    refundNo: z.string().min(1),
    status: z.string().min(1),
  })
  .strict();

export const adminOrderRefundHistorySchema = z
  .object({
    id: z.string().min(1),
    lastHandledAt: z.string().datetime().optional(),
    processedAt: z.string().datetime().optional(),
    processedByUserId: z.string().min(1).optional(),
    reason: z.string().min(1),
    rejectionReason: z.string().min(1).optional(),
    refundAmount: z.number().int().nonnegative(),
    refundNo: z.string().min(1),
    requestedAmount: z.number().int().nonnegative(),
    requestedAt: z.string().datetime(),
    reviewNote: z.string().min(1).optional(),
    reviewedByUserId: z.string().min(1).optional(),
    serviceFee: z.number().int().nonnegative(),
    status: z.string().min(1),
  })
  .strict();

export const adminOrderNoteSchema = z
  .object({
    id: z.string().min(1),
    content: z.string().min(1),
    createdAt: z.string().datetime(),
    createdByName: z.string().min(1),
  })
  .strict();

export const adminOrderFlagSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    note: z.string().min(1).optional(),
    createdAt: z.string().datetime(),
    createdByName: z.string().min(1),
  })
  .strict();

export const adminOrderListItemSchema = orderListItemSchema
  .extend({
    itemCount: z.number().int().positive(),
    latestPayment: adminOrderLatestPaymentSchema.optional(),
    latestRefundRequest: adminOrderLatestRefundRequestSchema.optional(),
    sessionName: z.string().min(1).optional(),
    userId: z.string().min(1),
  })
  .strict();

export const adminOrderDetailSchema = z
  .object({
    ...orderDetailSchema.shape,
    payments: z.array(adminOrderPaymentSchema),
    refundRequests: z.array(adminOrderRefundHistorySchema),
    userId: z.string().min(1),
    notes: z.array(adminOrderNoteSchema),
    flags: z.array(adminOrderFlagSchema),
  })
  .strict();

export type AdminOrderPayment = z.infer<typeof adminOrderPaymentSchema>;
export type AdminOrderLatestPayment = z.infer<typeof adminOrderLatestPaymentSchema>;
export type AdminOrderLatestRefundRequest = z.infer<
  typeof adminOrderLatestRefundRequestSchema
>;
export type AdminOrderRefundHistory = z.infer<
  typeof adminOrderRefundHistorySchema
>;
export type AdminOrderNote = z.infer<typeof adminOrderNoteSchema>;
export type AdminOrderFlag = z.infer<typeof adminOrderFlagSchema>;
export type AdminOrderListItem = z.infer<typeof adminOrderListItemSchema>;
export type AdminOrderDetail = z.infer<typeof adminOrderDetailSchema>;
