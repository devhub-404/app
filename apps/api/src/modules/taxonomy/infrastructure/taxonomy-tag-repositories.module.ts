import { Module } from '@nestjs/common';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { TagRepository } from '@/modules/taxonomy/application/tag/ports/tag.repository';
import { DrizzleTagQueryRepository } from '@/modules/taxonomy/infrastructure/repositories/tag.query.repository';
import { DrizzleTagRepository } from '@/modules/taxonomy/infrastructure/repositories/tag.repository';
import { ResourceTagRepository } from '@/modules/taxonomy/application/ports/repositories/resource-tag.repository';
import { DrizzleResourceTagRepository } from '@/modules/taxonomy/infrastructure/repositories/resource-tag.repository';
import { TagWorkflowRepository } from '@/modules/taxonomy/application/tag/ports/tag-workflow.repository';
import { DrizzleTagWorkflowRepository } from '@/modules/taxonomy/infrastructure/repositories/tag-workflow.repository';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';
import { DrizzleTagIdentityRepository } from '@/modules/taxonomy/infrastructure/repositories/tag-identity.repository';

@Module({
  providers: [
    { provide: TagQueryRepository, useClass: DrizzleTagQueryRepository },
    { provide: TagRepository, useClass: DrizzleTagRepository },
    { provide: ResourceTagRepository, useClass: DrizzleResourceTagRepository },
    { provide: TagWorkflowRepository, useClass: DrizzleTagWorkflowRepository },
    { provide: TagIdentityRepository, useClass: DrizzleTagIdentityRepository },
  ],
  exports: [TagQueryRepository, TagRepository, ResourceTagRepository, TagWorkflowRepository, TagIdentityRepository],
})
export class TaxonomyTagRepositoriesModule {}
