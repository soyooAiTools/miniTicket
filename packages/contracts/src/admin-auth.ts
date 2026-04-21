import { z } from 'zod';

export const adminRoleSchema = z.enum([
  'SUPER_ADMIN',
  'EVENT_ADMIN',
  'ORDER_ADMIN',
  'REFUND_ADMIN',
]);

export const adminSessionUserSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    role: adminRoleSchema,
  })
  .strict();

export const adminLoginRequestSchema = z
  .object({
    username: z.string().min(1),
    password: z.string().min(1),
  })
  .strict();

export const adminSessionSchema = z
  .object({
    token: z.string().min(1),
    user: adminSessionUserSchema,
    expiresAt: z.string().datetime(),
  })
  .strict();

export type AdminRole = z.infer<typeof adminRoleSchema>;
export type AdminSessionUser = z.infer<typeof adminSessionUserSchema>;
export type AdminLoginRequest = z.infer<typeof adminLoginRequestSchema>;
export type AdminSession = z.infer<typeof adminSessionSchema>;
