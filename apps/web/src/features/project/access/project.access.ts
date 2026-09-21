import type { Project } from '@/features/project/types/project.type.ts';
import { canModerate, type Actor } from '../../auth/public/access.ts';

export function isProjectAuthor(project: Pick<Project, 'authorAccountId'>, actor: Actor): boolean {
  return Boolean(actor.accountId && project.authorAccountId === actor.accountId);
}

export function canEditProject(project: Pick<Project, 'authorAccountId'>, actor: Actor): boolean {
  return isProjectAuthor(project, actor);
}

export function canPublishProject(project: Pick<Project, 'authorAccountId'>, actor: Actor): boolean {
  return canEditProject(project, actor);
}

export function canArchiveProject(project: Pick<Project, 'authorAccountId'>, actor: Actor): boolean {
  return canEditProject(project, actor);
}

export function canUnarchiveProject(project: Pick<Project, 'authorAccountId'>, actor: Actor): boolean {
  return canEditProject(project, actor);
}

export function canDeleteProject(project: Pick<Project, 'authorAccountId'>, actor: Actor): boolean {
  return actor.role === 'admin' || canEditProject(project, actor);
}

export function canManageProjects(actor: Actor): boolean {
  return canModerate(actor);
}
