import 'reflect-metadata';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptFilename = fileURLToPath(import.meta.url);
globalThis.__filename = resolve(dirname(scriptFilename), '../dist/main.js');
globalThis.__dirname = dirname(globalThis.__filename);

const localEnvironment = {
  APP_ENV: 'development',
  APP_PORT: '8080',
  HTTP_HOST: '127.0.0.1',
  LOG_LEVEL: 'silent',
  OPENAPI_ENABLED: 'false',
  EMAIL_PROVIDER: 'local',
  SECURE_COOKIES: 'false',
  HSTS_ENABLED: 'false',
  WEB_URL: 'http://localhost:4321',
  JWT_SECRET: 'openapi-generation-only-jwt-secret',
  DB_PRIMARY_URL: 'postgres://openapi:openapi@localhost:5432/devhub_dev',
  DB_READONLY_URL: 'postgres://openapi:openapi@localhost:5432/devhub_dev',
  RATE_LIMIT_REDIS_URL: 'redis://localhost:6380',
  EMAIL_FROM_ADDRESS: 'openapi@example.test',
  OAUTH_GITHUB_CLIENT_ID: 'openapi-github-client',
  OAUTH_GITHUB_CLIENT_SECRET: 'openapi-github-secret',
  OAUTH_GITHUB_REDIRECT_URI: 'http://localhost:4321/auth/oauth/github/callback',
  OAUTH_GITHUB_LINK_REDIRECT_URI: 'http://localhost:4321/auth/oauth/github/link/callback',
  OAUTH_GOOGLE_CLIENT_ID: 'openapi-google-client',
  OAUTH_GOOGLE_CLIENT_SECRET: 'openapi-google-secret',
  OAUTH_GOOGLE_REDIRECT_URI: 'http://localhost:4321/auth/oauth/google/callback',
  OAUTH_GOOGLE_LINK_REDIRECT_URI: 'http://localhost:4321/auth/oauth/google/link/callback',
  OPAQUE_SERVER_SETUP: 'openapi-generation-only-opaque-setup',
  AUTH_TOTP_SECRET_ENCRYPTION_KEY_BASE64: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  PASSKEY_RP_ID: 'localhost',
  PASSKEY_RP_NAME: 'DevHub 404 Local',
  PASSKEY_ORIGIN: 'http://localhost:4321',
  PLATFORM_ACCOUNT_ID: 'openapi-local-account',
  OBJECT_STORE_BUCKET: 'openapi-local-bucket',
  OBJECT_STORE_ACCESS_KEY_ID: 'openapi-local-access-key',
  OBJECT_STORE_SECRET_ACCESS_KEY: 'openapi-local-secret-key',
  OBJECT_STORE_ENDPOINT_URL: 'http://localhost:9000',
  OBJECT_STORE_PUBLIC_BASE_URL: 'http://localhost:9000/openapi-local-bucket',
  MEDIA_UPLOAD_GRANT_TTL_SECONDS: '600',
  MEDIA_ALLOWED_CONTENT_TYPES: 'image/webp',
  MEDIA_AVATAR_MAX_BYTES: '1048576',
  MEDIA_CONTENT_MAX_BYTES: '2097152'
};

for (const [key, value] of Object.entries(localEnvironment)) {
  process.env[key] ??= value;
}

const [{ createApp }, { buildOpenApiDocument }] = await Promise.all([
  import('../dist/app/create-app.js'),
  import('../dist/app/openapi.js')
]);

const app = await createApp();
try {
  const document = buildOpenApiDocument(app);
  const outputPath = resolve(process.cwd(), '../../packages/api-contract/openapi.json');
  const generated = `${JSON.stringify(document, null, 2)}\n`;

  if (process.argv.includes('--check')) {
    let current;
    try {
      current = await readFile(outputPath, 'utf8');
    } catch {
      console.error(`OpenAPI contract is missing: ${outputPath}`);
      process.exitCode = 1;
    }

    if (current !== undefined && current !== generated) {
      console.error(`OpenAPI contract is out of date: ${outputPath}`);
      process.exitCode = 1;
    }
  } else {
    await writeFile(outputPath, generated, 'utf8');
  }
} finally {
  await app.close();
}
