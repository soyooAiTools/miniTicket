import { z } from 'zod';

export const adminRoleSchema = z.enum([
  'ADMIN',
  'OPERATIONS',
]);

export const adminSessionUserSchema = z
  .object({
    email: z.string().email(),
    id: z.string().min(1),
    name: z.string().min(1),
    role: adminRoleSchema,
  })
  .strict();

export const adminLoginRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export const adminSessionSchema = z
  .object({
    user: adminSessionUserSchema,
  })
  .strict();

export type AdminRole = z.infer<typeof adminRoleSchema>;
export type AdminSessionUser = z.infer<typeof adminSessionUserSchema>;
export type AdminLoginRequest = z.infer<typeof adminLoginRequestSchema>;
export type AdminSession = z.infer<typeof adminSessionSchema>;
