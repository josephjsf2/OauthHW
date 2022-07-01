import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Retrive cookie value from request
 */
export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);
