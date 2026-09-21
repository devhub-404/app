import { Module } from '@nestjs/common';
import { ReportModule } from '../report.module';

@Module({ imports: [ReportModule], exports: [ReportModule] })
export class ReportHttpPublicModule {}
