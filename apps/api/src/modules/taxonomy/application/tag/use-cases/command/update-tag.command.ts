import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TagRepository } from '@/modules/taxonomy/application/tag/ports/tag.repository';
import { UpdateTagDTO } from '@/modules/taxonomy/application/tag/dtos/in';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';
import { TagDTO } from '@/modules/taxonomy/application/tag/dtos/out';
import { Tag } from '@/modules/taxonomy/domain/tag';

@Injectable()
export class UpdateTagCommand {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly tagQueryRepository: TagQueryRepository,
    private readonly tagIdentityRepository: TagIdentityRepository,
  ) {}

  async execute(id: string, payload: UpdateTagDTO): Promise<TagDTO> {
    const tag = await this.tagRepository.findById(id);

    if (!tag) {
      throw new AppError('TAG_NOT_FOUND');
    }

    const oldSlug = tag.slug;
    const slug = payload.slug ? Tag.normalizeSlug(payload.slug) : undefined;
    if (slug && slug !== oldSlug) {
      const canonical = await this.tagQueryRepository.findBySlug(slug);
      if (canonical && canonical.id !== id) throw new AppError('TAG_ALREADY_EXISTS');
      if (await this.tagIdentityRepository.findAliasByValue(slug)) throw new AppError('TAG_IDENTITY_ALREADY_EXISTS');
      if ((await this.tagIdentityRepository.findIdentityTerm(slug))?.kind === 'blocked') {
        throw new AppError('TAG_IDENTITY_BLOCKED');
      }
    }
    tag.update(slug === undefined ? payload : { ...payload, slug });
    await this.tagRepository.save(tag);
    if (slug && slug !== oldSlug) await this.tagIdentityRepository.createAlias(id, oldSlug);

    return (await this.tagQueryRepository.findById(id)) as TagDTO;
  }
}
