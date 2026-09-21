import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, type ThrottlerRequest } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';

type RequestWithPrincipal = FastifyRequest & {
  user?: { sub?: string; accountId?: string };
};

function clientIp(request: FastifyRequest): string {
  return request.ip || 'unknown';
}

function routeTemplate(context: ExecutionContext, request: FastifyRequest): string {
  const routeOptions = (
    request as FastifyRequest & {
      routeOptions?: { url?: string };
    }
  ).routeOptions;

  return routeOptions?.url || request.url.split('?')[0] || `${context.getClass().name}.${context.getHandler().name}`;
}

/** Runs only the aggregate IP-based throttler. */
@Injectable()
export class GlobalRateLimitGuard extends ThrottlerGuard {
  protected override async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    if (requestProps.throttler.name !== 'global') return true;

    return super.handleRequest(requestProps);
  }

  protected override getTracker(request: RequestWithPrincipal): Promise<string> {
    return Promise.resolve(`ip:${clientIp(request)}`);
  }

  protected override generateKey(_context: ExecutionContext, tracker: string, name: string): string {
    return `rl:v2:${name}:${tracker}`;
  }
}

/** Runs only the endpoint-specific throttler, after authentication when present. */
@Injectable()
export class LocalRateLimitGuard extends ThrottlerGuard {
  protected override async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    if (requestProps.throttler.name !== 'local') return true;

    return super.handleRequest(requestProps);
  }

  protected override getTracker(request: RequestWithPrincipal): Promise<string> {
    const accountId = request.user?.accountId || request.user?.sub;

    return Promise.resolve(accountId ? `account:${accountId}` : `ip:${clientIp(request)}`);
  }

  protected override generateKey(context: ExecutionContext, tracker: string, name: string): string {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    return `rl:v2:${name}:${request.method}:${routeTemplate(context, request)}:${tracker}`;
  }
}
