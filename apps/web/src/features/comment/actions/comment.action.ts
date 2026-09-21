import { CommentApi } from '@/features/comment/api/comment.api.ts';
import type { CreateCommentDTO, ListCommentsQuery, UpdateCommentDTO } from '@/features/comment/types/comment.type.ts';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import { canModerateComments } from '@/features/comment/access/comment.access.ts';

const canUseCommentModeration = () => isClientAccessAllowed(canModerateComments);

async function command(task: () => Promise<{ error?: { code?: string } }>): Promise<boolean> {
  try {
    const result = await task();
    return !result.error;
  } catch {
    return false;
  }
}

export async function listComments(targetType: 'article' | 'news', contentId: string) {
  const { data, error } = await CommentApi.list(targetType, contentId);
  if (error) return [];
  const items = data?.data ?? [];
  return Array.isArray(items) ? items : [];
}

export const createComment = (targetType: 'article' | 'news', contentId: string, payload: CreateCommentDTO) =>
  command(() => CommentApi.create(targetType, contentId, payload));

export const updateComment = (id: string, payload: UpdateCommentDTO) => command(() => CommentApi.update(id, payload));

export const deleteComment = (id: string) => command(() => CommentApi.remove(id));
export const hideComment = (id: string) =>
  canUseCommentModeration() ? command(() => CommentApi.hide(id)) : Promise.resolve(false);
export const unhideComment = (id: string) =>
  canUseCommentModeration() ? command(() => CommentApi.unhide(id)) : Promise.resolve(false);

export const listMyComments = (query?: ListCommentsQuery) => CommentApi.listMine(query);

export const listCommentsForAdministration = (query?: ListCommentsQuery) =>
  canUseCommentModeration()
    ? CommentApi.listForAdministration(query)
    : Promise.resolve({ data: { data: { items: [], page: 1, pageSize: 0, total: 0 } } });
