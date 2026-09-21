import { Module } from '@nestjs/common';
import { NewsModule } from '../news.module';

@Module({ imports: [NewsModule], exports: [NewsModule] })
export class NewsHttpPublicModule {}
