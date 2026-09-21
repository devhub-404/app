import { z } from 'zod';
import { listingSearchSchema } from '@/shared/ui/schemas/search.schema.ts';

export const jobSearchSchema = listingSearchSchema.extend({
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship', 'temporary']).optional().catch(undefined),
  workplaceType: z.enum(['remote', 'hybrid', 'onsite']).optional().catch(undefined),
  location: z.string().trim().max(180).catch(''),
  minComp: z.preprocess((value) => { const parsed = Number(value); return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined; }, z.number().positive().optional()),
  sort: z.enum(['recent', 'comp']).catch('recent'),
});
