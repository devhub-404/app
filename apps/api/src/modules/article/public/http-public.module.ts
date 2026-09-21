import { Module } from '@nestjs/common';
import { ArticleModule } from '../article.module';

@Module({ imports: [ArticleModule], exports: [ArticleModule] })
export class ArticleHttpPublicModule {}
