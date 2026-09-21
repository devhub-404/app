export type AccountProfileSummary = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export abstract class AccountProfileReadPort {
  abstract getProfilesByAccountIds(accountIds: string[]): Promise<Record<string, AccountProfileSummary>>;
}
