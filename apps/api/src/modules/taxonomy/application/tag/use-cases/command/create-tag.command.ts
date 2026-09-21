import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TagRepository } from '@/modules/taxonomy/application/tag/ports/tag.repository';
import { CreateTagDTO } from '@/modules/taxonomy/application/tag/dtos/in';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { Tag } from '@/modules/taxonomy/domain/tag';
import { TagDTO } from '@/modules/taxonomy/application/tag/dtos/out';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';

@Injectable()
export class CreateTagCommand {
  constructor(
    private readonly tagQueryRepository: TagQueryRepository,
    private readonly tagRepository: TagRepository,
    private readonly tagIdentityRepository: TagIdentityRepository,
  ) {}

  async execute(payload: CreateTagDTO): Promise<TagDTO> {
    const normalized = Tag.normalizeSlug(payload.slug);
    const term = await this.tagIdentityRepository.findIdentityTerm(normalized);
    if (term?.kind === 'blocked') throw new AppError('TAG_IDENTITY_BLOCKED');

    const alias = await this.tagIdentityRepository.findAliasByValue(normalized);
    if (alias) throw new AppError('TAG_IDENTITY_ALREADY_EXISTS');

    const bySlug = await this.tagQueryRepository.existsBySlug(normalized);

    if (bySlug) {
      throw new AppError('TAG_ALREADY_EXISTS');
    }

    Tag.create('__new__', { name: payload.name, slug: normalized });

    await this.tagRepository.create({ name: payload.name, slug: normalized });

    return (await this.tagQueryRepository.findBySlug(normalized)) as TagDTO;
  }
}
