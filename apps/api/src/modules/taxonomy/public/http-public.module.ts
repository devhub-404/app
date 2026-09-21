import { Module } from '@nestjs/common';
import { TaxonomyModule } from '../taxonomy.module';

@Module({ imports: [TaxonomyModule], exports: [TaxonomyModule] })
export class TaxonomyHttpPublicModule {}
