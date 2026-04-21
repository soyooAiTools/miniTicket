import { z } from 'zod';

import { saleStatusSchema } from './event';

export const adminRegionalTierDraftSchema = z
  .object({
    name: z.string().min(1),
    price: z.number().int().positive(),
    inventory: z.number().int().nonnegative(),
    ticketType: z.enum(['E_TICKET', 'PAPER_TICKET']),
    purchaseLimit: z.number().int().positive(),
    refundable: z.boolean(),
    refundDeadlineAt: z.string().datetime().optional(),
    requiresRealName: z.boolean(),
    sortOrder: z.number().int().nonnegative(),
  })
  .strict();

export const adminEventSessionDraftSchema = z
  .object({
    name: z.string().min(1),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime().optional(),
    saleStartsAt: z.string().datetime().optional(),
    saleEndsAt: z.string().datetime().optional(),
    tiers: z.array(adminRegionalTierDraftSchema).min(1),
  })
  .strict();

const adminEventDraftBaseSchema = z
  .object({
    title: z.string().min(1),
    city: z.string().min(1),
    venueName: z.string().min(1),
    venueAddress: z.string().min(1),
    description: z.string().min(1).optional(),
    coverImageUrl: z.string().url().optional(),
    id: z.string().min(1).optional(),
    published: z.boolean().optional(),
    sessions: z.array(adminEventSessionDraftSchema).min(1),
  })
  .strict();

export const adminEventDraftSchema = adminEventDraftBaseSchema;

export const adminEventEditorSchema = adminEventDraftBaseSchema.extend({
  id: z.string().min(1),
});

export const adminEventListItemSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    city: z.string().min(1),
    venueName: z.string().min(1),
    coverImageUrl: z.string().url().optional(),
    saleStatus: saleStatusSchema,
    minPrice: z.number().int().nonnegative(),
    published: z.boolean(),
    refundEntryEnabled: z.boolean(),
    sessionsCount: z.number().int().nonnegative(),
    updatedAt: z.string().datetime().optional(),
  })
  .strict();

export type AdminRegionalTierDraft = z.infer<
  typeof adminRegionalTierDraftSchema
>;
export type AdminEventSessionDraft = z.infer<typeof adminEventSessionDraftSchema>;
export type AdminEventDraft = z.infer<typeof adminEventDraftSchema>;
export type AdminEventEditor = z.infer<typeof adminEventEditorSchema>;
export type AdminEventListItem = z.infer<typeof adminEventListItemSchema>;
