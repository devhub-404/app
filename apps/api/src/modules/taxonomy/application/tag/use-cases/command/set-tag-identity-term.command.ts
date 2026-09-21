import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { Tag } from '@/modules/taxonomy/domain/tag';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';
import type { SetTagIdentityTermDTO } from '@/modules/taxonomy/application/tag/dtos/in';
import type { TagIdentityTermDTO } from '@/modules/taxonomy/application/tag/dtos/out';

@Injectable()
export class SetTagIdentityTermCommand {
  constructor(
    private readonly tagQueries: TagQueryRepository,
    private readonly identities: TagIdentityRepository,
  ) {}

  async execute(payload: SetTagIdentityTermDTO): Promise<TagIdentityTermDTO> {
    const value = Tag.normalizeSlug(payload.value);
    if (!value) throw new AppError('TAG_INVALID_IDENTITY_TERM');

    if (payload.kind === 'blocked') {
      const canonical = await this.tagQueries.findBySlug(value);
      const alias = await this.identities.findAliasByValue(value);
      if (canonical || alias) throw new AppError('TAG_IDENTITY_IN_USE');
    }

    return this.identities.setIdentityTerm(value, payload.kind);
  }
}
