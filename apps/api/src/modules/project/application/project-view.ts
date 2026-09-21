import type { PaginatedProjectsDTO, ProjectDTO } from './dtos';
import type { TaxonomyPublicServicePort } from '@/modules/taxonomy/public';
export async function enrichProject(
  t: TaxonomyPublicServicePort,
  p: Omit<ProjectDTO, 'tagSlugs'> | ProjectDTO,
): Promise<ProjectDTO> {
  return { ...p, tagSlugs: await t.getResourceTagSlugs(p.id) };
}
export async function enrichProjectPage(
  t: TaxonomyPublicServicePort,
  p: PaginatedProjectsDTO,
): Promise<PaginatedProjectsDTO> {
  const ids = p.items.map((i) => i.id);
  const tags: Record<string, { slug: string }[]> = await t.getTagsByResourceIds(ids);

  return { ...p, items: p.items.map((i) => ({ ...i, tagSlugs: (tags[i.id] ?? []).map((x) => x.slug) })) };
}
