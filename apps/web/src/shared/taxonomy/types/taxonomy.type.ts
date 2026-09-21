import type { components, paths } from '@devhub-404/api-contract';

export type CreateTagAliasDTO = components['schemas']['CreateTagAliasDTO'];
export type CreateTagDTO = components['schemas']['CreateTagDTO'];
export type ListTagsQuery = NonNullable<paths['/api/v1/taxonomy/tags']['get']['parameters']['query']>;
export type ListTagsPageQuery = NonNullable<paths['/api/v1/taxonomy/tags/page']['get']['parameters']['query']>;
export type MergeTagsDTO = components['schemas']['MergeTagsDTO'];
export type SetTagIdentityTermDTO = components['schemas']['SetTagIdentityTermDTO'];
export type TagAliasDTO = components['schemas']['TagAliasDTO'];
export type TagDTO = components['schemas']['TagDTO'];
export type TagIdentityTermDTO = components['schemas']['TagIdentityTermDTO'];
type TagsPageResponseDTO = paths['/api/v1/taxonomy/tags/page']['get']['responses'][200]['content']['application/json'];
export type PaginatedTagsDTO = NonNullable<TagsPageResponseDTO['data']>;
export type UpdateTagDTO = components['schemas']['UpdateTagDTO'];
