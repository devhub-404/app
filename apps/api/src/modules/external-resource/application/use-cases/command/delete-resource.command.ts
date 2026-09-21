import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ExternalResourceRepository } from '@/modules/external-resource/application/ports/repositories/resource.repository';
import { ExternalResourcePolicy } from '@/modules/external-resource/application/resource.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';

@Injectable()
export class DeleteResourceCommand {
  constructor(
    private readonly resourceRepository: ExternalResourceRepository,
    private readonly resourcePolicy: ExternalResourcePolicy,
  ) {}

  async execute(user: User, id: string): Promise<void> {
    const resource = await this.resourceRepository.findById(id);
    if (!resource) {
      throw new AppError('RESOURCE_NOT_FOUND');
    }

    const expected = { status: resource.status, deletedAt: resource.deletedAt };

    this.resourcePolicy.canDelete(user);

    resource.softDelete();
    const saved = await this.resourceRepository.save(resource, undefined, expected);
    if (saved === false) throw new AppError('RESOURCE_INVALID_STATUS');
  }
}
