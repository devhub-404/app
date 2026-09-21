import { Module } from '@nestjs/common';
import { ProjectModule } from '../project.module';

@Module({ imports: [ProjectModule], exports: [ProjectModule] })
export class ProjectHttpPublicModule {}
