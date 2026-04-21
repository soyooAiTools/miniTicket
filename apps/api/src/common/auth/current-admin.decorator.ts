import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentAdminPrincipal = {
  createdAt: Date;
  email: string;
  enabled: boolean;
  id: string;
  name: string;
  role: 'ADMIN' | 'OPERATIONS';
  updatedAt: Date;
};

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      admin?: CurrentAdminPrincipal;
    }>();

    return request.admin;
  },
);
