import type { Comment } from '@/modules/comment/domain/comment';

export abstract class CommentRepository {
  abstract findById(id: string): Promise<Comment | null>;
  abstract create(comment: Comment): Promise<string>;
  abstract updateContent(comment: Comment): Promise<void>;
  abstract updateVisibility(comment: Comment, expectedHiddenAt: string | null): Promise<boolean>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
  abstract delete(comment: Comment): Promise<void>;
  abstract purgeByResourceId(resourceId: string): Promise<number>;
  abstract rebuildStatistics(resourceId?: string): Promise<void>;
}
