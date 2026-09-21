import { z } from 'zod';
import { searchQuerySchema } from '@/shared/ui/schemas/search.schema.ts';

const types = ['article', 'news', 'resource', 'question', 'project', 'job', 'event'] as const;
const modes = ['search', 'trending', 'popular', 'recent'] as const;

const csvEnum = <const T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => {
      const requested = Array.isArray(value) ? value.flatMap((item) => String(item).split(',')) : typeof value === 'string' ? value.split(',') : [];
      return requested.filter((item): item is T[number] => values.includes(item as T[number]));
    },
    z.array(z.enum(values)).default([...values]),
  );

export const homeSearchSchema = searchQuerySchema.extend({
  types: csvEnum(types),
  mode: z.preprocess((value) => (modes.includes(value as (typeof modes)[number]) ? value : undefined), z.enum(modes).default('search')),
});

export const searchEndpointSchema = z.object({
  q: z.string().trim().min(2),
  limit: z.preprocess((value) => {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 20) : 10;
  }, z.number().int().min(1).max(20)),
});

export type HomeSearch = z.output<typeof homeSearchSchema>;

export function parseHomeSearch(params: URLSearchParams): HomeSearch {
  return homeSearchSchema.parse({
    q: params.get('q') ?? params.get('query') ?? '',
    tags: params.getAll('tags'),
    types: params.get('types') ?? types,
    mode: params.get('mode') ?? 'search',
  });
}
