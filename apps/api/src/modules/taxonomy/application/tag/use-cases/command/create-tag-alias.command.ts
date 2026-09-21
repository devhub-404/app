import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { Tag } from '@/modules/taxonomy/domain/tag';
import { TagRepository } from '@/modules/taxonomy/application/tag/ports/tag.repository';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';
import type { CreateTagAliasDTO } from '@/modules/taxonomy/application/tag/dtos/in';
import type { TagAliasDTO } from '@/modules/taxonomy/application/tag/dtos/out';

@Injectable()
export class CreateTagAliasCommand {
  constructor(
    private readonly tags: TagRepository,
    private readonly tagQueries: TagQueryRepository,
    private readonly identities: TagIdentityRepository,
  ) {}

  async execute(payload: CreateTagAliasDTO): Promise<TagAliasDTO> {
    const tag = await this.tags.findById(payload.tagId);
    if (!tag || tag.status !== 'active') throw new AppError('TAG_NOT_FOUND');

    const alias = Tag.normalizeSlug(payload.alias);
    if (!alias) throw new AppError('TAG_INVALID_ALIAS');
    if (alias === tag.slug || (await this.tagQueries.existsBySlug(alias)))
      throw new AppError('TAG_IDENTITY_ALREADY_EXISTS');
    if (await this.identities.findAliasByValue(alias)) throw new AppError('TAG_IDENTITY_ALREADY_EXISTS');

    const term = await this.identities.findIdentityTerm(alias);
    if (term?.kind === 'blocked') throw new AppError('TAG_IDENTITY_BLOCKED');

    return this.identities.createAlias(tag.id, alias);
  }
}
