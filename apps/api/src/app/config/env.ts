import { loadAppEnvironment } from './env-file';

// Centralized environment loading + validation.
// Keep it dependency-free (no zod/envalid) to avoid expanding the dependency surface.
const runtimeAppEnv = loadAppEnvironment();

export function getEnv(key: string): string {
  const value = process.env[key];
  if (value && value.length > 0) return value;

  throw new Error(`Missing environment variable: ${key}`);
}

export function getOptionalEnv(key: string): string | undefined {
  const value = process.env[key];

  return value && value.length > 0 ? value : undefined;
}

function getBooleanEnv(key: string): boolean {
  const value = getEnv(key).toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new Error(`Environment variable ${key} must be true or false`);
}

function getEnumEnv<const T extends readonly string[]>(key: string, values: T): T[number] {
  const value = getEnv(key);
  if (values.includes(value)) return value;

  throw new Error(`Environment variable ${key} must be one of: ${values.join(', ')}`);
}

function getOptionalEnvRequiredInProduction(key: string): string | undefined {
  const value = getOptionalEnv(key);
  if (value) return value;
  if (runtimeAppEnv !== 'production') return undefined;

  throw new Error(`Missing environment variable: ${key}`);
}

function getOptionalPositiveIntegerEnv(key: string, fallback: number): number {
  const raw = getOptionalEnv(key);
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Environment variable ${key} must be a positive integer`);

  return value;
}

function assertTestInfrastructure(databaseUrl: string, readDatabaseUrl: string, redisUrl: string): void {
  if (runtimeAppEnv !== 'test') return;

  for (const [name, value] of [
    ['DB_PRIMARY_URL', databaseUrl],
    ['DB_READONLY_URL', readDatabaseUrl],
  ] as const) {
    if (!/\/devhub_404_test(?:\?|$)/.test(value)) {
      throw new Error(`Refusing to run tests against a non-test database in ${name}: ${value}`);
    }
  }

  let parsedRedisUrl: URL;
  try {
    parsedRedisUrl = new URL(redisUrl);
  } catch {
    throw new Error(`RATE_LIMIT_REDIS_URL must be a valid URL in test: ${redisUrl}`);
  }

  const isDedicatedLocalRedis =
    parsedRedisUrl.protocol === 'redis:' &&
    (parsedRedisUrl.hostname === 'localhost' || parsedRedisUrl.hostname === '127.0.0.1') &&
    parsedRedisUrl.port === '6380';

  if (!isDedicatedLocalRedis) {
    throw new Error('Refusing to run tests without the dedicated local Redis at redis://localhost:6380');
  }
}

export function getPositiveIntegerEnv(key: string): number {
  const value = Number(getEnv(key));
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${key} must be a positive integer`);
  }

  return value;
}

const databaseUrl = getEnv('DB_PRIMARY_URL');
const readDatabaseUrl = getEnv('DB_READONLY_URL');
const rateLimitRedisUrl = getEnv('RATE_LIMIT_REDIS_URL');

assertTestInfrastructure(databaseUrl, readDatabaseUrl, rateLimitRedisUrl);

export const env = {
  // Aplicação
  appEnv: runtimeAppEnv,
  port: getPositiveIntegerEnv('APP_PORT'),
  host: getOptionalEnvRequiredInProduction('HTTP_HOST'),
  logLevel: getEnumEnv('LOG_LEVEL', ['silent', 'error', 'warn', 'info', 'debug'] as const),
  bootstrapTimingEnabled: getOptionalEnv('BOOTSTRAP_TIMING_ENABLED') === 'true',
  openApiEnabled: getBooleanEnv('OPENAPI_ENABLED'),
  emailProvider: getEnumEnv('EMAIL_PROVIDER', ['local', 'cloudflare'] as const),
  secureCookies: getBooleanEnv('SECURE_COOKIES'),
  hstsEnabled: getBooleanEnv('HSTS_ENABLED'),

  // Rede
  siteUrl: getEnv('WEB_URL'),

  // Segurança
  jwtSecret: getEnv('JWT_SECRET'),
  scheduledJobsSecret: getOptionalEnv('SCHEDULED_JOBS_SECRET'),

  // Persistência — Postgres
  databaseUrl,
  readDatabaseUrl,

  // Rate limiting distribuído — única conexão Redis da aplicação
  rateLimitRedisUrl,
  // Cache de autenticação — opcional fora de production; o adapter atual usa
  // a API REST do Upstash e não é reproduzido pelo Redis local do Compose.
  authCacheRedisUrl: getOptionalEnvRequiredInProduction('CACHE_REDIS_URL'),
  authCacheRedisToken: getOptionalEnvRequiredInProduction('CACHE_REDIS_TOKEN'),
  authCacheTtlSeconds: getOptionalPositiveIntegerEnv('AUTH_CACHE_TTL_SECONDS', 10),

  // Comunicação — Email Service
  email: {
    fromAddress: getEnv('EMAIL_FROM_ADDRESS'),
    contactRecipientAddress: getOptionalEnv('CONTACT_RECIPIENT_ADDRESS') ?? getEnv('EMAIL_FROM_ADDRESS'),
  },

  // Desenvolvimento local — adapters herméticos.
  local: {
    emailOutboxDir: getOptionalEnv('LOCAL_EMAIL_OUTBOX_DIR') ?? '.local/mailbox',
  },

  // Comunicação — Discord (best-effort publication delivery)
  discord: {
    webhookUrl: getOptionalEnv('DISCORD_WEBHOOK_URL'),
  },

  // Comunicação — OAuth
  oauth: {
    github: {
      clientId: getEnv('OAUTH_GITHUB_CLIENT_ID'),
      clientSecret: getEnv('OAUTH_GITHUB_CLIENT_SECRET'),
      redirectUri: getEnv('OAUTH_GITHUB_REDIRECT_URI'),
      linkRedirectUri: getEnv('OAUTH_GITHUB_LINK_REDIRECT_URI'),
    },
    google: {
      clientId: getEnv('OAUTH_GOOGLE_CLIENT_ID'),
      clientSecret: getEnv('OAUTH_GOOGLE_CLIENT_SECRET'),
      redirectUri: getEnv('OAUTH_GOOGLE_REDIRECT_URI'),
      linkRedirectUri: getEnv('OAUTH_GOOGLE_LINK_REDIRECT_URI'),
    },
  },

  // Autenticação
  auth: {
    // OPAQUE server setup string (persisted; do not rotate without migrating credentials).
    opaqueServerSetup: getEnv('OPAQUE_SERVER_SETUP'),

    // 32-byte key, base64-encoded (AES-256-GCM). Used to encrypt TOTP secrets at rest.
    totpSecretEncryptionKeyBase64: getEnv('AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64'),

    // Passkeys / WebAuthn
    passkeyRpId: getEnv('PASSKEY_RP_ID'),
    passkeyRpName: getEnv('PASSKEY_RP_NAME'),
    passkeyOrigin: getEnv('PASSKEY_ORIGIN'),
  },

  // Plataforma — Object Storage (R2)
  cf: {
    accountId: getEnv('PLATFORM_ACCOUNT_ID'),
    apiToken: getOptionalEnv('CLOUDFLARE_API_TOKEN'),
    // Plataforma — Object Storage (R2)
    r2: {
      bucket: getEnv('OBJECT_STORE_BUCKET'),
      accessKeyId: getEnv('OBJECT_STORE_ACCESS_KEY_ID'),
      secretAccessKey: getEnv('OBJECT_STORE_SECRET_ACCESS_KEY'),
      api: getEnv('OBJECT_STORE_ENDPOINT_URL'),
      publicBaseUrl: getEnv('OBJECT_STORE_PUBLIC_BASE_URL'),
    },
  },

  media: {
    grantTtlSeconds: getPositiveIntegerEnv('MEDIA_UPLOAD_GRANT_TTL_SECONDS'),
    allowedContentTypes: getEnv('MEDIA_ALLOWED_CONTENT_TYPES')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
    maxBytes: {
      avatar: getPositiveIntegerEnv('MEDIA_AVATAR_MAX_BYTES'),
      content: getPositiveIntegerEnv('MEDIA_CONTENT_MAX_BYTES'),
    },
  },
} as const;
