export type NotificationType =
  | 'question_answered'
  | 'answer_selected'
  | 'article_commented'
  | 'resource_reviewed'
  | 'restriction_applied'
  | 'restriction_revoked'
  | 'job_expiring'
  | 'job_changed';

export type NotificationReferenceType =
  | 'account'
  | 'answer'
  | 'article'
  | 'comment'
  | 'job'
  | 'news'
  | 'project'
  | 'question'
  | 'report'
  | 'resource'
  | 'restriction';

export type NotificationRecord = {
  id: string;
  accountId: string;
  type: NotificationType;
  targetType: NotificationReferenceType | null;
  targetId: string | null;
  sourceType: NotificationReferenceType | null;
  sourceId: string | null;
  seenAt: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationCursor = {
  createdAt: string;
  id: string;
};

export type NotificationCreateInput = Pick<NotificationRecord, 'accountId' | 'type'> &
  Partial<Pick<NotificationRecord, 'targetType' | 'targetId' | 'sourceType' | 'sourceId'>>;

export class Notification {
  private constructor(private readonly state: NotificationRecord) {}

  static create(id: string, input: NotificationCreateInput, at = new Date()): Notification {
    const sourceType = input.sourceType ?? null;
    const sourceId = input.sourceId ?? null;
    const targetType = input.targetType ?? null;
    const targetId = input.targetId ?? null;
    if ((sourceType === null) !== (sourceId === null))
      throw new DomainError('NOTIFICATION_SOURCE_REFERENCE_INCOMPLETE');
    if ((targetType === null) !== (targetId === null))
      throw new DomainError('NOTIFICATION_TARGET_REFERENCE_INCOMPLETE');

    return new Notification({
      id,
      accountId: input.accountId,
      type: input.type,
      targetType,
      targetId,
      sourceType,
      sourceId,
      seenAt: null,
      readAt: null,
      createdAt: at.toISOString(),
    });
  }

  static rehydrate(state: NotificationRecord): Notification {
    return new Notification({ ...state });
  }

  get value(): NotificationRecord {
    return { ...this.state };
  }

  markSeen(at = new Date()): void {
    if (this.state.seenAt === null) this.state.seenAt = at.toISOString();
  }

  markRead(at = new Date()): void {
    if (this.state.readAt === null) this.state.readAt = at.toISOString();
  }
}
import { DomainError } from '@/shared/errors/domain-error';
