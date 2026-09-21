import { Injectable } from '@nestjs/common';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';

@Injectable()
export class DeleteTagAliasCommand {
  constructor(private readonly identities: TagIdentityRepository) {}

  async execute(id: string): Promise<void> {
    await this.identities.deleteAlias(id);
  }
}
