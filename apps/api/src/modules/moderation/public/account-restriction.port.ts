export const RESTRICTION_CAPABILITIES = ['CONTRIBUTION', 'COMMENT', 'VOTE', 'JOB_PUBLISH'] as const;
export type RestrictionCapability = (typeof RESTRICTION_CAPABILITIES)[number];

export abstract class ModerationAccountRestrictionPort {
  abstract assertAccountCapability(accountId: string, capability: RestrictionCapability): Promise<void>;
}

export const MODERATION_ACCOUNT_RESTRICTION = 'MODERATION_ACCOUNT_RESTRICTION';
