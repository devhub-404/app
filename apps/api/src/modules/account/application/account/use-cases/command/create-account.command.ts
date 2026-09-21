import { Injectable } from '@nestjs/common';
import { AccountRepository } from '@/modules/account/application/ports/account.repository';

@Injectable()
export class CreateAccountCommand {
  constructor(private readonly userRepository: AccountRepository) {}

  async execute(email?: string | null): Promise<string> {
    return await this.userRepository.create({ email: email ?? null });
  }
}
