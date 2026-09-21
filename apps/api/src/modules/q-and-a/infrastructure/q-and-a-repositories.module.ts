import { AccountProfileReadModule } from '@/modules/account/public/account-profile-read.module';
import { Module } from '@nestjs/common';
import { QAndARepository } from '../application/ports/repositories/q-and-a.repository';
import { QAndAQueryRepository } from '../application/ports/repositories/q-and-a.query.repository';
import { DrizzleQAndARepository } from './repositories/q-and-a.repository';

@Module({
  imports: [AccountProfileReadModule],
  providers: [
    { provide: QAndARepository, useClass: DrizzleQAndARepository },
    { provide: QAndAQueryRepository, useExisting: QAndARepository },
  ],
  exports: [QAndARepository, QAndAQueryRepository],
})
export class QAndARepositoriesModule {}
