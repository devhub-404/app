import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { AccountWriteRepository } from '@/modules/account/application/account/ports/account.write.repository';

@Injectable()
export class UnbanAccountCommand {
  constructor(private readonly userRepository: AccountWriteRepository) {}
  async execute(userId: string): Promise<void> {
    const account = await this.userRepository.findAggregateById(userId);
    if (!account) throw new AppError('USER_NOT_FOUND');
    account.unban();
    if (!(await this.userRepository.saveAggregate(account))) throw new AppError('USER_NOT_FOUND');
  }
}
