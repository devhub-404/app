export { default as ResourceCard } from '../ui/components/card/resource-card.component.tsx';
export { default as ResourcesPage } from '../ui/pages/resources.page.astro';

export { listResources, listMyResourceSuggestions } from '../actions/resource.action.ts';
export type { ResourceMutationResult } from '../actions/resource.action.ts';

export type { ResourceItem, ResourceSuggestionDTO, SuggestResourceDTO } from '@/features/resource/types/resource.type.ts';
export { default as ResourcesEditPage } from '../ui/pages/resources-edit.page.astro';
export { default as ResourcesNewPage } from '../ui/pages/resources-new.page.astro';
export { default as ResourceSuggestionPage } from '../ui/pages/resource-suggestion.page.astro';
export { canAccessResourceEditorialPath, requiresResourceEditorialAccess } from '../access/route.access.ts';
export {
  canArchiveResource,
  canDeleteResource,
  canManageResources,
  canUnarchiveResource,
} from '../access/resource.access.ts';
export { isResourceArchivable, isResourceUnarchivable } from '../domain/resource.domain.ts';

export {
  listResourcesForManagement,
  loadResourceForManagement,
  listPendingResourceSuggestions,
  approveResourceSuggestion,
  rejectResourceSuggestion,
  archiveResource,
  unarchiveResource,
  deleteResource,
  loadResourceMetadata,
} from '../actions/resource.action.ts';
export type { ResourceMetadata } from '../actions/resource.action.ts';
export { default as EditResourceForm } from '../ui/components/forms/edit-resource-form.component.tsx';

export { default as ResourcesListing } from '../ui/components/resources-listing.component.tsx';
export type { ResourcesListingState } from '../ui/components/resources-listing.component.tsx';
