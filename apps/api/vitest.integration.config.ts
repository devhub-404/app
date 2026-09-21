import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      '@test': resolve(import.meta.dirname, 'tests'),
    },
  },
  test: {
    include: ['tests/integration/auth.integration.spec.ts'],
    environment: 'node',
    globals: true,
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    setupFiles: [resolve(import.meta.dirname, 'tests/setup/integration-environment.ts')],
  },
});
