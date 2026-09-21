import type { Job } from '@/features/job/types/job.type.ts';

type JobLifecycleSubject = Pick<Job, 'status'>;

export function isJobEditable(job: JobLifecycleSubject): boolean {
  return job.status !== 'withdrawn';
}

export function isJobClosable(job: JobLifecycleSubject): boolean {
  return job.status === 'published';
}

export function isJobRenewable(job: JobLifecycleSubject): boolean {
  return job.status === 'published' || job.status === 'closed' || job.status === 'expired';
}

export function isJobWithdrawable(job: JobLifecycleSubject): boolean {
  return job.status !== 'withdrawn';
}
