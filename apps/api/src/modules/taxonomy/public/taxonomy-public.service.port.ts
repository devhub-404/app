export type ResourceClassification = {
  tagSlugs: string[];
};

export interface TaxonomyPublicTag {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'archived';
}

export abstract class TaxonomyPublicServicePort {
  abstract validateTags(tagSlugs: string[], suggestedById: string): Promise<ResourceClassification>;
  abstract getTagBySlug(slug: string): Promise<TaxonomyPublicTag | null>;
  abstract getResourceIdsByTagSlugs(tagSlugs: string[]): Promise<string[]>;
  abstract getTagsByResourceIds(
    resourceIds: string[],
  ): Promise<Record<string, Array<Pick<TaxonomyPublicTag, 'name' | 'slug'>>>>;
  abstract getResourceTagSlugs(resourceId: string): Promise<string[]>;
  abstract setResourceClassification(
    resourceId: string,
    classification: ResourceClassification,
    context?: unknown,
  ): Promise<void>;
}

export const TAXONOMY_PUBLIC_SERVICE = 'TAXONOMY_PUBLIC_SERVICE';
