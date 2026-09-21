import { Module } from '@nestjs/common';
import { TaxonomyTagRepositoriesModule } from '@/modules/taxonomy/infrastructure/taxonomy-tag-repositories.module';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { TaxonomyPublicService } from '@/modules/taxonomy/public/taxonomy-public.service';

@Module({
  imports: [TaxonomyTagRepositoriesModule],
  providers: [{ provide: TaxonomyPublicServicePort, useClass: TaxonomyPublicService }],
  exports: [TaxonomyPublicServicePort],
})
export class TaxonomyPublicModule {}
