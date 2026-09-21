import { Injectable } from '@nestjs/common';
import { ProfileQueryRepository } from '../application/profile/ports/profile.query.repository';
import { AccountProfileReadPort, type AccountProfileSummary } from './account-profile-read.port';

@Injectable()
export class AccountProfileReadService implements AccountProfileReadPort {
  constructor(private readonly profiles: ProfileQueryRepository) {}

  async getProfilesByAccountIds(accountIds: string[]): Promise<Record<string, AccountProfileSummary>> {
    const ids = [...new Set(accountIds.filter(Boolean))];
    const rows = await this.profiles.findByUserIds(ids);
    const entries = rows.flatMap((profile) =>
      profile
        ? [
            [
              profile.userId,
              {
                userId: profile.userId,
                username: profile.username,
                displayName: profile.displayName ?? '',
                avatarUrl: profile.avatarUrl ?? null,
              },
            ] as const,
          ]
        : [],
    );

    return Object.fromEntries(entries) as Record<string, AccountProfileSummary>;
  }
}
