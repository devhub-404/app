import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import environmentFiles from './app-environments.json';

export const appEnvironments = ['production', 'development', 'test'] as const;
export type AppEnvironment = (typeof appEnvironments)[number];

function findRepoRoot(): string {
  let current = resolve(process.cwd());

  while (current !== dirname(current)) {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) return current;
    current = dirname(current);
  }

  // The production container contains only the deployed server artifact. Its
  // working directory is the effective root for runtime-injected variables.
  return resolve(process.cwd());
}

const repoRoot = findRepoRoot();
const envFiles = environmentFiles as Record<AppEnvironment, string>;
const loadModule = createRequire(import.meta.url);

export function getAppEnvironment(): AppEnvironment {
  const value = process.env['APP_ENV'];
  if (appEnvironments.includes(value as AppEnvironment)) return value as AppEnvironment;

  throw new Error(`APP_ENV must be one of: ${appEnvironments.join(', ')}`);
}

export function resolveEnvFilePath(appEnv: AppEnvironment = getAppEnvironment()): string {
  return resolve(repoRoot, envFiles[appEnv]);
}

export function loadAppEnvironment(): AppEnvironment {
  const appEnv = getAppEnvironment();
  const path = resolveEnvFilePath(appEnv);

  if (appEnv !== 'production') {
    const { config: loadDotenv } = loadModule('dotenv') as typeof import('dotenv');
    // The selected environment file provides local defaults; explicit process
    // variables are reserved for isolated runners such as Playwright.
    const result = loadDotenv({ path, override: false, quiet: true });

    // Containers receive their configuration through runtime environment
    // variables. They do not contain the repository's .env files, so a
    // missing file is valid when the bootstrap configuration is injected.
    if (result.error && !process.env['DB_PRIMARY_URL']) {
      throw new Error(`Environment file is required for ${appEnv}: ${path}`);
    }
  }

  if (process.env['APP_ENV'] !== appEnv) {
    throw new Error(`APP_ENV in ${path} does not match the requested environment ${appEnv}`);
  }

  return appEnv;
}

export function assertEnvironmentFileExists(appEnv: AppEnvironment = getAppEnvironment()): void {
  const path = resolveEnvFilePath(appEnv);
  if (!existsSync(path)) throw new Error(`Environment file does not exist: ${path}`);
}
