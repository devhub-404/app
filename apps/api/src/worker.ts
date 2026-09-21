import { Container, getContainer } from '@cloudflare/containers';

type SecretBinding =
  | 'DB_PRIMARY_URL'
  | 'DB_READONLY_URL'
  | 'JWT_SECRET'
  | 'SCHEDULED_JOBS_SECRET'
  | 'CACHE_REDIS_URL'
  | 'CACHE_REDIS_TOKEN'
  | 'RATE_LIMIT_REDIS_URL'
  | 'EMAIL_FROM_ADDRESS'
  | 'CONTACT_RECIPIENT_ADDRESS'
  | 'DISCORD_WEBHOOK_URL'
  | 'OAUTH_GITHUB_CLIENT_ID'
  | 'OAUTH_GITHUB_CLIENT_SECRET'
  | 'OAUTH_GITHUB_REDIRECT_URI'
  | 'OAUTH_GITHUB_LINK_REDIRECT_URI'
  | 'OAUTH_GOOGLE_CLIENT_ID'
  | 'OAUTH_GOOGLE_CLIENT_SECRET'
  | 'OAUTH_GOOGLE_REDIRECT_URI'
  | 'OAUTH_GOOGLE_LINK_REDIRECT_URI'
  | 'OPAQUE_SERVER_SETUP'
  | 'AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64'
  | 'PLATFORM_ACCOUNT_ID'
  | 'CLOUDFLARE_API_TOKEN'
  | 'OBJECT_STORE_BUCKET'
  | 'OBJECT_STORE_ACCESS_KEY_ID'
  | 'OBJECT_STORE_SECRET_ACCESS_KEY'
  | 'OBJECT_STORE_ENDPOINT_URL'
  | 'OBJECT_STORE_PUBLIC_BASE_URL';

type Env = Cloudflare.Env & Record<SecretBinding, string>;

function containerUrl(value: string, appEnv: string): string {
  if (!['development', 'test'].includes(appEnv)) return value;

  try {
    const url = new URL(value);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.hostname = 'host.docker.internal';
    }

    return url.toString();
  } catch {
    return value;
  }
}

export class DevHubApiContainer extends Container<Env> {
  override defaultPort = 8080;
  override requiredPorts = [8080];
  override sleepAfter = '10m';
  override pingEndpoint = 'localhost/api/v1/platform/readiness';
  override enableInternet = true;

  constructor(ctx: DurableObjectState<Record<string, never>>, env: Env) {
    super(ctx, env);
    this.envVars = {
      APP_ENV: env.APP_ENV,
      APP_PORT: env.APP_PORT,
      HTTP_HOST: env.HTTP_HOST,
      LOG_LEVEL: env.LOG_LEVEL,
      OPENAPI_ENABLED: env.OPENAPI_ENABLED,
      EMAIL_PROVIDER: env.EMAIL_PROVIDER,
      SECURE_COOKIES: env.SECURE_COOKIES,
      HSTS_ENABLED: env.HSTS_ENABLED,
      WEB_URL: env.WEB_URL,
      JWT_SECRET: env.JWT_SECRET,
      SCHEDULED_JOBS_SECRET: env.SCHEDULED_JOBS_SECRET,
      DB_PRIMARY_URL: containerUrl(env.DB_PRIMARY_URL, env.APP_ENV),
      DB_READONLY_URL: containerUrl(env.DB_READONLY_URL, env.APP_ENV),
      AUTH_CACHE_TTL_SECONDS: env.AUTH_CACHE_TTL_SECONDS,
      RATE_LIMIT_REDIS_URL: containerUrl(env.RATE_LIMIT_REDIS_URL, env.APP_ENV),
      EMAIL_FROM_ADDRESS: env.EMAIL_FROM_ADDRESS,
      CONTACT_RECIPIENT_ADDRESS: env.CONTACT_RECIPIENT_ADDRESS,
      DISCORD_WEBHOOK_URL: env.DISCORD_WEBHOOK_URL,
      OAUTH_GITHUB_CLIENT_ID: env.OAUTH_GITHUB_CLIENT_ID,
      OAUTH_GITHUB_CLIENT_SECRET: env.OAUTH_GITHUB_CLIENT_SECRET,
      OAUTH_GITHUB_REDIRECT_URI: env.OAUTH_GITHUB_REDIRECT_URI,
      OAUTH_GITHUB_LINK_REDIRECT_URI: env.OAUTH_GITHUB_LINK_REDIRECT_URI,
      OAUTH_GOOGLE_CLIENT_ID: env.OAUTH_GOOGLE_CLIENT_ID,
      OAUTH_GOOGLE_CLIENT_SECRET: env.OAUTH_GOOGLE_CLIENT_SECRET,
      OAUTH_GOOGLE_REDIRECT_URI: env.OAUTH_GOOGLE_REDIRECT_URI,
      OAUTH_GOOGLE_LINK_REDIRECT_URI: env.OAUTH_GOOGLE_LINK_REDIRECT_URI,
      OPAQUE_SERVER_SETUP: env.OPAQUE_SERVER_SETUP,
      AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64: env.AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64,
      PASSKEY_RP_ID: env.PASSKEY_RP_ID,
      PASSKEY_RP_NAME: env.PASSKEY_RP_NAME,
      PASSKEY_ORIGIN: env.PASSKEY_ORIGIN,
      PLATFORM_ACCOUNT_ID: env.PLATFORM_ACCOUNT_ID,
      CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN,
      OBJECT_STORE_BUCKET: env.OBJECT_STORE_BUCKET,
      OBJECT_STORE_ACCESS_KEY_ID: env.OBJECT_STORE_ACCESS_KEY_ID,
      OBJECT_STORE_SECRET_ACCESS_KEY: env.OBJECT_STORE_SECRET_ACCESS_KEY,
      OBJECT_STORE_ENDPOINT_URL: containerUrl(env.OBJECT_STORE_ENDPOINT_URL, env.APP_ENV),
      OBJECT_STORE_PUBLIC_BASE_URL: env.OBJECT_STORE_PUBLIC_BASE_URL,
      MEDIA_UPLOAD_GRANT_TTL_SECONDS: env.MEDIA_UPLOAD_GRANT_TTL_SECONDS,
      MEDIA_ALLOWED_CONTENT_TYPES: env.MEDIA_ALLOWED_CONTENT_TYPES,
      MEDIA_AVATAR_MAX_BYTES: env.MEDIA_AVATAR_MAX_BYTES,
      MEDIA_CONTENT_MAX_BYTES: env.MEDIA_CONTENT_MAX_BYTES
    };

    if (env.CACHE_REDIS_URL && env.CACHE_REDIS_TOKEN) {
      this.envVars['CACHE_REDIS_URL'] = containerUrl(env.CACHE_REDIS_URL, env.APP_ENV);
      this.envVars['CACHE_REDIS_TOKEN'] = env.CACHE_REDIS_TOKEN;
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return getContainer(env.API_CONTAINER, 'api-primary').fetch(request);
  }
} satisfies ExportedHandler<Env>;
