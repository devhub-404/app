import type { components, paths } from '@devhub-404/api-contract';

export type ListMyProjectsQuery = NonNullable<paths['/api/v1/projects/me']['get']['parameters']['query']>;
export type ListProjectsQuery = NonNullable<paths['/api/v1/projects']['get']['parameters']['query']>;
export type Project = components['schemas']['ProjectDTO'];
export type SaveProject = components['schemas']['SaveProjectDTO'];
export type UpdateProject = components['schemas']['UpdateProjectDTO'];
