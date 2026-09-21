import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { AccountRestrictionPublicModule } from '@/modules/moderation/public/account-restriction-public.module';
import { ArticlePublicModule } from '@/modules/article/public/article-public.module';
import { ExternalResourcePublicModule } from '@/modules/external-resource/public/resource-public.module';
import { QAndAPublicModule } from '@/modules/q-and-a/public/q-and-a-public.module';
import { ProjectPublicModule } from '@/modules/project/public/project-public.module';
import { VoteTargetAccessService } from './application/votes/vote-target-access.service';
import { VoteRepository } from './application/ports/repositories/vote.repository';
import { VoteQueryRepository } from './application/ports/repositories/vote.query.repository';
import { VoteStatisticsRepository } from './application/ports/repositories/vote-statistics.repository';
import { DrizzleVoteRepository } from './infrastructure/votes/vote.repository';
import { DrizzleVoteQueryRepository } from './infrastructure/votes/vote.query.repository';
import { DrizzleVoteStatisticsRepository } from './infrastructure/votes/vote-statistics.repository';
import { ListMyVotesQuery } from './application/use-cases/query/list-my-votes.query';
import { VoteController } from './presentation/vote.controller';
import { SetVoteCommand } from './application/use-cases/command/set-vote.command';
import { RemoveVoteCommand } from './application/use-cases/command/remove-vote.command';
import { GetVoteStatsQuery } from './application/use-cases/query/get-vote-stats.query';
import { SyncMyVotesQuery } from './application/use-cases/query/sync-my-votes.query';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    AccountRestrictionPublicModule,
    ArticlePublicModule,
    ExternalResourcePublicModule,
    QAndAPublicModule,
    ProjectPublicModule,
  ],
  providers: [
    { provide: VoteRepository, useClass: DrizzleVoteRepository },
    { provide: VoteQueryRepository, useClass: DrizzleVoteQueryRepository },
    { provide: VoteStatisticsRepository, useClass: DrizzleVoteStatisticsRepository },
    ListMyVotesQuery,
    SetVoteCommand,
    RemoveVoteCommand,
    GetVoteStatsQuery,
    SyncMyVotesQuery,
    VoteTargetAccessService,
  ],
  exports: [VoteRepository, VoteQueryRepository],
  controllers: [VoteController],
})
export class VoteModule {}
