import { defineConfig } from 'drizzle-kit';
import { loadAppEnvironment } from '../src/app/config/env-file';

loadAppEnvironment();

const url = process.env.DB_PRIMARY_URL;
if (!url) throw new Error('DB_PRIMARY_URL is required for the test database');
if (!/\/devhub_404_test(?:\?|$)/.test(url)) {
  throw new Error(`Refusing to run test migrations against a non-test database: ${url}`);
}

export default defineConfig({
  schema: './src/shared/infrastructure/database/drizzle/schema/**/*.schema.ts',
  out: './src/shared/infrastructure/database/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
});
