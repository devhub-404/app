import { Module } from '@nestjs/common';
import { VoteModule } from '@/modules/vote/vote.module';
@Module({ imports: [VoteModule], exports: [VoteModule] })
export class VoteHttpPublicModule {}
