import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TagRepository } from '@/modules/taxonomy/application/tag/ports/tag.repository';

@Injectable()
export class ArchiveTagCommand {
  constructor(private readonly tags: TagRepository) {}

  async execute(id: string): Promise<void> {
    const tag = await this.tags.findById(id);
    if (!tag) throw new AppError('TAG_NOT_FOUND');
    tag.archive();
    await this.tags.save(tag);
  }
}
