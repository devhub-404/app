import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ExternalResourceQueryRepository } from '@/modules/external-resource/application/ports/repositories/resource.query.repository';
import { ResourceItemDTO } from '@/modules/external-resource/application/dtos/out';

@Injectable()
export class GetResourceByIdQuery {
  constructor(private readonly resourceQueryRepository: ExternalResourceQueryRepository) {}

  async execute(id: string): Promise<ResourceItemDTO> {
    const resource = await this.resourceQueryRepository.findById(id);
    if (!resource) {
      throw new AppError('RESOURCE_NOT_FOUND');
    }

    return resource;
  }
}
