import { VoteApi } from "@/shared/interactions/vote/api/vote.api.ts";
import type {
  SyncMyVotes,
  SyncedVote,
  VoteSetResult,
} from "@/shared/interactions/vote/types/vote.type.ts";
import type { ApiResult } from "@/shared/api";
import {
  getSessionScope,
  isAuthenticatedSessionScope,
} from "@/features/auth/public/session.ts";

export type VoteInput = { resourceId: string; active: boolean };
export type VoteQuery = { resourceIds?: string[] };
export type InteractionRequestOptions = { signal?: AbortSignal };

function withCurrentSession(
  options?: InteractionRequestOptions,
): InteractionRequestOptions | undefined {
  if (options?.signal) return options;
  const scope = getSessionScope();
  return isAuthenticatedSessionScope(scope.accountId)
    ? { signal: scope.signal }
    : options;
}

const authenticationRequired = <T>(): ApiResult<T> => ({
  error: { code: "AUTHENTICATION_REQUIRED" },
});
const emptySync: SyncMyVotes = {
  items: [],
  syncedThrough: new Date(0).toISOString(),
};

export const setVote = (
  input: VoteInput,
  options?: InteractionRequestOptions,
): Promise<ApiResult<VoteSetResult>> => {
  if (!isAuthenticatedSessionScope())
    return Promise.resolve(authenticationRequired<VoteSetResult>());
  return input.active
    ? VoteApi.set(input.resourceId, withCurrentSession(options))
    : VoteApi.remove(input.resourceId, withCurrentSession(options));
};

export const removeVote = (
  resourceId: string,
  options?: InteractionRequestOptions,
): Promise<ApiResult<VoteSetResult>> => {
  if (!isAuthenticatedSessionScope())
    return Promise.resolve(authenticationRequired<VoteSetResult>());
  return VoteApi.remove(resourceId, withCurrentSession(options));
};

export async function listVotes(
  query: VoteQuery = {},
  options?: InteractionRequestOptions,
): Promise<SyncedVote[]> {
  if (!isAuthenticatedSessionScope()) return [];
  const result = await VoteApi.sync(undefined, withCurrentSession(options));
  const votes = result.data?.data?.items ?? [];
  return query.resourceIds?.length
    ? votes.filter((vote) => query.resourceIds!.includes(vote.resourceId))
    : votes;
}

export const syncMyVotes = (
  updatedAfter?: string,
  options?: InteractionRequestOptions,
) =>
  isAuthenticatedSessionScope()
    ? VoteApi.sync(updatedAfter, withCurrentSession(options))
    : Promise.resolve({ data: { data: emptySync } } as ApiResult<SyncMyVotes>);
