import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentAdminPrincipal = {
  email: string;
  id: string;
  name: string;
  role: 'ADMIN' | 'OPERATIONS';
};

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      admin?: CurrentAdminPrincipal;
    }>();

    return request.admin;
  },
);
