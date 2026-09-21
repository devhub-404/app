import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ExternalResourceRepository } from '@/modules/external-resource/application/ports/repositories/resource.repository';
import { UpdateResourceDTO } from '@/modules/external-resource/application/dtos/in';
import { ExternalResourcePolicy } from '@/modules/external-resource/application/resource.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public';

@Injectable()
export class UpdateResourceCommand {
  constructor(
    private readonly resourceRepository: ExternalResourceRepository,
    private readonly resourcePolicy: ExternalResourcePolicy,
    private readonly taxonomyService: TaxonomyPublicServicePort,
  ) {}

  async execute(user: User, id: string, payload: UpdateResourceDTO): Promise<void> {
    const resource = await this.resourceRepository.findById(id);

    if (!resource) {
      throw new AppError('RESOURCE_NOT_FOUND');
    }

    const expected = { status: resource.status, deletedAt: resource.deletedAt };

    this.resourcePolicy.canUpdate(user);

    const classification = payload.tagSlugs
      ? await this.taxonomyService.validateTags(payload.tagSlugs, user.sub)
      : undefined;

    const nextTagSlugs = payload.tagSlugs ?? (await this.taxonomyService.getResourceTagSlugs(resource.id));

    resource.update({
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.url !== undefined ? { url: payload.url } : {}),
      tagSlugs: nextTagSlugs,
    });

    const saved = await this.resourceRepository.save(resource, classification, expected);
    if (saved === false) throw new AppError('RESOURCE_INVALID_STATUS');
  }
}
