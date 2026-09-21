import { defineConfig } from 'drizzle-kit';
import { loadAppEnvironment } from './src/app/config/env-file';

process.env.APP_ENV ??= 'development';
const appEnv = loadAppEnvironment();
const url = process.env.DB_PRIMARY_URL;

if (!url) throw new Error('DB_PRIMARY_URL is required for Drizzle migrations');

const expectedDatabase = {
  development: 'devhub_dev',
  test: 'devhub_test',
} as const;

const expected = expectedDatabase[appEnv as keyof typeof expectedDatabase];
if (expected && !new URL(url).pathname.endsWith(`/${expected}`)) {
  throw new Error(`Refusing to run ${appEnv} migrations against an unexpected database: ${url}`);
}

export default defineConfig({
  schema: './src/shared/infrastructure/database/drizzle/schema/**/*.schema.ts',
  out: './src/shared/infrastructure/database/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
});
