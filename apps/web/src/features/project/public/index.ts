export { default as ProjectsPage } from '../ui/pages/projects.page.astro';
export { default as NewProjectPage } from '../ui/pages/new-project.page.astro';
export { default as ProjectPage } from '../ui/pages/project.page.astro';
export { default as AccountProjectsPage } from '../ui/pages/account-projects.page.astro';
export { default as EditProjectPage } from '../ui/pages/edit-project.page.astro';
export { getProjectQuery, listMyProjects, listProjectsForManagement } from '@/features/project/actions/project.action.ts';
export type { Project, SaveProject } from '@/features/project/types/project.type.ts';
export {
  isProjectAuthor,
  canEditProject,
  canDeleteProject,
  canPublishProject,
  canArchiveProject,
  canUnarchiveProject,
} from '../access/project.access.ts';
export {
  isProjectPublic,
  isProjectPublishable,
  isProjectArchivable,
  isProjectUnarchivable,
  type ProjectLifecycleState,
} from '../domain/project.domain.ts';

export { listProjectsQuery } from '../actions/project.action.ts';
export { default as ProjectsListing } from '../ui/components/projects-listing.component.tsx';
export type { ProjectsListingState } from '../ui/components/projects-listing.component.tsx';
