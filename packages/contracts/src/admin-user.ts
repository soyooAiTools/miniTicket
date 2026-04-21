import { z } from 'zod';

import { adminRoleSchema } from './admin-auth';

export const adminUserListItemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    mobile: z.string().regex(/^1\d{10}$/),
    role: adminRoleSchema,
    active: z.boolean(),
    createdAt: z.string().datetime(),
    lastLoginAt: z.string().datetime().optional(),
  })
  .strict();

export const adminUserCreateRequestSchema = z
  .object({
    name: z.string().min(1),
    mobile: z.string().regex(/^1\d{10}$/),
    role: adminRoleSchema,
    password: z.string().min(1),
    active: z.boolean().optional(),
  })
  .strict();

export const adminUserUpdateRequestSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).optional(),
    mobile: z.string().regex(/^1\d{10}$/).optional(),
    role: adminRoleSchema.optional(),
    password: z.string().min(1).optional(),
    active: z.boolean().optional(),
  })
  .strict();

export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;
export type AdminUserCreateRequest = z.infer<typeof adminUserCreateRequestSchema>;
export type AdminUserUpdateRequest = z.infer<typeof adminUserUpdateRequestSchema>;
