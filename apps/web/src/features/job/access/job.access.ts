import type { Job } from '@/features/job/types/job.type.ts';
import { canCurate, canModerate, isAdmin, type Actor } from '../../auth/public/access.ts';

type JobAccessSubject = Pick<Job, 'publisherOrganizationId'>;

/**
 * Client-side authorization predicates for Job actions.
 * Lifecycle compatibility belongs to the feature domain layer.
 * The API remains authoritative for organization membership and authorization.
 */
export function canEditJob(job: JobAccessSubject, actor: Actor): boolean {
  const organizationPublisher = Boolean(
    job.publisherOrganizationId && actor.organizationIds.includes(job.publisherOrganizationId),
  );
  const editorialCurator = !job.publisherOrganizationId && canCurate(actor);
  return organizationPublisher || editorialCurator;
}

export function canCloseJob(job: JobAccessSubject, actor: Actor): boolean {
  return canEditJob(job, actor);
}

export function canRenewJob(job: JobAccessSubject, actor: Actor): boolean {
  return canEditJob(job, actor);
}

export function canWithdrawJob(job: JobAccessSubject, actor: Actor): boolean {
  return canEditJob(job, actor);
}

export function canDeleteJob(actor: Actor): boolean {
  return isAdmin(actor);
}

export function canModerateJob(actor: Actor): boolean {
  return canModerate(actor);
}

export function canViewJobManagement(actor: Actor): boolean {
  return canCurate(actor) || canModerate(actor);
}

export function canReviewJobSuggestions(actor: Actor): boolean {
  return canCurate(actor);
}
