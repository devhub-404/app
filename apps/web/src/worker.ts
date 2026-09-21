import { handle } from '@astrojs/cloudflare/handler';

type Env = Cloudflare.Env;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (env.APP_ENV === 'production') {
        return env.API.fetch(request);
      }

      const target = new URL(`${url.pathname}${url.search}`, env.API_URL);
      return fetch(new Request(target, request));
    }

    if (url.pathname === '/assistant') {
      return env.ASSISTANT.fetch(request);
    }

    return handle(request, env, ctx);
  }
} satisfies ExportedHandler<Env>;
