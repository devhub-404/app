import { FollowApi } from '@/features/follow/api/follow.api.ts';
import type { FollowedTag } from '@/features/follow/types/follow.type.ts';

function normalizeFollowedTags(input: unknown): FollowedTag[] {
  const payload = input && typeof input === 'object' && 'data' in input ? (input as { data?: unknown }).data : input;
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : [];

  return source.flatMap((item) => {
    if (typeof item === 'string') return [{ slug: item, name: item }];
    if (!item || typeof item !== 'object') return [];
    const value = item as Record<string, unknown>;
    const slug = typeof value['slug'] === 'string' ? value['slug'] : null;
    if (!slug) return [];
    return [{ slug, name: typeof value['name'] === 'string' ? value['name'] : slug }];
  });
}

async function command(task: () => Promise<{ error?: unknown }>): Promise<boolean> {
  try {
    return !(await task()).error;
  } catch {
    return false;
  }
}

export async function listFollowedTags(): Promise<FollowedTag[]> {
  const { data, error } = await FollowApi.list();
  if (error) return [];
  return normalizeFollowedTags(data?.data);
}

export function followTag(slug: string) {
  return command(() => FollowApi.follow(slug));
}

export function unfollowTag(slug: string) {
  return command(() => FollowApi.unfollow(slug));
}
