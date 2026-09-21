import { Module } from '@nestjs/common';
import { ExternalResourceQueryRepository } from '@/modules/external-resource/application/ports/repositories/resource.query.repository';
import { ExternalResourceRepository } from '@/modules/external-resource/application/ports/repositories/resource.repository';
import { DrizzleExternalResourceQueryRepository } from '@/modules/external-resource/infrastructure/repositories/resource.query.repository';
import { DrizzleExternalResourceRepository } from '@/modules/external-resource/infrastructure/repositories/resource.repository';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { ExternalResourceSuggestionRepository } from '@/modules/external-resource/application/ports/repositories/external-resource-suggestion.repository';
import { DrizzleExternalResourceSuggestionRepository } from '@/modules/external-resource/infrastructure/repositories/external-resource-suggestion.repository';

@Module({
  imports: [TaxonomyPublicModule],
  providers: [
    { provide: ExternalResourceQueryRepository, useClass: DrizzleExternalResourceQueryRepository },
    { provide: ExternalResourceRepository, useClass: DrizzleExternalResourceRepository },
    { provide: ExternalResourceSuggestionRepository, useClass: DrizzleExternalResourceSuggestionRepository },
  ],
  exports: [ExternalResourceQueryRepository, ExternalResourceRepository, ExternalResourceSuggestionRepository],
})
export class ExternalResourceRepositoriesModule {}
