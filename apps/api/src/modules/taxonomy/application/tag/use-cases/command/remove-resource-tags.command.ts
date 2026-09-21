import { Injectable } from '@nestjs/common';
import { ResourceTagRepository } from '@/modules/taxonomy/application/ports/repositories/resource-tag.repository';

@Injectable()
export class RemoveResourceTagsCommand {
  constructor(private readonly tags: ResourceTagRepository) {}
  execute(resourceId: string): Promise<void> {
    return this.tags.removeResourceClassification(resourceId);
  }
}
