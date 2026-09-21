import assert from 'node:assert/strict';
import { test, vi } from 'vitest';

vi.mock('astro:middleware', () => ({
  defineMiddleware: (handler: unknown) => handler,
}));

const { responseMiddleware } = await import('../../../src/app/request/response.middleware.ts');

test('response middleware rewrites unexpected render failures to the server error page', async () => {
  const response = new Response('server error', { status: 500 });
  let rewrittenPath: string | undefined;
  const context = {
    request: new Request('https://devhub-404.test/articles/example'),
    locals: { sessionDurationMs: undefined, sessionLookup: undefined },
    rewrite: async (path: string) => {
      rewrittenPath = path;
      return response;
    },
  } as never;

  const result = (await responseMiddleware(context, async () => {
    throw new Error('render failed');
  })) as Response;

  assert.equal(rewrittenPath, '/500');
  assert.equal(result.status, 500);
  assert.equal(result.headers.get('X-Content-Type-Options'), 'nosniff');
});
