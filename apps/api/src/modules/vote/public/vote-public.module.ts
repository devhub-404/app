import { Module } from '@nestjs/common';
import { VoteModule } from '@/modules/vote/vote.module';
import { VoteReadPort } from './vote-read.port';
import { VoteReadService } from './vote-read.service';

@Module({
  imports: [VoteModule],
  providers: [{ provide: VoteReadPort, useClass: VoteReadService }],
  exports: [VoteReadPort],
})
export class VotePublicModule {}
