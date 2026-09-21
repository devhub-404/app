import type { Project } from '@/features/project/types/project.type.ts';

export type ProjectLifecycleState = 'draft' | 'published' | 'archived';

export function isProjectPublic(project: Pick<Project, 'status' | 'hiddenAt'>): boolean {
  return project.status === 'published' && !project.hiddenAt;
}

export function isProjectPublishable(project: Pick<Project, 'status'>): boolean {
  return project.status === 'draft';
}

export function isProjectArchivable(project: Pick<Project, 'status'>): boolean {
  return project.status === 'published';
}

export function isProjectUnarchivable(project: Pick<Project, 'status'>): boolean {
  return project.status === 'archived';
}
