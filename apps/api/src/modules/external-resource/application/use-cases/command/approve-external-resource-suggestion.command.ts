import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ExternalResourceSuggestionRepository } from '@/modules/external-resource/application/ports/repositories/external-resource-suggestion.repository';
import { ExternalResourceRepository } from '@/modules/external-resource/application/ports/repositories/resource.repository';
import { ExternalResourcePolicy } from '@/modules/external-resource/application/resource.policy';
import { ExternalResource } from '@/modules/external-resource/domain/external-resource';
import { ExternalResourceSuggestionStatus } from '@/modules/external-resource/domain/external-resource-suggestion';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public';
import { ApproveExternalResourceSuggestionDTO } from '@/modules/external-resource/application/dtos/in';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
@Injectable()
export class ApproveExternalResourceSuggestionCommand {
  constructor(
    private readonly suggestions: ExternalResourceSuggestionRepository,
    private readonly resources: ExternalResourceRepository,
    private readonly policy: ExternalResourcePolicy,
    private readonly taxonomy: TaxonomyPublicServicePort,
    private readonly identities: ResourceIdentityPort,
  ) {}
  async execute(user: User, id: string, payload: ApproveExternalResourceSuggestionDTO): Promise<void> {
    this.policy.canReview(user);
    const classification = await this.taxonomy.validateTags(payload.tagSlugs ?? [], user.sub);
    await this.resources.transaction(async (context) => {
      const suggestion = await this.suggestions.findById(id, context);
      if (!suggestion) throw new AppError('EXTERNAL_RESOURCE_SUGGESTION_NOT_FOUND');
      const identity = await this.identities.create('external_resource', context);
      const resource = ExternalResource.create(identity.id, {
        title: payload.title,
        description: payload.description,
        url: suggestion.url,
        tagSlugs: payload.tagSlugs ?? [],
      });
      const resourceId = await this.resources.create(resource, classification, context);
      suggestion.approve(resourceId, user.sub);
      if (!(await this.suggestions.save(suggestion, ExternalResourceSuggestionStatus.Pending, context)))
        throw new AppError('EXTERNAL_RESOURCE_SUGGESTION_INVALID_STATUS');
    });
  }
}
