import { z } from 'zod';

import {
  orderDetailSchema,
  orderListItemSchema,
} from './order';

export const adminOrderNoteSchema = z
  .object({
    id: z.string().min(1),
    content: z.string().min(1),
    createdAt: z.string().datetime(),
    authorName: z.string().min(1),
  })
  .strict();

export const adminOrderFlagSchema = z
  .object({
    code: z.string().min(1),
    label: z.string().min(1),
    active: z.boolean(),
  })
  .strict();

export const adminOrderListItemSchema = orderListItemSchema
  .extend({
    noteCount: z.number().int().nonnegative().optional(),
    flagCount: z.number().int().nonnegative().optional(),
  })
  .strict();

export const adminOrderDetailSchema = z
  .object({
    ...orderDetailSchema.shape,
    notes: z.array(adminOrderNoteSchema),
    flags: z.array(adminOrderFlagSchema),
  })
  .strict();

export type AdminOrderNote = z.infer<typeof adminOrderNoteSchema>;
export type AdminOrderFlag = z.infer<typeof adminOrderFlagSchema>;
export type AdminOrderListItem = z.infer<typeof adminOrderListItemSchema>;
export type AdminOrderDetail = z.infer<typeof adminOrderDetailSchema>;
