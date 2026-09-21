import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.__filename = resolve(dirname(fileURLToPath(import.meta.url)), 'main.js');
globalThis.__dirname = dirname(globalThis.__filename);
