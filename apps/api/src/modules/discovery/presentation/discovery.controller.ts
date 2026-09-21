import { Controller, Get, Param, Query, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/modules/auth/public/http';
import { GetFeedInputDTO } from '@/modules/discovery/application/dtos/in';
import { GetFeedOutputDTO } from '@/modules/discovery/application/dtos/out';
import { GetRelatedContentPathDTO, GetRelatedContentQueryDTO } from '@/modules/discovery/application/dtos/in';
import { GetRelatedContentOutputDTO } from '@/modules/discovery/application/dtos/out';
import { ListTrendingContentInputDTO } from '@/modules/discovery/application/dtos/in';
import { ListTrendingContentOutputDTO } from '@/modules/discovery/application/dtos/out';
import { SearchExploreInputDTO } from '@/modules/discovery/application/dtos/in';
import { SearchExploreOutputDTO } from '@/modules/discovery/application/dtos/out';
import { ListPopularContentInputDTO } from '@/modules/discovery/application/dtos/in';
import { ListPopularContentOutputDTO } from '@/modules/discovery/application/dtos/out';
import { ListRecentContentInputDTO } from '@/modules/discovery/application/dtos/in';
import { ListRecentContentOutputDTO } from '@/modules/discovery/application/dtos/out';
import { GetFeedQuery } from '@/modules/discovery/application/use-cases/get-feed.query';
import { GetRelatedContentQuery } from '@/modules/discovery/application/use-cases/get-related-content.query';
import { ListTrendingContentQuery } from '@/modules/discovery/application/use-cases/list-trending-content.query';
import { SearchExploreQuery } from '@/modules/discovery/application/use-cases/search-explore.query';
import { ListPopularContentQuery } from '@/modules/discovery/application/use-cases/list-popular-content.query';
import { ListRecentContentQuery } from '@/modules/discovery/application/use-cases/list-recent-content.query';

@Controller('discovery')
@UseGuards(AuthGuard)
export class DiscoveryController {
  constructor(
    private readonly searchExplore: SearchExploreQuery,
    private readonly getFeed: GetFeedQuery,
    private readonly listTrendingContent: ListTrendingContentQuery,
    private readonly listPopularContent: ListPopularContentQuery,
    private readonly listRecentContent: ListRecentContentQuery,
    private readonly getRelatedContent: GetRelatedContentQuery,
  ) {}

  @Version('1')
  @Get('search')
  @Public()
  @AppResponse('DISCOVERY_LISTED', SearchExploreOutputDTO)
  search(@Query() query: SearchExploreInputDTO) {
    return this.searchExplore.execute(query);
  }

  @Version('1')
  @Get('feed')
  @Public()
  @AppResponse('DISCOVERY_LISTED', GetFeedOutputDTO)
  feed(@Query() query: GetFeedInputDTO, @User('id') accountId?: string | null) {
    return this.getFeed.execute(query, accountId);
  }

  @Version('1')
  @Get('trending')
  @Public()
  @AppResponse('DISCOVERY_LISTED', ListTrendingContentOutputDTO)
  trending(@Query() query: ListTrendingContentInputDTO) {
    return this.listTrendingContent.execute(query);
  }

  @Version('1')
  @Get('popular')
  @Public()
  @AppResponse('DISCOVERY_LISTED', ListPopularContentOutputDTO)
  popular(@Query() query: ListPopularContentInputDTO) {
    return this.listPopularContent.execute(query);
  }

  @Version('1')
  @Get('recent')
  @Public()
  @AppResponse('DISCOVERY_LISTED', ListRecentContentOutputDTO)
  recent(@Query() query: ListRecentContentInputDTO) {
    return this.listRecentContent.execute(query);
  }

  @Version('1')
  @Get('related/:resourceId')
  @Public()
  @AppResponse('DISCOVERY_LISTED', GetRelatedContentOutputDTO)
  related(@Param() params: GetRelatedContentPathDTO, @Query() query: GetRelatedContentQueryDTO) {
    return this.getRelatedContent.execute({ ...params, ...query });
  }
}
