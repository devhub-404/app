export type ResourceTagItem = {
  resourceId: string;
  name: string;
  slug: string;
};

export type ResourceClassification = {
  tagSlugs: string[];
};

export abstract class ResourceTagRepository {
  abstract removeAllAssociationsByTagId(tagId: string): Promise<void>;
  abstract removeResourceClassification(resourceId: string): Promise<void>;
  abstract getResourceIdsByTagSlugs(slugs: string[]): Promise<string[]>;
  abstract getTagsByResourceIds(resourceIds: string[]): Promise<ResourceTagItem[]>;
  abstract getResourceTagSlugs(resourceId: string): Promise<string[]>;
  abstract setResourceClassification(
    resourceId: string,
    classification: ResourceClassification,
    context?: unknown,
  ): Promise<void>;
}

/** Contract alias for resource↔tag associations. */
export abstract class TaxonomyAssociationPort extends ResourceTagRepository {}
