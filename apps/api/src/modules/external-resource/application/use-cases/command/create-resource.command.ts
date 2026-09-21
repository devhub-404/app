import { Injectable } from '@nestjs/common';
import { CreateResourceDTO } from '@/modules/external-resource/application/dtos/in';
import { ExternalResourceRepository } from '@/modules/external-resource/application/ports/repositories/resource.repository';
import { ExternalResource } from '@/modules/external-resource/domain/external-resource';
import { ExternalResourceQueryRepository } from '@/modules/external-resource/application/ports/repositories/resource.query.repository';
import { ResourceItemDTO } from '@/modules/external-resource/application/dtos/out';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public';
import { ExternalResourceStatus } from '@/modules/external-resource/domain/external-resource';
import { ExternalResourcePolicy } from '@/modules/external-resource/application/resource.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';

@Injectable()
export class CreateResourceCommand {
  constructor(
    private readonly resourceRepository: ExternalResourceRepository,
    private readonly resourceQueryRepository: ExternalResourceQueryRepository,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly resourcePolicy: ExternalResourcePolicy,
    private readonly identities: ResourceIdentityPort,
  ) {}

  async execute(user: User, payload: CreateResourceDTO): Promise<ResourceItemDTO> {
    this.resourcePolicy.canCreate(user);
    const classification = await this.taxonomyService.validateTags(payload.tagSlugs ?? [], user.sub);

    const resourceId = await this.resourceRepository.transaction(async (context) => {
      const identity = await this.identities.create('external_resource', context);
      const resource = ExternalResource.create(identity.id, {
        title: payload.title,
        description: payload.description,
        url: payload.url,
        tagSlugs: payload.tagSlugs ?? [],
        status: ExternalResourceStatus.Active,
      });

      return this.resourceRepository.create(resource, classification, context);
    });

    return (await this.resourceQueryRepository.findById(resourceId)) as ResourceItemDTO;
  }
}
