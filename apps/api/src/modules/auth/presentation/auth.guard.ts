import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { AuthenticatedPrincipal } from '@/shared/nest/auth';
import { Public } from '@/shared/nest/decorators/public';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { SessionAccessValidationPort } from '@/modules/auth/public/session-access-validation.port';
import { getSessionSecretFromRequest } from '@/modules/auth/presentation/utils/auth-cookies.util';

type RequestWithUser = FastifyRequest & { user?: AuthenticatedPrincipal };

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const ALLOWED_FETCH_SITES = new Set(['same-origin', 'same-site']);

function headerValue(request: FastifyRequest, name: string): string | null {
  const value = request.headers[name];

  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Cookie-authenticated mutations are browser authority-bearing requests. SameSite=Lax
 * is the transport-level CSRF protection; exact Origin plus Fetch Metadata prevents
 * a same-site sibling origin (or a cross-site request) from exercising that cookie.
 */
export function assertCookieMutationRequest(request: FastifyRequest, siteUrl: string): void {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return;

  const expectedOrigin = new URL(siteUrl).origin;
  const origin = headerValue(request, 'origin');
  const fetchSite = headerValue(request, 'sec-fetch-site');

  if (origin !== expectedOrigin || fetchSite === null || !ALLOWED_FETCH_SITES.has(fetchSite)) {
    throw new ForbiddenException();
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionAccessValidation: SessionAccessValidationPort,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(Public, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const sessionSecret = getSessionSecretFromRequest(request);

    if (!sessionSecret) {
      if (isPublic) return true;

      throw new UnauthorizedException();
    }

    const principal = await this.sessionAccessValidation.resolve(sessionSecret);
    if (!principal) {
      delete request.user;
      if (isPublic) return true;

      throw new UnauthorizedException();
    }

    request.user = principal;
    assertCookieMutationRequest(request, this.config.siteUrl);

    return true;
  }
}
