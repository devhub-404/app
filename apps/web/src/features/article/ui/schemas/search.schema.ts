import { z } from 'zod';
import { listingSearchSchema } from '@/shared/ui/schemas/search.schema.ts';

export const articleSearchSchema = listingSearchSchema.extend({
  sort: z.enum(['recent', 'votes', 'views', 'comments']).catch('recent'),
  period: z.enum(['all', 'day', 'week', 'month', 'year']).catch('all'),
});
