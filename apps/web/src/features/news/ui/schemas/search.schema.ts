import { z } from 'zod';
import { listingSearchSchema } from '@/shared/ui/schemas/search.schema.ts';

export const newsSearchSchema = listingSearchSchema.extend({
  sort: z.enum(['recent', 'oldest']).catch('recent'),
  period: z.enum(['all', 'day', 'week', 'month', 'year']).catch('all'),
});
