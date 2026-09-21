import { Injectable } from '@nestjs/common';
import { ExternalResourceRepository } from '@/modules/external-resource/application/ports/repositories/resource.repository';
import { ExternalResourceStatus } from '@/modules/external-resource/domain/external-resource';
import { AppError } from '@/shared/errors/app-error';
import { ExternalResourcePublicServicePort } from '@/modules/external-resource/public/resource-public.service.port';

@Injectable()
export class ExternalResourcePublicService implements ExternalResourcePublicServicePort {
  constructor(private readonly resourceRepository: ExternalResourceRepository) {}

  async listPublishedBySubmitter(accountId: string, limit = 20) {
    const resources = await this.resourceRepository.listPublishedBySubmitter(accountId, limit);

    return resources.map((resource) => ({
      id: resource.id,
      type: 'resource' as const,
      title: resource.title,
      occurredAt: resource.createdAt,
    }));
  }

  async resolveAccess(resourceId: string) {
    const resource = await this.resourceRepository.findById(resourceId, { includeDeleted: true });

    if (!resource) return null;

    return {
      id: resource.id,
      ownerAccountId: null,
      title: resource.title,
      description: resource.description,
      url: resource.url,
      status: resource.status,
      updatedAt: resource.updatedAt,
      isPublic: resource.status === ExternalResourceStatus.Active && resource.deletedAt === null,
    };
  }

  async applyEditorialAction(resourceId: string, action: 'archive' | 'delete'): Promise<void> {
    const resource = await this.resourceRepository.findById(resourceId);
    if (!resource) throw new AppError('RESOURCE_NOT_FOUND');
    const expected = { status: resource.status, deletedAt: resource.deletedAt };
    if (action === 'archive') resource.archive();
    else resource.softDelete();
    const saved = await this.resourceRepository.save(resource, undefined, expected);
    if (saved === false) throw new AppError('RESOURCE_INVALID_STATUS');
  }
}
