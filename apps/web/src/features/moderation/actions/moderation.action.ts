import { ModerationApi } from '@/features/moderation/api/moderation.api.ts';
import type { HiddenContentItem } from '@/features/moderation/types/moderation.type.ts';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import { canRestoreHiddenContent } from '@/features/moderation/access/moderation.access.ts';

function normalizeHidden(input: unknown): HiddenContentItem[] {
  const payload = input && typeof input === 'object' && 'data' in input ? (input as { data?: unknown }).data : input;
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : [];
  return source.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const value = entry as Record<string, unknown>;
    const id =
      typeof value['id'] === 'string'
        ? value['id']
        : typeof value['commentId'] === 'string'
          ? value['commentId']
          : typeof value['resourceId'] === 'string'
            ? value['resourceId']
            : null;
    if (!id) return [];
    const resourceId = typeof value['resourceId'] === 'string' ? value['resourceId'] : undefined;
    const kind =
      typeof value['kind'] === 'string'
        ? value['kind']
        : typeof value['type'] === 'string'
          ? value['type']
          : resourceId
            ? 'resource'
            : 'comment';
    const title =
      typeof value['title'] === 'string'
        ? value['title']
        : typeof value['content'] === 'string'
          ? value['content'].slice(0, 100)
          : `${kind} #${index + 1}`;
    return [
      { id, resourceId, kind, title, hiddenAt: typeof value['hiddenAt'] === 'string' ? value['hiddenAt'] : undefined },
    ];
  });
}

export async function listHiddenContent() {
  if (!isClientAccessAllowed(canRestoreHiddenContent)) return { items: [], error: { code: 'AUTHORIZATION_REQUIRED' } };
  const { data, error } = await ModerationApi.listHidden();
  return { items: normalizeHidden(data?.data), error };
}

export async function restoreHiddenItem(item: HiddenContentItem): Promise<boolean> {
  if (!isClientAccessAllowed(canRestoreHiddenContent)) return false;
  try {
    const result = item.kind.toLowerCase().includes('comment')
      ? await ModerationApi.unhideComment(item.id)
      : await ModerationApi.unhideResource(item.resourceId ?? item.id);
    return !result.error;
  } catch {
    return false;
  }
}
