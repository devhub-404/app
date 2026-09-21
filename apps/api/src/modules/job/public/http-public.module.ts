import { Module } from '@nestjs/common';
import { JobModule } from '../job.module';

@Module({ imports: [JobModule], exports: [JobModule] })
export class JobHttpPublicModule {}
