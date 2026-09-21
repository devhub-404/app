import { Injectable } from '@nestjs/common';
import {
  TagIdentityRepository,
  type TagIdentityTermKind,
} from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';
import type { TagIdentityTermDTO } from '@/modules/taxonomy/application/tag/dtos/out';

@Injectable()
export class ListTagIdentityTermsQuery {
  constructor(private readonly identities: TagIdentityRepository) {}

  execute(kind?: TagIdentityTermKind): Promise<TagIdentityTermDTO[]> {
    return this.identities.listIdentityTerms(kind);
  }
}
