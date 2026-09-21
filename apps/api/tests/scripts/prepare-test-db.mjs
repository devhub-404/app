import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

process.env.APP_ENV ??= 'test';

const apiRoot = fileURLToPath(new URL('../../', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const composeFile = fileURLToPath(new URL('../../../../docker-compose.test.yml', import.meta.url));
const compose = ['compose', '-f', composeFile];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repositoryRoot,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout ?? ''}${result.stderr ?? ''}`);
  }
  return (result.stdout ?? '').trim();
}

run('docker', [...compose, 'up', '-d', 'db', 'redis-test', 'minio-test']);

run('docker', [...compose, '--profile', 'init', 'run', '--rm', 'minio-test-init']);

let ready = false;
for (let attempt = 0; attempt < 60; attempt += 1) {
  const probe = spawnSync('docker', [...compose, 'exec', '-T', 'db', 'psql', '-U', 'postgres', '-d', 'postgres', '-c', 'SELECT 1'], {
    cwd: repositoryRoot,
    stdio: 'ignore',
  });
  if (probe.status === 0) {
    ready = true;
    break;
  }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
}
if (!ready) throw new Error('PostgreSQL did not become ready for the test suite');

run('docker', [...compose, 'exec', '-T', 'redis-test', 'redis-cli', 'FLUSHDB']);
run('docker', [...compose, 'exec', '-T', 'db', 'dropdb', '-U', 'postgres', '--if-exists', 'devhub_test']);
run('docker', [...compose, 'exec', '-T', 'db', 'createdb', '-U', 'postgres', 'devhub_test']);
run('pnpm', ['exec', 'drizzle-kit', 'migrate', '--config', 'tests/drizzle.test.config.ts'], { cwd: apiRoot });
