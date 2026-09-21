import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const developmentEnvFile = resolve(root, '.env.development');
const localStateDirectory = resolve(root, '.local');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const children = new Set();
let stopping = false;
let runtimeResolve;

function spawnPnpm(args, env = process.env) {
  const child = spawn(pnpm, args, {
    cwd: root,
    env,
    stdio: 'inherit',
  });

  children.add(child);
  child.once('close', () => children.delete(child));
  return child;
}

function stopAll() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
}

function runCommand(label, args, env = process.env) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawnPnpm(args, env);

    child.once('error', rejectPromise);
    child.once('close', (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`${label} stopped (${signal ?? `code ${code ?? 'unknown'}`}).`));
    });
  });
}

async function waitForApi(apiProcess, url, timeoutMs = 180_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (apiProcess.exitCode !== null) {
      throw new Error('API Worker stopped before becoming ready.');
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
      if (response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.data?.ready === true) return;
      }
    } catch {
      // The Worker or its Container may still be starting.
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
  }

  throw new Error(`API did not become ready within ${timeoutMs}ms: ${url}`);
}

function startRuntime(label, args, env) {
  const child = spawnPnpm(args, env);

  child.once('error', (error) => {
    if (stopping) return;
    console.error(`${label} failed:`, error);
    stopping = true;
    stopAll();
    runtimeResolve?.();
  });

  child.once('close', (code, signal) => {
    if (stopping) return;
    console.error(`${label} stopped (${signal ?? `code ${code ?? 'unknown'}`}).`);
    stopping = true;
    stopAll();
    runtimeResolve?.();
  });

  return child;
}

process.once('SIGINT', () => {
  stopping = true;
  stopAll();
  runtimeResolve?.();
});

process.once('SIGTERM', () => {
  stopping = true;
  stopAll();
  runtimeResolve?.();
});

try {
  await runCommand('Infrastructure', ['infra:dev:up']);
  await runCommand('Migrations', ['db:migrate:dev']);

  const buildEnvironment = {
    ...process.env,
    APP_ENV: 'production',
    API_URL: 'http://127.0.0.1:8080',
    WEB_URL: 'http://localhost:4321',
    HSTS_ENABLED: 'false',
  };

  await runCommand('Web build', ['--filter', '@devhub-404/web', 'build'], buildEnvironment);

  const apiEnvironment = {
    ...process.env,
    APP_ENV: 'development',
  };

  const apiProcess = startRuntime(
    'API Worker',
    [
      '--filter',
      '@devhub-404/api',
      'exec',
      'wrangler',
      'dev',
      '--local',
      '--env-file',
      developmentEnvFile,
      '--var',
      'APP_ENV:development',
      '--var',
      'APP_PORT:8080',
      '--var',
      'HTTP_HOST:0.0.0.0',
      '--var',
      'WEB_URL:http://localhost:4321',
      '--var',
      'OPENAPI_ENABLED:true',
      '--var',
      'SECURE_COOKIES:false',
      '--var',
      'HSTS_ENABLED:false',
      '--port',
      '8080',
      '--persist-to',
      resolve(localStateDirectory, 'wrangler-api-start'),
    ],
    apiEnvironment,
  );

  await waitForApi(apiProcess, 'http://127.0.0.1:8080/api/v1/platform/readiness');

  const webEnvironment = {
    ...process.env,
    APP_ENV: 'production',
  };

  startRuntime(
    'Web Worker',
    [
      '--filter',
      '@devhub-404/web',
      'exec',
      'wrangler',
      'dev',
      '--local',
      '--env-file',
      developmentEnvFile,
      '--var',
      'APP_ENV:production',
      '--var',
      'API_URL:http://127.0.0.1:8080',
      '--var',
      'WEB_URL:http://localhost:4321',
      '--var',
      'HSTS_ENABLED:false',
      '--port',
      '4321',
      '--persist-to',
      resolve(localStateDirectory, 'wrangler-web-start'),
    ],
    webEnvironment,
  );

  await new Promise((resolvePromise) => {
    runtimeResolve = resolvePromise;
  });
} catch (error) {
  stopping = true;
  stopAll();
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
