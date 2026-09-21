import { z } from 'zod';

const csvValues = z.preprocess(
  (value) => {
    if (Array.isArray(value)) return value.flatMap((item) => String(item).split(','));
    if (typeof value === 'string') return value.split(',');
    return [];
  },
  z.array(z.string().trim().min(1)).default([]),
);

const pageNumber = z.preprocess(
  (value) => {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
  },
  z.number().int().positive().default(1),
);

export const searchQuerySchema = z.object({
  q: z.string().trim().max(200).default(''),
  tags: csvValues,
  page: pageNumber,
});

export type SearchQuery = z.output<typeof searchQuerySchema>;

export function parseSearchQuery(params: URLSearchParams): SearchQuery {
  return searchQuerySchema.parse({
    q: params.get('q') ?? params.get('query') ?? '',
    tags: params.getAll('tags'),
    page: params.get('page') ?? 1,
  });
}

export const listingSearchSchema = z.object({
  query: z.string().trim().max(200).default(''),
  tags: csvValues.pipe(z.array(z.string().trim().min(1)).max(20)),
  page: z.number().int().positive().default(1),
});

export type ListingSearch = z.output<typeof listingSearchSchema>;

export function parseListingSearch(params: URLSearchParams, fallbackPage = 1): ListingSearch {
  const page = Number(params.get('page') ?? fallbackPage);
  return listingSearchSchema.parse({
    query: params.get('q') ?? params.get('query') ?? '',
    tags: params.getAll('tags'),
    page: Number.isSafeInteger(page) && page > 0 ? page : fallbackPage,
  });
}
