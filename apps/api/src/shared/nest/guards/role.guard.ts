import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { Public } from '@/shared/nest/decorators/public';
import type { Role } from '@/shared/kernel/auth/role';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.reflector.getAllAndOverride<boolean>(Public, [context.getHandler(), context.getClass()])) {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<Role[]>(Roles, [context.getHandler(), context.getClass()]);
    if (!roles?.length) return true;

    type RequestWithUser = FastifyRequest & { user?: User };
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) throw new UnauthorizedException();

    if (!roles.some((role) => request.user?.role === role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
