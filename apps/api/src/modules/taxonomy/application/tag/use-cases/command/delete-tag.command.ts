import { Injectable } from '@nestjs/common';
import { TagRepository } from '@/modules/taxonomy/application/tag/ports/tag.repository';
import { AppError } from '@/shared/errors/app-error';

@Injectable()
export class DeleteTagCommand {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(id: string): Promise<void> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new AppError('TAG_NOT_FOUND');
    await this.tagRepository.delete(id);
  }
}
