import { randomInt } from 'node:crypto';
import { slugify } from '@utilify/core';

const DISCRIMINATOR_LENGTH = 4;
const DISCRIMINATOR_SPACE = 36 ** DISCRIMINATOR_LENGTH;

function randomDiscriminator(): string {
  return randomInt(DISCRIMINATOR_SPACE).toString(36).padStart(DISCRIMINATOR_LENGTH, '0');
}

/** Generates a bounded title-derived locator; persistence remains the uniqueness authority. */
export async function resolveUniqueSlug(
  title: string,
  exists: (slug: string) => Promise<boolean>,
  maxLength = 80,
  fallback = 'untitled',
): Promise<string> {
  const normalized = slugify(title.trim()) || fallback;
  const prefixLength = Math.max(1, maxLength - DISCRIMINATOR_LENGTH - 1);
  const prefix = normalized.slice(0, prefixLength).replace(/-+$/g, '') || fallback.slice(0, prefixLength);

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidate = `${prefix}-${randomDiscriminator()}`;
    if (!(await exists(candidate))) return candidate;
  }

  throw new Error('UNIQUE_SLUG_EXHAUSTED');
}
