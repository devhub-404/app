import { Injectable } from '@nestjs/common';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';
import type { TagAliasDTO } from '@/modules/taxonomy/application/tag/dtos/out';

@Injectable()
export class ListTagAliasesQuery {
  constructor(private readonly identities: TagIdentityRepository) {}

  execute(tagId?: string): Promise<TagAliasDTO[]> {
    return this.identities.listAliases(tagId);
  }
}
