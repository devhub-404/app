import { Module } from '@nestjs/common';
import { ExternalResourceModule } from '../external-resource.module';

@Module({ imports: [ExternalResourceModule], exports: [ExternalResourceModule] })
export class ExternalResourceHttpPublicModule {}
