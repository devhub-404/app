import { Injectable } from '@nestjs/common';
import { NewsQueryRepository } from '@/modules/news/application/ports/repositories/news.query.repository';
@Injectable()
export class ListPopularNewsSourcesQuery {
  constructor(private readonly repository: NewsQueryRepository) {}
  execute(limit?: number) {
    return this.repository.listPopularSources(limit);
  }
}
