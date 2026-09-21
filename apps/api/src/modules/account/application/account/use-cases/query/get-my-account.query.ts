import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { AccountQueryRepository } from '@/modules/account/application/ports/account.query.repository';
import { AccountEmailQueryRepository } from '@/modules/account/application/ports/account-email.query.repository';
import { ProfileQueryRepository } from '@/modules/account/application/profile/ports/profile.query.repository';
import { PreferencesQueryRepository } from '@/modules/account/application/preferences/ports/preferences.query.repository';
import { RoleRepository } from '@/modules/account/application/admin/ports/role.repository';
import { AccountDetailsDTO } from '@/modules/account/application/account/dtos/out/account-details.dto';

@Injectable()
export class GetMyAccountQuery {
  constructor(
    private readonly userQueryRepository: AccountQueryRepository,
    private readonly userEmailRepository: AccountEmailQueryRepository,
    private readonly profileQueryRepository: ProfileQueryRepository,
    private readonly preferencesQueryRepository: PreferencesQueryRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(userId: string): Promise<AccountDetailsDTO> {
    const [account, emails, profile, preferences, role] = await Promise.all([
      this.userQueryRepository.findById(userId),
      this.userEmailRepository.listByUserId(userId),
      this.profileQueryRepository.findByUserId(userId),
      this.preferencesQueryRepository.findByUserId(userId),
      this.roleRepository.findNameByUserId(userId),
    ]);

    if (!account) throw new AppError('USER_NOT_FOUND');

    return {
      account: {
        ...account,
      },
      emails: emails.map((email) => ({
        id: email.id,
        accountId: email.userId,
        email: email.email,
        type: email.type,
        verifiedAt: email.verifiedAt,
        createdAt: email.createdAt,
      })),
      profile,
      preferences,
      role,
    };
  }
}
