import { describe, expect, it } from 'vitest';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth/public/http';

type RequestStub = {
  method: string;
  headers: Record<string, string | undefined>;
  cookies?: { devhub_session?: string };
  user?: Record<string, unknown>;
};

const config = { siteUrl: 'https://devhub404.org' } as never;
const validSessionSecret = 'A'.repeat(43);

function request(overrides: Partial<RequestStub> = {}): RequestStub {
  return { method: 'GET', headers: {}, ...overrides };
}

function contextFor(requestValue: RequestStub, isPublic = false) {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => requestValue }),
    reflector: { getAllAndOverride: () => isPublic },
  };
}

function guardWith(resolve: (secret: string) => Promise<unknown>, isPublic = false) {
  return new AuthGuard({ getAllAndOverride: () => isPublic } as never, { resolve } as never, config);
}

describe('AuthGuard session-cookie authority', () => {
  it('resolves the opaque session cookie into the current principal', async () => {
    const currentRequest = request({ cookies: { devhub_session: validSessionSecret } });
    let received: string | undefined;
    const guard = guardWith(async (secret: string) => {
      received = secret;

      return { sub: 'user-1', sid: 'session-1', type: 'session', role: 'admin' };
    });

    await expect(guard.canActivate(contextFor(currentRequest) as never)).resolves.toBe(true);
    expect(received).toBe(validSessionSecret);
    expect(currentRequest.user).toMatchObject({ type: 'session', role: 'admin' });
  });

  it('rejects a missing or invalid session on a protected route', async () => {
    const guard = guardWith(async () => null);

    await expect(guard.canActivate(contextFor(request()) as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a malformed Session cookie before hitting persistence', async () => {
    let resolveCalls = 0;
    const currentRequest = request({ cookies: { devhub_session: 'not-a-session-secret' } });
    const guard = guardWith(async () => {
      resolveCalls += 1;

      return null;
    });

    await expect(guard.canActivate(contextFor(currentRequest) as never)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(resolveCalls).toBe(0);
  });

  it('allows an anonymous request on a public route', async () => {
    const guard = guardWith(async () => null, true);

    await expect(guard.canActivate(contextFor(request(), true) as never)).resolves.toBe(true);
  });

  it('propagates Session resolution failures instead of downgrading them to an invalid Session', async () => {
    const persistenceFailure = new Error('session store unavailable');
    const currentRequest = request({ cookies: { devhub_session: validSessionSecret } });
    const guard = guardWith(async () => {
      throw persistenceFailure;
    }, true);

    await expect(guard.canActivate(contextFor(currentRequest, true) as never)).rejects.toBe(persistenceFailure);
    expect(currentRequest.user).toBeUndefined();
  });

  it('allows a cookie-authenticated mutation only for the configured Origin with same-site fetch metadata', async () => {
    const currentRequest = request({
      method: 'POST',
      headers: { origin: 'https://devhub404.org', 'sec-fetch-site': 'same-site' },
      cookies: { devhub_session: validSessionSecret },
    });
    const guard = guardWith(async () => ({ sub: 'user-1', sid: 'session-1', type: 'session', role: null }));

    await expect(guard.canActivate(contextFor(currentRequest) as never)).resolves.toBe(true);
  });

  it.each([
    [{ origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' }, 'cross-site'],
    [{ origin: 'https://devhub404.org' }, 'missing Fetch Metadata'],
    [{ 'sec-fetch-site': 'same-origin' }, 'missing Origin'],
  ])('rejects cookie-authenticated mutations with %s (%s)', async (headers) => {
    const currentRequest = request({
      method: 'PATCH',
      headers,
      cookies: { devhub_session: validSessionSecret },
    });
    const guard = guardWith(async () => ({ sub: 'user-1', sid: 'session-1', type: 'session', role: null }));

    await expect(guard.canActivate(contextFor(currentRequest) as never)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not apply cookie-mutation CSRF checks to invalid optional sessions on public routes', async () => {
    const currentRequest = request({ method: 'POST', headers: {}, cookies: { devhub_session: validSessionSecret } });
    const guard = guardWith(async () => null, true);

    await expect(guard.canActivate(contextFor(currentRequest, true) as never)).resolves.toBe(true);
    expect(currentRequest.user).toBeUndefined();
  });
});
