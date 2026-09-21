import { GetAccountStandingInputDTO, GetAccountStandingOutputDTO } from '@/modules/moderation/application/dtos';
import { Injectable } from '@nestjs/common';
import { AccountRestrictionPort } from '@/modules/moderation/application/ports/account-restriction.port';

@Injectable()
export class GetAccountStandingQuery {
  constructor(private readonly restrictions: AccountRestrictionPort) {}

  async execute(input: GetAccountStandingInputDTO): Promise<GetAccountStandingOutputDTO> {
    const restrictions = await this.restrictions.list(input.accountId);
    const now = Date.now();
    const current = restrictions.filter((item) => {
      const starts = Date.parse(item.startsAt);
      const ends = item.endsAt ? Date.parse(item.endsAt) : null;

      return item.revokedAt === null && starts <= now && (ends === null || now < ends);
    });

    return { accountId: input.accountId, standing: current.length ? 'restricted' : 'clear', restrictions };
  }
}
