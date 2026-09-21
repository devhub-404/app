import { z } from 'zod';
import { listingSearchSchema } from '@/shared/ui/schemas/search.schema.ts';

export const eventSearchSchema = listingSearchSchema.extend({
  temporalState: z.enum(['upcoming', 'ongoing', 'ended']).optional().catch(undefined),
  format: z.enum(['online', 'in_person', 'hybrid']).optional().catch(undefined),
  sort: z.enum(['upcoming', 'recent']).catch('upcoming'),
});
