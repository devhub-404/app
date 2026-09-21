import { describe, expect, it, vi } from 'vitest';
import { CreateJobCommand } from '@/modules/job/application/use-cases/command/create-job.command';
import { SubmitCommunityJobCommand } from '@/modules/job/application/use-cases/command/submit-community-job.command';
import { AcceptJobSuggestionCommand } from '@/modules/job/application/use-cases/command/accept-job-suggestion.command';
import { RejectJobSuggestionCommand } from '@/modules/job/application/use-cases/command/reject-job-suggestion.command';
import { UpdateJobCommand } from '@/modules/job/application/use-cases/command/update-job.command';
import { Job } from '@/modules/job/domain/job';
import { JobSuggestion } from '@/modules/job/domain/job-suggestion';

describe('Job use cases', () => {
  const input = {
    publisherOrganizationId: 'org-1',
    title: 'Senior TypeScript Developer',
    description: 'Build developer infrastructure.',
    employmentType: 'full_time' as const,
    workplaceType: 'remote' as const,
    location: null,
    compensationMin: 100000,
    compensationMax: 150000,
    compensationCurrency: 'USD',
    compensationUnit: 'yearly' as const,
    applicationUrl: 'https://jobs.example.com/apply',
    sourceUrl: 'https://jobs.example.com/source',
    tagSlugs: ['typescript'],
  };

  const dependencies = () => ({
    repository: {
      transaction: vi.fn(async (work: (context: unknown) => Promise<unknown>) => work({ transaction: true })),
      createAggregateWithinActiveLimit: vi.fn(async (job: Job) => job.snapshot()),
      createAggregate: vi.fn(async () => undefined),
      getForAuthorization: vi.fn(),
      findAggregateById: vi.fn(),
      saveAggregate: vi.fn(async () => true),
    },
    taxonomy: {
      validateTags: vi.fn(async () => ({ tagSlugs: ['typescript'] })),
      setResourceClassification: vi.fn(async () => undefined),
    },
    accounts: { findPrimaryEmailByUserId: vi.fn(async () => ({ verifiedAt: '2026-08-01T00:00:00.000Z' })) },
    organizations: { assertCanManage: vi.fn(async () => undefined) },
    restrictions: { assertAccountCapability: vi.fn(async () => undefined) },
    identities: { create: vi.fn(async () => ({ id: 'job-1', kind: 'job' })) },
  });

  it('JOB-RNF-001/JOB-RNF-002 — publishes Organization Job directly with a ResourceIdentity', async () => {
    const d = dependencies();
    const command = new CreateJobCommand(
      d.repository as never,
      d.taxonomy as never,
      d.accounts as never,
      d.restrictions,
      d.organizations as never,
      d.identities as never,
    );
    const result = await command.execute('account-1', input);
    expect(d.organizations.assertCanManage).toHaveBeenCalledWith('account-1', 'org-1');
    expect(d.identities.create).toHaveBeenCalledWith('job', expect.objectContaining({ transaction: true }));
    expect(d.taxonomy.setResourceClassification).toHaveBeenCalledWith(
      'job-1',
      { tagSlugs: ['typescript'] },
      expect.objectContaining({ transaction: true }),
    );
    expect(result.publisherOrganizationId).toBe('org-1');
    expect(result.status).toBe('published');
  });

  it('developer submission creates JobSuggestion, not Job', async () => {
    const create = vi.fn(async () => 'suggestion-1');
    const suggestions = { create };
    const taxonomy = { validateTags: vi.fn(async () => ({ tagSlugs: ['typescript'] })) };
    const accounts = { findPrimaryEmailByUserId: vi.fn(async () => ({ verifiedAt: '2026-08-01T00:00:00.000Z' })) };
    const command = new SubmitCommunityJobCommand(suggestions as never, taxonomy as never, accounts as never, {
      assertAccountCapability: async () => undefined,
    });
    const { publisherOrganizationId: _, ...communityInput } = input;
    const result = await command.execute('account-1', communityInput);
    expect(result).toMatchObject({ submittedByAccountId: 'account-1', status: 'pending', acceptedJobId: null });
    expect(create).toHaveBeenCalledWith(expect.any(JobSuggestion));
  });

  it('JOB-RNF-002/JOB-RNF-003 — accepting JobSuggestion atomically creates editorial Job with no Organization publisher', async () => {
    const context = { transaction: true };
    const { publisherOrganizationId: _, ...communityInput } = input;
    const suggestion = JobSuggestion.create(
      'suggestion-1',
      'account-1',
      {
        ...communityInput,
        compensationMin: String(communityInput.compensationMin),
        compensationMax: String(communityInput.compensationMax),
      },
      ['typescript'],
    );
    const jobs = {
      transaction: vi.fn(async (work: (context: unknown) => Promise<unknown>) => work(context)),
      createAggregate: vi.fn(async (job: Job) => job.snapshot()),
    };
    const suggestions = { findById: vi.fn(async () => suggestion), save: vi.fn(async () => true) };
    const identities = { create: vi.fn(async () => ({ id: 'job-1', kind: 'job' })) };
    const taxonomy = { setResourceClassification: vi.fn(async () => undefined) };
    await new AcceptJobSuggestionCommand(
      jobs as never,
      suggestions as never,
      identities as never,
      taxonomy as never,
    ).execute('curator-1', 'suggestion-1');
    expect(jobs.createAggregate).toHaveBeenCalledWith(
      expect.objectContaining({ publisherOrganizationId: null }),
      context,
    );
    expect(taxonomy.setResourceClassification).toHaveBeenCalledWith('job-1', { tagSlugs: ['typescript'] }, context);
    expect(suggestion.snapshot()).toMatchObject({
      status: 'accepted',
      acceptedJobId: 'job-1',
      decidedByAccountId: 'curator-1',
    });
  });

  it('rejecting JobSuggestion preserves proposal and decision trail', async () => {
    const { publisherOrganizationId: _, ...communityInput } = input;
    const suggestion = JobSuggestion.create(
      'suggestion-1',
      'account-1',
      {
        ...communityInput,
        compensationMin: String(communityInput.compensationMin),
        compensationMax: String(communityInput.compensationMax),
      },
      ['typescript'],
    );
    const suggestions = { findById: vi.fn(async () => suggestion), save: vi.fn(async () => true) };
    await new RejectJobSuggestionCommand(suggestions as never).execute(
      'curator-1',
      suggestion.snapshot().id,
      'Duplicate',
    );
    expect(suggestion.snapshot()).toMatchObject({
      status: 'rejected',
      decisionNote: 'Duplicate',
      decidedByAccountId: 'curator-1',
    });
  });

  it('updates published Job and delegates classification by Resource id', async () => {
    const d = dependencies();
    const aggregate = Job.create('job-1', 'org-1', {
      ...input,
      compensationMin: String(input.compensationMin),
      compensationMax: String(input.compensationMax),
      sourceUrl: input.sourceUrl,
    });
    d.repository.getForAuthorization.mockResolvedValue({ ...aggregate.snapshot(), tagSlugs: ['typescript'] });
    d.repository.findAggregateById.mockResolvedValue(aggregate);
    const access = { assertCanManage: vi.fn(async () => undefined) };
    await new UpdateJobCommand(d.repository as never, d.taxonomy as never, access as never).execute(
      { sub: 'account-1', role: null },
      'job-1',
      input,
    );
    expect(d.taxonomy.setResourceClassification).toHaveBeenCalledWith(
      'job-1',
      { tagSlugs: ['typescript'] },
      expect.objectContaining({ transaction: true }),
    );
  });
});
