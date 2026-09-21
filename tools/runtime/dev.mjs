import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const children = new Set();
let stopping = false;

function start(label, args) {
  const child = spawn(pnpm, args, {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });

  children.add(child);
  child.once('close', (code, signal) => {
    children.delete(child);
    if (stopping) return;

    stopping = true;
    console.error(`${label} stopped (${signal ?? `code ${code ?? 'unknown'}`}).`);
    stopAll();
    process.exitCode = code ?? 1;
  });

  child.once('error', (error) => {
    if (stopping) return;

    stopping = true;
    console.error(`${label} failed to start:`, error);
    stopAll();
    process.exitCode = 1;
  });

  return child;
}

function stopAll() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
}

process.once('SIGINT', () => {
  stopping = true;
  stopAll();
  process.exitCode = 130;
});

process.once('SIGTERM', () => {
  stopping = true;
  stopAll();
  process.exitCode = 143;
});

start('Web', ['--filter', '@devhub-404/web', 'dev']);
start('API', ['--filter', '@devhub-404/api', 'dev']);

await new Promise(() => {});
