import { Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { DiscoveryController } from '@/modules/discovery/presentation/discovery.controller';
import { DiscoveryReadPort } from '@/modules/discovery/application/ports';
import { DrizzleDiscoveryReadService } from '@/modules/discovery/infrastructure/services/drizzle-discovery-read.service';
import { GetFeedQuery } from '@/modules/discovery/application/use-cases/get-feed.query';
import { GetRelatedContentQuery } from '@/modules/discovery/application/use-cases/get-related-content.query';
import { ListTrendingContentQuery } from '@/modules/discovery/application/use-cases/list-trending-content.query';
import { SearchExploreQuery } from '@/modules/discovery/application/use-cases/search-explore.query';
import { ListPopularContentQuery } from '@/modules/discovery/application/use-cases/list-popular-content.query';
import { ListRecentContentQuery } from '@/modules/discovery/application/use-cases/list-recent-content.query';
@Module({
  imports: [AuthPublicModule],
  controllers: [DiscoveryController],
  providers: [
    { provide: DiscoveryReadPort, useClass: DrizzleDiscoveryReadService },
    SearchExploreQuery,
    GetFeedQuery,
    ListTrendingContentQuery,
    ListPopularContentQuery,
    ListRecentContentQuery,
    GetRelatedContentQuery,
  ],
})
export class DiscoveryModule {}
