import { z } from 'zod';

import { adminRoleSchema } from './admin-auth';

export const adminUserListItemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    role: adminRoleSchema,
    enabled: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export const adminUserCreateRequestSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1),
    role: adminRoleSchema,
    password: z.string().min(8),
  })
  .strict();

export const adminUserUpdateRequestSchema = z
  .object({
    id: z.string().min(1),
    email: z.string().email().optional(),
    name: z.string().min(1).optional(),
    role: adminRoleSchema.optional(),
    password: z.string().min(8).optional(),
    enabled: z.boolean().optional(),
  })
  .strict();

export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;
export type AdminUserCreateRequest = z.infer<typeof adminUserCreateRequestSchema>;
export type AdminUserUpdateRequest = z.infer<typeof adminUserUpdateRequestSchema>;
