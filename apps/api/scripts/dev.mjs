import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const apiRoot = resolve(import.meta.dirname, '..');
const childEnvironment = { ...process.env, APP_ENV: process.env.APP_ENV ?? 'development' };
const children = [];

function start(command, args, { pipeOutput = false } = {}) {
  const child = spawn(command, args, {
    cwd: apiRoot,
    env: childEnvironment,
    stdio: pipeOutput ? ['inherit', 'pipe', 'pipe'] : 'inherit',
  });

  if (pipeOutput) {
    child.stdout.on('data', (chunk) => process.stdout.write(chunk));
    child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  }

  children.push(child);
  return child;
}

function run(command, args) {
  const child = start(command, args);

  return new Promise((resolvePromise, rejectPromise) => {
    child.once('error', rejectPromise);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`${command} exited with ${signal ?? `code ${code ?? 'unknown'}`}`));
    });
  });
}

function stopAll() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
}

function waitForReady(child, pattern, label) {
  return new Promise((resolvePromise, rejectPromise) => {
    let output = '';

    const onData = (chunk) => {
      output += chunk.toString();
      if (pattern.test(output)) {
        child.stdout.off('data', onData);
        resolvePromise();
      }
    };

    child.stdout.on('data', onData);
    child.once('error', rejectPromise);
    child.once('exit', (code, signal) => {
      rejectPromise(new Error(`${label} exited before becoming ready (${signal ?? `code ${code ?? 'unknown'}`})`));
    });
  });
}

process.once('SIGINT', () => {
  stopAll();
  process.exit(130);
});
process.once('SIGTERM', () => {
  stopAll();
  process.exit(143);
});

await run('pnpm', ['exec', 'tsc', '-p', 'tsconfig.build.json']);
await run('pnpm', ['exec', 'tsc-alias', '-p', 'tsconfig.build.json', '--resolve-full-paths']);

const compiler = start('pnpm', ['exec', 'tsc', '-p', 'tsconfig.build.json', '--watch', '--preserveWatchOutput'], {
  pipeOutput: true,
});
const aliasResolver = start('pnpm', [
  'exec',
  'tsc-alias',
  '-p',
  'tsconfig.build.json',
  '--watch',
  '--resolve-full-paths',
], { pipeOutput: true });

compiler.once('exit', (code) => {
  if (code !== 0) {
    stopAll();
    process.exitCode = code ?? 1;
  }
});

aliasResolver.once('exit', (code) => {
  if (code !== 0) {
    stopAll();
    process.exitCode = code ?? 1;
  }
});

await Promise.all([
  waitForReady(compiler, /Found 0 errors?\. Watching for file changes\./, 'TypeScript watcher'),
  waitForReady(aliasResolver, /Watching for file changes/, 'Alias watcher'),
]);

start('pnpm', ['exec', 'tsx', 'watch', '--clear-screen=false', 'dist/main.js']);
