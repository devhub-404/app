import type { components, paths } from '@devhub-404/api-contract';

export type ApproveResourceSuggestionDTO = components['schemas']['ApproveExternalResourceSuggestionDTO'];
export type CreateResourceDTO = components['schemas']['CreateResourceDTO'];
export type ResourceItemDTO = components['schemas']['ResourceItemDTO'];
export type ResourceItem = components['schemas']['ResourceItemDTO'];
export type ResourceSuggestionDTO = components['schemas']['ExternalResourceSuggestionDTO'];
export type RejectResourceDTO = components['schemas']['RejectResourceDTO'];
export type ResourceTag = components['schemas']['ResourceItemDTO']['tags'][number];
export type SuggestResourceDTO = components['schemas']['SuggestExternalResourceDTO'];
export type UpdateResourceDTO = components['schemas']['UpdateResourceDTO'];

type ResourceListResponseDTO = paths['/api/v1/resources']['get']['responses'][200]['content']['application/json'];
type PendingResourceSuggestionsResponseDTO =
  paths['/api/v1/resources/suggestions/pending']['get']['responses'][200]['content']['application/json'];
type MyResourceSuggestionsResponseDTO =
  paths['/api/v1/resources/suggestions/me']['get']['responses'][200]['content']['application/json'];

export type ResourceListDataDTO = NonNullable<ResourceListResponseDTO['data']>;
export type PendingResourceSuggestionsDataDTO = NonNullable<PendingResourceSuggestionsResponseDTO['data']>;
export type MyResourceSuggestionsDataDTO = NonNullable<MyResourceSuggestionsResponseDTO['data']>;
