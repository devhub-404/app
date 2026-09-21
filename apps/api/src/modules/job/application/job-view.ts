import type { JobDTO, PaginatedJobsDTO } from './dtos';
import type { TaxonomyPublicServicePort } from '@/modules/taxonomy/public';
export const MAX_ACTIVE_JOBS = 3;
export async function enrichJob(t: TaxonomyPublicServicePort, j: Omit<JobDTO, 'tagSlugs'> | JobDTO): Promise<JobDTO> {
  return { ...j, tagSlugs: await t.getResourceTagSlugs(j.id) };
}
export async function enrichJobPage(t: TaxonomyPublicServicePort, p: PaginatedJobsDTO): Promise<PaginatedJobsDTO> {
  const ids = p.items.map((i) => i.id);
  const tags: Record<string, { slug: string }[]> = await t.getTagsByResourceIds(ids);

  return { ...p, items: p.items.map((i) => ({ ...i, tagSlugs: (tags[i.id] ?? []).map((x) => x.slug) })) };
}
