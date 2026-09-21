import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { JobRepository } from '@/modules/job/application/ports/repositories/job.repository';
import { JobSuggestionRepository } from '@/modules/job/application/ports/repositories/job-suggestion.repository';
import { Job } from '@/modules/job/domain/job';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';

@Injectable()
export class AcceptJobSuggestionCommand {
  constructor(
    private readonly jobs: JobRepository,
    private readonly suggestions: JobSuggestionRepository,
    private readonly identities: ResourceIdentityPort,
    private readonly taxonomy: TaxonomyPublicServicePort,
  ) {}
  async execute(reviewerId: string, suggestionId: string): Promise<void> {
    await this.jobs.transaction(async (context) => {
      const suggestion = await this.suggestions.findById(suggestionId, context);
      if (!suggestion) throw new AppError('CONTENT_NOT_FOUND');
      const s = suggestion.snapshot();
      const identity = await this.identities.create('job', context);
      const job = Job.create(identity.id, null, {
        title: s.title,
        description: s.description,
        employmentType: s.employmentType,
        workplaceType: s.workplaceType,
        location: s.location,
        compensationMin: s.compensationMin,
        compensationMax: s.compensationMax,
        compensationCurrency: s.compensationCurrency,
        compensationUnit: s.compensationUnit,
        applicationUrl: s.applicationUrl,
        sourceUrl: s.sourceUrl,
      });
      await this.jobs.createAggregate(job, context);
      await this.taxonomy.setResourceClassification(identity.id, { tagSlugs: s.tagSlugs }, context);
      suggestion.accept(identity.id, reviewerId);
      if (!(await this.suggestions.save(suggestion, 'pending', context)))
        throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
    });
  }
}
