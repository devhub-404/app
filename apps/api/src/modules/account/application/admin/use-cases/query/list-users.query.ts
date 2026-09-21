import { Injectable } from '@nestjs/common';
import { AccountListQueryRepository } from '@/modules/account/application/admin/ports/account-list.query.repository';
import type { PaginatedAccountsDTO } from '@/modules/account/application/admin/dtos/out';

@Injectable()
export class ListAccountsQuery {
  constructor(private readonly userListQueryRepository: AccountListQueryRepository) {}

  async execute(page: number, pageSize: number): Promise<PaginatedAccountsDTO> {
    const offset = (page - 1) * pageSize;
    const result = await this.userListQueryRepository.list(offset, pageSize);

    return {
      data: result.data.map((row) => ({
        id: row.id,
        voluntaryStatus: row.voluntaryStatus,
        moderationStatus: row.moderationStatus,
        deletionStatus: row.deletionStatus,
        deletionRequestedAt: row.deletionRequestedAt,
        status: row.status,
        mfaEnabled: row.mfaEnabled,
        lockedUntil: row.lockedUntil,
        email: row.email,
        username: row.username,
        role: row.role,
        createdAt: row.createdAt,
      })),
      total: result.total,
      page,
      pageSize,
    };
  }

  async findById(userId: string) {
    return this.userListQueryRepository.findById(userId);
  }
}

/** Canonical semantic alias used by the account reference contract. */
@Injectable()
export class GetAccountByIdQuery extends ListAccountsQuery {}
