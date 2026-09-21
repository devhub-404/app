import { z } from 'zod';
import { listingSearchSchema } from '@/shared/ui/schemas/search.schema.ts';

export const projectSearchSchema = listingSearchSchema.extend({
  sort: z.enum(['recent', 'title']).catch('recent'),
});
