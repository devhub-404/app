import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

process.env.APP_ENV ??= 'test';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      '@test': resolve(import.meta.dirname, 'tests'),
    },
  },
  test: {
    include: ['tests/unit/**/*.spec.ts'],
    environment: 'node',
    globals: true,
    clearMocks: true,
    fileParallelism: true,
    testTimeout: 1000,
    hookTimeout: 1000,
  },
});
