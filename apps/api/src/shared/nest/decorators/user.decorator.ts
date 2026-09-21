import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthenticatedPrincipal } from '@/shared/nest/auth';

type UserDecoratorData = keyof AuthenticatedPrincipal | 'id' | undefined;
type RequestWithUser = FastifyRequest & { user?: AuthenticatedPrincipal };

export const User = createParamDecorator((data: UserDecoratorData, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  const user = request.user;
  if (!user) return null;
  if (!data) return user;
  if (data === 'id') return user.sub ?? null;

  return user[data];
});
