import { describe, expect, it } from 'vitest';
import { Job } from '@/modules/job/domain/job';

const details = {
  title: 'Senior TypeScript Engineer',
  description: 'Build developer infrastructure with a strong TypeScript stack.',
  employmentType: 'full_time' as const,
  workplaceType: 'remote' as const,
  location: null,
  compensationMin: null,
  compensationMax: null,
  compensationCurrency: null,
  compensationUnit: null,
  applicationUrl: 'https://example.com/jobs/1#apply',
  sourceUrl: null,
};

describe('Job domain', () => {
  it('creates institutional or editorial Jobs without a publicationType discriminator', () => {
    const institutional = Job.create('job-1', 'org-1', details, new Date('2026-01-01T00:00:00.000Z'));
    const editorial = Job.create('job-2', null, details, new Date('2026-01-01T00:00:00.000Z'));
    expect(institutional.publisherOrganizationId).toBe('org-1');
    expect(editorial.publisherOrganizationId).toBeNull();
    expect(institutional.snapshot().applicationUrl).toBe('https://example.com/jobs/1');
  });
  it('closes, expires, renews and deletes according to published lifecycle', () => {
    const job = Job.create('job-1', null, details, new Date('2026-01-01T00:00:00.000Z'));
    job.close(new Date('2026-01-02T00:00:00.000Z'));
    expect(job.status).toBe('closed');
    job.renew(new Date('2026-01-03T00:00:00.000Z'));
    expect(job.status).toBe('published');
    job.delete(new Date('2026-01-04T00:00:00.000Z'));
    expect(job.deletedAt).toBe('2026-01-04T00:00:00.000Z');
  });

  it('JOB-RN-008/MOD-RN-002 — keeps hide independent from closed history state', () => {
    const job = Job.create('job-1', null, details, new Date('2026-01-01T00:00:00.000Z'));
    job.close(new Date('2026-01-02T00:00:00.000Z'));
    job.hide(new Date('2026-01-03T00:00:00.000Z'));
    expect(job.hiddenAt).toBe('2026-01-03T00:00:00.000Z');
    job.unhide();
    expect(job.hiddenAt).toBeNull();
  });
});
