import { z } from 'zod';
import { listingSearchSchema } from '@/shared/ui/schemas/search.schema.ts';

export const questionSearchSchema = listingSearchSchema.extend({
  status: z.enum(['open', 'closed', 'solved']).optional().catch(undefined),
  sort: z.enum(['recent', 'answers']).catch('recent'),
});
