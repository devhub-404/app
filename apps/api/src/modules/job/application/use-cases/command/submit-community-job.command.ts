import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppError } from '@/shared/errors/app-error';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { AccountAccessPort } from '@/modules/account/public/account-access.ports';
import { JobSuggestionRepository } from '@/modules/job/application/ports/repositories/job-suggestion.repository';
import { JobSuggestion } from '@/modules/job/domain/job-suggestion';
import type { SubmitCommunityJobDTO } from '../../dtos';

@Injectable()
export class SubmitCommunityJobCommand {
  constructor(
    private readonly suggestions: JobSuggestionRepository,
    private readonly taxonomy: TaxonomyPublicServicePort,
    private readonly accounts: AccountAccessPort,
    private readonly restrictions: ModerationAccountRestrictionPort,
  ) {}
  async execute(accountId: string, input: SubmitCommunityJobDTO) {
    await this.restrictions.assertAccountCapability(accountId, 'CONTRIBUTION');
    if (!(await this.accounts.findPrimaryEmailByUserId(accountId))?.verifiedAt)
      throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
    const classification = await this.taxonomy.validateTags(input.tagSlugs, accountId);
    const suggestion = JobSuggestion.create(
      randomUUID(),
      accountId,
      {
        title: input.title,
        description: input.description,
        employmentType: input.employmentType,
        workplaceType: input.workplaceType,
        location: input.location ?? null,
        compensationMin: input.compensationMin == null ? null : String(input.compensationMin),
        compensationMax: input.compensationMax == null ? null : String(input.compensationMax),
        compensationCurrency: input.compensationCurrency ?? null,
        compensationUnit: input.compensationUnit ?? null,
        applicationUrl: input.applicationUrl,
        sourceUrl: input.sourceUrl ?? null,
      },
      classification.tagSlugs,
    );
    await this.suggestions.create(suggestion);

    return {
      ...suggestion.snapshot(),
      publicationType: 'community' as const,
      publisherOrganizationId: null,
    };
  }
}
