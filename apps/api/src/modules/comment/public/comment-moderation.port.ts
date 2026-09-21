export type CommentModerationTarget = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  hiddenAt: string | null;
};

export abstract class CommentModerationPort {
  abstract resolve(id: string): Promise<CommentModerationTarget | null>;
  abstract apply(id: string, action: 'hide_comment' | 'unhide_comment'): Promise<void>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
}
