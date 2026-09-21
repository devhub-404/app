import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(file);
      continue;
    }
    if (!file.endsWith('.js')) continue;

    const source = await readFile(file, 'utf8');
    const prepared = source.replace(/from (['"][^'"]+\.json['"])/g, 'from $1 with { type: \'json\' }');
    if (prepared !== source) await writeFile(file, prepared, 'utf8');
  }
}

await visit(dist);
await copyFile(new URL('./runtime-globals.mjs', import.meta.url), join(dist, 'runtime-globals.mjs'));
