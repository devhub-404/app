import { Injectable } from '@nestjs/common';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';

@Injectable()
export class DeleteTagIdentityTermCommand {
  constructor(private readonly identities: TagIdentityRepository) {}

  async execute(id: string): Promise<void> {
    await this.identities.deleteIdentityTerm(id);
  }
}
